<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Call;
use App\Models\Setting;
use App\Models\User;
use App\Models\VerificationRequest;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use App\Services\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            + (float) \App\Models\Message::query()->sum('commission_amount');

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'users' => User::query()->where('role', '!=', 'admin')->count(),
                'males' => User::query()->where('role', 'male')->count(),
                'females' => User::query()->where('role', 'female')->count(),
                'pending_verifications' => VerificationRequest::query()->where('status', 'pending')->count(),
                'pending_withdrawals' => Withdrawal::query()->where('status', 'pending')->count(),
                'revenue' => $revenue,
                'commission' => $commission,
                'call_minutes' => (int) ceil(((int) Call::query()->sum('duration_seconds')) / 60),
            ],
        ]);
    }
}
