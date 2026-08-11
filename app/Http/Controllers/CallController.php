<?php

namespace App\Http\Controllers;

use App\Events\CallStatusUpdated;
use App\Events\IncomingCall;
use App\Models\Call;
use App\Models\Conversation;
use App\Models\User;
use App\Services\AgoraService;
use App\Services\WalletService;
use App\Support\SafeBroadcast;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class CallController extends Controller
{
    public function start(Request $request, User $female, AgoraService $agora, WalletService $wallets): RedirectResponse
    {
        $male = $request->user();
        abort_unless($male->isMale(), 403);
        abort_unless($female->isVerifiedFemale(), 404);

        $data = $request->validate([
            'type' => ['nullable', Rule::in([Call::TYPE_AUDIO, Call::TYPE_VIDEO])],
        ]);

        $type = $data['type'] ?? Call::TYPE_AUDIO;
        $rate = (float) ($female->femaleProfile?->call_price_per_minute ?? 5);

        if (! $wallets->hasBalance($male, $rate)) {
            return back()->withErrors(['balance' => 'Insufficient balance for at least 1 minute.']);
        }

        if (! $agora->isConfigured()) {
            return back()->withErrors([
                'call' => 'Voice/video calling is not configured. Please try again later.',
            ]);
        }

        $conversation = Conversation::query()->firstOrCreate([
            'male_id' => $male->id,
            'female_id' => $female->id,
        ]);

        $call = Call::query()->create([
            'male_id' => $male->id,
            'female_id' => $female->id,
            'conversation_id' => $conversation->id,
            'type' => $type,
            'status' => Call::STATUS_RINGING,
            'agora_channel' => 'pending',
            'rate_per_minute' => $rate,
        ]);

        $call->update([
            'agora_channel' => $agora->channelForCall($call->id),
        ]);

        SafeBroadcast::dispatch(new IncomingCall($call->fresh('male')));

        return redirect()->route('calls.show', $call);
    }

    public function show(Request $request, Call $call, AgoraService $agora): Response
    {
        $user = $request->user();
        abort_unless(in_array($user->id, [$call->male_id, $call->female_id], true), 403);

        $call->load(['male:id,name,avatar', 'female:id,name,avatar']);

        $token = null;
        $error = null;

        try {
            if ($agora->isConfigured() && $call->agora_channel && $call->agora_channel !== 'pending') {
                $token = $agora->buildTokenWithUid($call->agora_channel, (int) $user->id);
            }
        } catch (RuntimeException $e) {
            $error = $e->getMessage();
        }

        return Inertia::render('Calls/Show', [
            'call' => $call,
            'agora' => [
                'appId' => $agora->appId(),
                'channel' => $call->agora_channel,
                'token' => $token,
                'uid' => (int) $user->id,
                'configured' => $agora->isConfigured(),
                'error' => $error,
            ],
            'walletBalance' => (float) (app(WalletService::class)->ensureWallet($user)->balance),
        ]);
    }

    public function token(Request $request, Call $call, AgoraService $agora): JsonResponse
    {
        $user = $request->user();
        abort_unless(in_array($user->id, [$call->male_id, $call->female_id], true), 403);
        abort_unless(in_array($call->status, [Call::STATUS_RINGING, Call::STATUS_ACTIVE], true), 422);

        try {
            $token = $agora->buildTokenWithUid($call->agora_channel, (int) $user->id);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }

        return response()->json([
            'appId' => $agora->appId(),
            'channel' => $call->agora_channel,
            'token' => $token,
            'uid' => (int) $user->id,
        ]);
    }

    public function accept(Request $request, Call $call): RedirectResponse
    {
        abort_unless($request->user()->id === $call->female_id, 403);
        abort_unless($call->status === Call::STATUS_RINGING, 422);

        $now = now();
        $call->update([
            'status' => Call::STATUS_ACTIVE,
            'started_at' => $now,
            'answered_at' => $now,
        ]);

        SafeBroadcast::dispatch(new CallStatusUpdated($call->fresh()));

        return redirect()->route('calls.show', $call);
    }

    public function reject(Request $request, Call $call): RedirectResponse
    {
        abort_unless($request->user()->id === $call->female_id, 403);

        $call->update([
            'status' => Call::STATUS_REJECTED,
            'ended_at' => now(),
        ]);

        SafeBroadcast::dispatch(new CallStatusUpdated($call->fresh()));

        return redirect()->route('chat.index');
    }

    public function end(Request $request, Call $call, WalletService $wallets): RedirectResponse
    {
        $user = $request->user();
        abort_unless(in_array($user->id, [$call->male_id, $call->female_id], true), 403);

        if ($call->status === Call::STATUS_RINGING && $user->id === $call->female_id) {
            $call->update([
                'status' => Call::STATUS_MISSED,
                'ended_at' => now(),
            ]);
            SafeBroadcast::dispatch(new CallStatusUpdated($call->fresh()));

            return redirect()->route('chat.index')->with('success', 'Call missed.');
        }

        $this->finalizeCall($call, $wallets);

        return redirect()->route('chat.index')->with('success', 'Call ended.');
    }

    public function tick(Request $request, Call $call, WalletService $wallets): JsonResponse
    {
        abort_unless($request->user()->id === $call->male_id, 403);
        abort_unless($call->status === Call::STATUS_ACTIVE, 422);

        $rate = (float) $call->rate_per_minute;
        $wallet = $wallets->ensureWallet($request->user());

        if ((float) $wallet->balance < $rate) {
            $this->finalizeCall($call, $wallets);

            return response()->json(['ok' => false, 'reason' => 'insufficient_balance']);
        }

        return response()->json([
            'ok' => true,
            'balance' => (float) $wallet->balance,
        ]);
    }

    private function finalizeCall(Call $call, WalletService $wallets): void
    {
        if (in_array($call->status, [Call::STATUS_ENDED, Call::STATUS_REJECTED, Call::STATUS_MISSED, Call::STATUS_FAILED], true)) {
            return;
        }

        $started = $call->answered_at ?? $call->started_at ?? now();
        $seconds = max(0, (int) now()->diffInSeconds($started));
        $minutes = max(1, (int) ceil($seconds / 60));
        $total = round($minutes * (float) $call->rate_per_minute, 2);
        $commission = 0;
        $label = $call->isVideo() ? 'Video call' : 'Voice call';

        if ($call->status === Call::STATUS_ACTIVE) {
            try {
                $male = $call->male;
                $female = $call->female;
                $affordable = (float) $wallets->ensureWallet($male)->balance;
                $billable = min($total, $affordable);

                if ($billable > 0) {
                    $result = $wallets->chargeInteraction(
                        $male,
                        $female,
                        $billable,
                        'call_fee',
                        $label.' with '.$female->name,
                        $call,
                    );
                    $commission = $result['commission'];
                    $total = $result['charged'];
                } else {
                    $total = 0;
                }
            } catch (RuntimeException $e) {
                $total = 0;
            }
        } else {
            $total = 0;
            $seconds = 0;
        }

        $call->update([
            'status' => Call::STATUS_ENDED,
            'duration_seconds' => $seconds,
            'total_charged' => $total,
            'commission_amount' => $commission,
            'ended_at' => now(),
        ]);

        SafeBroadcast::dispatch(new CallStatusUpdated($call->fresh()));
    }
}
