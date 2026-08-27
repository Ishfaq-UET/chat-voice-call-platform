<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Call;
use App\Models\Conversation;
use App\Models\ManualTopUpRequest;
use App\Models\Message;
use App\Models\NameChangeRequest;
use App\Models\User;
use App\Models\VerificationRequest;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $feeTypes = ['chat_fee', 'voice_fee', 'image_fee', 'call_fee'];

        $revenue = $this->sumAbsAmount($feeTypes);
        $commission = (float) Call::query()->sum('commission_amount')
            + (float) Message::query()->sum('commission_amount');

        $activity = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = Carbon::now()->subDays($i);
            $start = $day->copy()->startOfDay();
            $end = $day->copy()->endOfDay();

            $activity[] = [
                'label' => $day->format('D'),
                'calls' => Call::query()->whereBetween('created_at', [$start, $end])->count(),
                'messages' => Message::query()->whereBetween('created_at', [$start, $end])->count(),
                'revenue' => $this->sumAbsAmount($feeTypes, $start, $end),
            ];
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'users' => User::query()->where('role', '!=', 'admin')->count(),
                'males' => User::query()->where('role', 'male')->count(),
                'females' => User::query()->where('role', 'female')->count(),
                'pending_verifications' => VerificationRequest::query()->where('status', 'pending')->count(),
                'pending_name_changes' => NameChangeRequest::query()->where('status', 'pending')->count(),
                'pending_withdrawals' => Withdrawal::query()->where('status', 'pending')->count(),
                'pending_top_ups' => ManualTopUpRequest::query()->where('status', 'pending')->count(),
                'conversations' => Conversation::query()->count(),
                'messages' => Message::query()->count(),
                'voice_notes' => Message::query()->where('type', 'voice')->count(),
                'calls' => Call::query()->count(),
                'active_calls' => Call::query()->whereIn('status', ['ringing', 'active'])->count(),
                'revenue' => $revenue,
                'commission' => $commission,
                'call_minutes' => (int) ceil(((int) Call::query()->sum('duration_seconds')) / 60),
                'call_revenue' => (float) Call::query()->sum('total_charged'),
            ],
            'charts' => [
                'activity' => $activity,
                'users' => [
                    ['label' => 'Members', 'value' => User::query()->where('role', 'male')->count(), 'color' => '#635bff'],
                    ['label' => 'Creators', 'value' => User::query()->where('role', 'female')->count(), 'color' => '#22c55e'],
                ],
                'revenue' => [
                    ['label' => 'Chat', 'value' => $this->sumAbsAmount(['chat_fee']), 'color' => '#635bff'],
                    ['label' => 'Voice', 'value' => $this->sumAbsAmount(['voice_fee']), 'color' => '#22c55e'],
                    ['label' => 'Calls', 'value' => $this->sumAbsAmount(['call_fee']), 'color' => '#f59e0b'],
                    ['label' => 'Images', 'value' => $this->sumAbsAmount(['image_fee']), 'color' => '#ec4899'],
                ],
            ],
            'recentCalls' => Call::query()
                ->with(['male:id,name,avatar', 'female:id,name,avatar'])
                ->latest()
                ->limit(5)
                ->get(),
            'recentMessages' => Message::query()
                ->with(['sender:id,name,role,avatar'])
                ->latest()
                ->limit(5)
                ->get(),
        ]);
    }

    /** @param list<string> $types */
    private function sumAbsAmount(array $types, ?Carbon $start = null, ?Carbon $end = null): float
    {
        $query = WalletTransaction::query()->whereIn('type', $types);

        if ($start && $end) {
            $query->whereBetween('created_at', [$start, $end]);
        }

        return round((float) $query->selectRaw('COALESCE(SUM(ABS(amount)), 0) as total')->value('total'), 2);
    }
}
