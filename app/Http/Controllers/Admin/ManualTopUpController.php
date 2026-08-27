<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\UserStatusMail;
use App\Models\ManualTopUpRequest;
use App\Services\WalletService;
use App\Support\PlatformMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ManualTopUpController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'pending');

        $requests = ManualTopUpRequest::query()
            ->with([
                'user:id,name,email,phone,avatar,role,country_code',
                'reviewer:id,name',
                'paymentMethod',
            ])
            ->when(
                $status !== 'all',
                fn ($q) => $q->where('status', $status),
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/TopUps/Index', [
            'requests' => $requests,
            'filters' => ['status' => $status],
            'counts' => [
                'pending' => ManualTopUpRequest::query()->where('status', 'pending')->count(),
                'approved' => ManualTopUpRequest::query()->where('status', 'approved')->count(),
                'rejected' => ManualTopUpRequest::query()->where('status', 'rejected')->count(),
                'all' => ManualTopUpRequest::query()->count(),
            ],
        ]);
    }

    public function approve(Request $request, ManualTopUpRequest $topUp, WalletService $wallets): RedirectResponse
    {
        abort_unless($topUp->status === 'pending', 422);

        $data = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
            'credited_amount' => ['nullable', 'numeric', 'min:0.01', 'max:500'],
        ]);

        $amount = round((float) ($data['credited_amount'] ?? $topUp->amount), 2);

        $wallets->credit(
            $topUp->user,
            $amount,
            'top_up',
            'Manual payment approved (TID: '.$topUp->transaction_id.')',
            $topUp,
            [
                'source' => 'manual_top_up',
                'payment_method_id' => $topUp->payment_method_id,
                'payment_channel' => $topUp->payment_channel,
                'transaction_id' => $topUp->transaction_id,
                'sender_number' => $topUp->sender_number,
                'receiver_account' => $topUp->receiver_account,
                'admin_id' => $request->user()->id,
                'request_id' => $topUp->id,
            ],
        );

        $topUp->update([
            'status' => 'approved',
            'amount' => $amount,
            'admin_notes' => $data['admin_notes'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $topUp->loadMissing('user');

        PlatformMail::send($topUp->user, new UserStatusMail(
            user: $topUp->user,
            subjectLine: 'Top-up approved',
            headline: 'Your wallet was credited',
            body: number_format($amount, 2).' was added to your wallet for top-up request #'.$topUp->id.'.',
            actionUrl: route('wallet.index'),
            actionLabel: 'Open wallet',
        ));

        return back()->with('success', '$'.number_format($amount, 2).' credited to '.$topUp->user->name.'.');
    }

    public function reject(Request $request, ManualTopUpRequest $topUp): RedirectResponse
    {
        abort_unless($topUp->status === 'pending', 422);

        $data = $request->validate([
            'admin_notes' => ['required', 'string', 'max:1000'],
        ]);

        $topUp->update([
            'status' => 'rejected',
            'admin_notes' => $data['admin_notes'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $topUp->loadMissing('user');

        PlatformMail::send($topUp->user, new UserStatusMail(
            user: $topUp->user,
            subjectLine: 'Top-up rejected',
            headline: 'Your top-up request was rejected',
            body: 'Top-up request #'.$topUp->id.' was rejected. Note: '.$data['admin_notes'],
            actionUrl: route('wallet.index'),
            actionLabel: 'Open wallet',
        ));

        return back()->with('success', 'Manual top-up request rejected.');
    }
}
