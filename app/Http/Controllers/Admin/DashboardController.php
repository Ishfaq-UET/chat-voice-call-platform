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
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $revenue = (float) WalletTransaction::query()
            ->whereIn('type', ['chat_fee', 'voice_fee', 'image_fee', 'call_fee'])
            ->selectRaw('COALESCE(SUM(ABS(amount)), 0) as total')
            ->value('total');

        $commission = (float) Call::query()->sum('commission_amount')
            + (float) Message::query()->sum('commission_amount');

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
            'recentCalls' => Call::query()
                ->with(['male:id,name', 'female:id,name'])
                ->latest()
                ->limit(5)
                ->get(),
            'recentMessages' => Message::query()
                ->with(['sender:id,name,role', 'conversation.male:id,name', 'conversation.female:id,name'])
                ->latest()
                ->limit(5)
                ->get(),
        ]);
    }
}
