<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\Withdrawal;
use App\Services\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class WithdrawalController extends Controller
{
    public function index(Request $request, WalletService $wallets): Response
    {
        $user = $request->user()->load('femaleProfile');

        return Inertia::render('Female/Withdrawals', [
            'withdrawals' => $user->withdrawals()->latest()->paginate(15),
            'walletBalance' => (float) $wallets->ensureWallet($user)->balance,
            'minWithdrawal' => Setting::minWithdrawal(),
            'hasPending' => $user->withdrawals()->where('status', 'pending')->exists(),
            'bank' => [
                'bank_name' => $user->femaleProfile?->bank_name,
                'bank_account' => $user->femaleProfile?->bank_account,
                'bank_holder' => $user->femaleProfile?->bank_holder,
            ],
        ]);
    }

    public function store(Request $request, WalletService $wallets): RedirectResponse
    {
        $user = $request->user()->load('femaleProfile');
        abort_unless($user->isFemale(), 403);

        if ($user->withdrawals()->where('status', 'pending')->exists()) {
            return back()->withErrors([
                'amount' => 'You already have a pending withdrawal. Wait for it to be processed.',
            ]);
        }

        $min = Setting::minWithdrawal();
        $data = $request->validate([
            'amount' => ['required', 'numeric', "min:{$min}"],
        ]);

        $profile = $user->femaleProfile;
        if (! $profile?->bank_name || ! $profile?->bank_account || ! $profile?->bank_holder) {
            return back()->withErrors([
                'amount' => 'Please save complete bank details on your dashboard before withdrawing.',
            ]);
        }

        $amount = round((float) $data['amount'], 2);

        try {
            $withdrawal = Withdrawal::query()->create([
                'user_id' => $user->id,
                'amount' => $amount,
                'status' => 'pending',
                'bank_name' => $profile->bank_name,
                'bank_account' => $profile->bank_account,
                'bank_holder' => $profile->bank_holder,
            ]);

            $wallets->debit(
                $user,
                $amount,
                'withdrawal',
                'Manual withdrawal request #'.$withdrawal->id,
                $withdrawal,
            );
        } catch (RuntimeException $e) {
            return back()->withErrors(['amount' => $e->getMessage()]);
        }

        return back()->with(
            'success',
            'Withdrawal requested. An admin will transfer funds to your bank account manually.',
        );
    }
}
