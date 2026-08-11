<?php

namespace App\Http\Controllers;

use App\Models\ManualTopUpRequest;
use App\Models\Setting;
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
        $user = $request->user();
        $wallet = $wallets->ensureWallet($user);
        $transactions = $wallet->transactions()->latest()->paginate(20);

        $manualRequests = $user->manualTopUpRequests()
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Wallet/Index', [
            'balance' => (float) $wallet->balance,
            'transactions' => $transactions,
            'stripeEnabled' => (bool) config('services.stripe.secret'),
            'paypalEnabled' => (bool) config('services.paypal.client_id'),
            'manualInstructions' => Setting::manualTopUpInstructions(),
            'manualChannels' => ManualTopUpRequest::CHANNELS,
            'manualRequests' => $manualRequests,
            'hasPendingManual' => $user->manualTopUpRequests()->where('status', 'pending')->exists(),
        ]);
    }

    public function topUp(Request $request, WalletService $wallets): RedirectResponse|SymfonyResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:5', 'max:500'],
        ]);

        $amount = (float) $data['amount'];
        $secret = config('services.stripe.secret');

        if (! $secret) {
            return back()->withErrors([
                'amount' => 'Card payments are not configured. Please use manual payment with screenshot.',
            ]);
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

    public function requestManualTopUp(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->manualTopUpRequests()->where('status', 'pending')->exists()) {
            return back()->withErrors([
                'manual' => 'You already have a pending manual payment request. Wait for admin review.',
            ]);
        }

        $data = $request->validate([
            'payment_channel' => ['required', 'string', 'in:'.implode(',', array_keys(ManualTopUpRequest::CHANNELS))],
            'sender_account_name' => ['required', 'string', 'max:120'],
            'sender_number' => ['required', 'string', 'max:40'],
            'receiver_account' => ['required', 'string', 'max:120'],
            'amount' => ['required', 'numeric', 'min:5', 'max:500'],
            'transaction_id' => ['required', 'string', 'max:120'],
            'screenshot' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'member_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $path = $data['screenshot']->store('top-up-screenshots', 'public');

        ManualTopUpRequest::query()->create([
            'user_id' => $user->id,
            'payment_channel' => $data['payment_channel'],
            'sender_account_name' => trim($data['sender_account_name']),
            'sender_number' => trim($data['sender_number']),
            'receiver_account' => trim($data['receiver_account']),
            'amount' => round((float) $data['amount'], 2),
            'transaction_id' => trim($data['transaction_id']),
            'screenshot_path' => $path,
            'member_notes' => isset($data['member_notes']) ? trim($data['member_notes']) : null,
            'status' => 'pending',
        ]);

        return back()->with(
            'success',
            'Manual payment submitted. An admin will verify the details and screenshot, then add the balance.',
        );
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
