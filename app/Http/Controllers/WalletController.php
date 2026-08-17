<?php

namespace App\Http\Controllers;

use App\Models\ManualPaymentMethod;
use App\Models\ManualTopUpRequest;
use App\Services\WalletService;
use App\Support\CountryCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\Webhook;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class WalletController extends Controller
{
    public function index(Request $request, WalletService $wallets): Response
    {
        $user = $request->user();
        $wallet = $wallets->ensureWallet($user);
        $transactions = $wallet->transactions()->latest()->paginate(20);
        $countryCode = CountryCatalog::normalize($user->country_code);

        $paymentMethods = ManualPaymentMethod::query()
            ->active()
            ->forCountry($countryCode)
            ->ordered()
            ->get()
            ->map(fn (ManualPaymentMethod $method) => $method->toPublicArray())
            ->values();

        $manualRequests = $user->manualTopUpRequests()
            ->with('paymentMethod:id,name,account_title,account_number,bank_name')
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Wallet/Index', [
            'balance' => (float) $wallet->balance,
            'transactions' => $transactions,
            'paymentMethods' => $paymentMethods,
            'manualRequests' => $manualRequests,
            'hasPendingManual' => $user->manualTopUpRequests()->where('status', 'pending')->exists(),
        ]);
    }

    public function requestManualTopUp(Request $request): RedirectResponse
    {
        $user = $request->user();
        $countryCode = CountryCatalog::normalize($user->country_code);

        if ($user->manualTopUpRequests()->where('status', 'pending')->exists()) {
            return back()->withErrors([
                'manual' => 'You already have a pending manual payment request. Wait for admin review.',
            ]);
        }

        $data = $request->validate([
            'payment_method_id' => ['required', 'integer', 'exists:manual_payment_methods,id'],
            'sender_account_name' => ['required', 'string', 'max:120'],
            'sender_number' => ['required', 'string', 'max:40'],
            'amount' => ['required', 'numeric', 'min:5', 'max:500'],
            'transaction_id' => ['required', 'string', 'max:120'],
            'screenshot' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'member_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $method = ManualPaymentMethod::query()
            ->active()
            ->forCountry($countryCode)
            ->find($data['payment_method_id']);

        if (! $method) {
            return back()->withErrors([
                'payment_method_id' => 'This payment method is not available in your country.',
            ]);
        }
        $path = $data['screenshot']->store('top-up-screenshots', 'public');

        ManualTopUpRequest::query()->create([
            'user_id' => $user->id,
            'payment_method_id' => $method->id,
            'payment_channel' => $method->name,
            'sender_account_name' => trim($data['sender_account_name']),
            'sender_number' => trim($data['sender_number']),
            'receiver_account' => $method->account_number,
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
