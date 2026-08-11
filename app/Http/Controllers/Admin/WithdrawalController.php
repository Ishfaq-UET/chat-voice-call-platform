<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Services\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WithdrawalController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'pending');

        $withdrawals = Withdrawal::query()
            ->with(['user:id,name,email,phone,avatar', 'processor:id,name'])
            ->when(
                $status !== 'all',
                fn ($q) => $q->where('status', $status),
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Withdrawals', [
            'withdrawals' => $withdrawals,
            'filters' => ['status' => $status],
            'counts' => [
                'pending' => Withdrawal::query()->where('status', 'pending')->count(),
                'paid' => Withdrawal::query()->where('status', 'paid')->count(),
                'rejected' => Withdrawal::query()->where('status', 'rejected')->count(),
                'all' => Withdrawal::query()->count(),
            ],
        ]);
    }

    public function approve(Request $request, Withdrawal $withdrawal): RedirectResponse
    {
        abort_unless($withdrawal->status === 'pending', 422);

        $data = $request->validate([
            'payment_reference' => ['nullable', 'string', 'max:255'],
            'payment_method' => ['nullable', Rule::in(['bank_transfer', 'cash', 'other'])],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $withdrawal->update([
            'status' => 'paid',
            'payment_reference' => $data['payment_reference'] ?? null,
            'payment_method' => $data['payment_method'] ?? 'bank_transfer',
            'admin_notes' => $data['admin_notes'] ?? null,
            'processed_by' => $request->user()->id,
            'processed_at' => now(),
        ]);

        return back()->with('success', 'Withdrawal marked as manually paid.');
    }

    public function reject(Request $request, Withdrawal $withdrawal, WalletService $wallets): RedirectResponse
    {
        abort_unless($withdrawal->status === 'pending', 422);

        $data = $request->validate([
            'admin_notes' => ['required', 'string', 'max:1000'],
        ]);

        $withdrawal->update([
            'status' => 'rejected',
            'admin_notes' => $data['admin_notes'],
            'processed_by' => $request->user()->id,
            'processed_at' => now(),
        ]);

        $wallets->credit(
            $withdrawal->user,
            (float) $withdrawal->amount,
            'refund',
            'Withdrawal #'.$withdrawal->id.' rejected — refunded',
            $withdrawal,
        );

        return back()->with('success', 'Withdrawal rejected and amount refunded to wallet.');
    }
}
