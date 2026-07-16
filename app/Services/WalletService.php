<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class WalletService
{
    public function ensureWallet(User $user): Wallet
    {
        return Wallet::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0],
        );
    }

    public function credit(
        User $user,
        float $amount,
        string $type,
        string $description,
        ?Model $related = null,
        array $meta = [],
    ): WalletTransaction {
        return DB::transaction(function () use ($user, $amount, $type, $description, $related, $meta) {
            $wallet = Wallet::query()->where('user_id', $user->id)->lockForUpdate()->first()
                ?? $this->ensureWallet($user)->fresh();

            $wallet = Wallet::query()->where('id', $wallet->id)->lockForUpdate()->firstOrFail();
            $wallet->balance = (float) $wallet->balance + $amount;
            $wallet->save();

            return $wallet->transactions()->create([
                'type' => $type,
                'amount' => $amount,
                'balance_after' => $wallet->balance,
                'related_type' => $related?->getMorphClass(),
                'related_id' => $related?->getKey(),
                'description' => $description,
                'meta' => $meta,
            ]);
        });
    }

    public function debit(
        User $user,
        float $amount,
        string $type,
        string $description,
        ?Model $related = null,
        array $meta = [],
    ): WalletTransaction {
        return DB::transaction(function () use ($user, $amount, $type, $description, $related, $meta) {
            $wallet = Wallet::query()->where('user_id', $user->id)->lockForUpdate()->firstOrFail();

            if ((float) $wallet->balance < $amount) {
                throw new RuntimeException('Insufficient wallet balance.');
            }

            $wallet->balance = (float) $wallet->balance - $amount;
            $wallet->save();

            return $wallet->transactions()->create([
                'type' => $type,
                'amount' => -$amount,
                'balance_after' => $wallet->balance,
                'related_type' => $related?->getMorphClass(),
                'related_id' => $related?->getKey(),
                'description' => $description,
                'meta' => $meta,
            ]);
        });
    }

    /**
     * Charge male and credit female after commission.
     *
     * @return array{charged: float, commission: float, earning: float}
     */
    public function chargeInteraction(
        User $male,
        User $female,
        float $amount,
        string $feeType,
        string $description,
        ?Model $related = null,
    ): array {
        $commissionPercent = Setting::commissionPercent();
        $commission = round($amount * ($commissionPercent / 100), 2);
        $earning = round($amount - $commission, 2);

        DB::transaction(function () use ($male, $female, $amount, $feeType, $description, $related, $commission, $earning) {
            $this->debit($male, $amount, $feeType, $description, $related, [
                'commission' => $commission,
                'female_id' => $female->id,
            ]);

            $this->credit($female, $earning, 'earning', $description, $related, [
                'gross' => $amount,
                'commission' => $commission,
                'male_id' => $male->id,
            ]);
        });

        return [
            'charged' => $amount,
            'commission' => $commission,
            'earning' => $earning,
        ];
    }

    public function hasBalance(User $user, float $amount): bool
    {
        $wallet = $this->ensureWallet($user);

        return (float) $wallet->balance >= $amount;
    }
}
