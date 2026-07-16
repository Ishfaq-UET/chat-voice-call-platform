<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Services\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WithdrawalController extends Controller
{
    public function index(): Response
    {
        $withdrawals = Withdrawal::query()
            ->with('user:id,name,email')
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Withdrawals', [
            'withdrawals' => $withdrawals,
        ]);
    }

    public function approve(Request $request, Withdrawal $withdrawal): RedirectResponse
    {
        abort_unless($withdrawal->status === 'pending', 422);

        $withdrawal->update([
            'status' => 'paid',
            'processed_by' => $request->user()->id,
            'processed_at' => now(),
            'admin_notes' => $request->input('admin_notes'),
        ]);

        return back()->with('success', 'Withdrawal marked as paid.');
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

        return back()->with('success', 'Withdrawal rejected and amount refunded.');
    }
}
