<?php

namespace App\Http\Controllers;

use App\Services\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\Checkout\Session;
use Stripe\Stripe;
use Stripe\Webhook;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class WalletController extends Controller
{
    public function index(Request $request, WalletService $wallets): Response
    {
        $wallet = $wallets->ensureWallet($request->user());
        $transactions = $wallet->transactions()->latest()->paginate(20);

        return Inertia::render('Wallet/Index', [
            'balance' => (float) $wallet->balance,
            'transactions' => $transactions,
            'stripeEnabled' => (bool) config('services.stripe.secret'),
        ]);
    }

    public function topUp(Request $request, WalletService $wallets): RedirectResponse|SymfonyResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:5', 'max:500'],
        ]);

        $amount = (float) $data['amount'];
        $secret = config('services.stripe.secret');

        // Local/demo mode: instant credit without Stripe.
        if (! $secret) {
            $wallets->credit(
                $request->user(),
                $amount,
                'top_up',
                'Demo wallet top-up',
                meta: ['demo' => true],
            );

            return back()->with('success', 'Demo top-up successful.');
        }

        Stripe::setApiKey($secret);

        $session = Session::create([
            'mode' => 'payment',
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => ['name' => 'Wallet top-up'],
                    'unit_amount' => (int) round($amount * 100),
                ],
                'quantity' => 1,
            ]],
            'success_url' => route('wallet.index').'?success=1',
            'cancel_url' => route('wallet.index').'?canceled=1',
            'metadata' => [
                'user_id' => (string) $request->user()->id,
                'amount' => (string) $amount,
            ],
        ]);

        return Inertia::location($session->url);
    }

    public function webhook(Request $request, WalletService $wallets): SymfonyResponse
    {
        $payload = $request->getContent();
        $sig = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        try {
            $event = $secret
                ? Webhook::constructEvent($payload, $sig, $secret)
                : json_decode($payload);

            $type = is_object($event) ? ($event->type ?? null) : null;
            $object = is_object($event) ? ($event->data->object ?? null) : null;

            if ($type === 'checkout.session.completed' && $object) {
                $userId = (int) ($object->metadata->user_id ?? 0);
                $amount = (float) ($object->metadata->amount ?? 0);
                $user = \App\Models\User::query()->find($userId);

                if ($user && $amount > 0) {
                    $wallets->credit($user, $amount, 'top_up', 'Stripe wallet top-up', meta: [
                        'stripe_session' => $object->id ?? null,
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Stripe webhook error: '.$e->getMessage());

            return response('Invalid', 400);
        }

        return response('OK', 200);
    }
}
