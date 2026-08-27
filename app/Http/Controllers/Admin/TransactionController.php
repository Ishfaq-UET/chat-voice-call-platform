<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $transactions = WalletTransaction::query()
            ->with(['wallet.user:id,name,email,role,avatar'])
            ->when($request->input('type'), fn ($q, $type) => $q->where('type', $type))
            ->when($request->input('q'), function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('description', 'like', "%{$search}%")
                        ->orWhereHas('wallet.user', function ($user) use ($search) {
                            $user->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['type', 'q']),
            'summary' => [
                'top_ups' => (float) WalletTransaction::query()->where('type', 'top_up')->sum('amount'),
                'fees' => (float) WalletTransaction::query()
                    ->whereIn('type', ['chat_fee', 'voice_fee', 'image_fee', 'call_fee'])
                    ->selectRaw('COALESCE(SUM(ABS(amount)), 0) as total')
                    ->value('total'),
                'earnings' => (float) WalletTransaction::query()->where('type', 'earning')->sum('amount'),
                'withdrawals' => (float) WalletTransaction::query()
                    ->where('type', 'withdrawal')
                    ->selectRaw('COALESCE(SUM(ABS(amount)), 0) as total')
                    ->value('total'),
            ],
        ]);
    }
}
