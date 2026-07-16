<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $conversations = Conversation::query()
            ->when($user->isMale(), fn ($q) => $q->where('male_id', $user->id))
            ->when($user->isFemale(), fn ($q) => $q->where('female_id', $user->id))
            ->with(['male:id,name,avatar,bio,online_at', 'female:id,name,avatar,bio,online_at,verification_status'])
            ->with(['messages' => fn ($q) => $q->latest()->limit(1)])
            ->orderByDesc('last_message_at')
            ->get();

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
        ]);
    }

    public function start(Request $request, User $female): RedirectResponse
    {
        $male = $request->user();
        abort_unless($male->isMale(), 403);
        abort_unless($female->isVerifiedFemale(), 404);

        $conversation = Conversation::query()->firstOrCreate([
            'male_id' => $male->id,
            'female_id' => $female->id,
        ]);

        return redirect()->route('chat.show', $conversation);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        $user = $request->user();
        $this->authorizeParticipant($user, $conversation);

        $conversation->load([
            'male:id,name,avatar,bio,online_at,created_at',
            'female:id,name,avatar,bio,online_at,verification_status,created_at',
            'female.femaleProfile',
        ]);

        $messages = $conversation->messages()
            ->with('sender:id,name,avatar')
            ->latest()
            ->paginate(50)
            ->through(fn (Message $m) => $m);

        // Reverse for chat UI (oldest to newest on page)
        $items = collect($messages->items())->reverse()->values();

        $other = $user->isMale() ? $conversation->female : $conversation->male;

        return Inertia::render('Chat/Show', [
            'conversation' => $conversation,
            'otherUser' => [
                'id' => $other->id,
                'name' => $other->name,
                'bio' => $other->bio,
                'avatar_url' => $other->avatar_url,
                'is_online' => $other->is_online,
                'online_at' => $other->online_at?->diffForHumans(),
                'verification_status' => $other->verification_status ?? null,
                'member_since' => $other->created_at?->format('M Y'),
                'role' => $other->role,
            ],
            'messages' => [
                'data' => $items,
                'next_page_url' => $messages->nextPageUrl(),
            ],
            'walletBalance' => (float) (app(WalletService::class)->ensureWallet($user)->balance),
            'prices' => [
                'chat' => (float) ($conversation->female->femaleProfile?->chat_price ?? 1),
                'voice' => (float) ($conversation->female->femaleProfile?->voice_price ?? 2),
                'call' => (float) ($conversation->female->femaleProfile?->call_price_per_minute ?? 5),
            ],
        ]);
    }

    public function send(Request $request, Conversation $conversation, WalletService $wallets): RedirectResponse
    {
        $user = $request->user();
        $this->authorizeParticipant($user, $conversation);

        $data = $request->validate([
            'type' => ['required', 'in:text,voice,image'],
            'body' => ['nullable', 'string', 'max:5000'],
            'voice' => [
                'nullable',
                'file',
                'mimetypes:audio/webm,audio/ogg,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,video/webm',
                'max:10240',
            ],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($data['type'] === 'text' && blank($data['body'] ?? null)) {
            return back()->withErrors(['body' => 'Message cannot be empty.']);
        }

        if ($data['type'] === 'voice' && ! $request->hasFile('voice')) {
            return back()->withErrors(['voice' => 'Voice file required.']);
        }

        if ($data['type'] === 'image' && ! $request->hasFile('image')) {
            return back()->withErrors(['image' => 'Image file required.']);
        }

        $male = $conversation->male;
        $female = $conversation->female;
        $profile = $female->femaleProfile;
        $price = match ($data['type']) {
            'voice' => (float) ($profile?->voice_price ?? 2),
            default => (float) ($profile?->chat_price ?? 1),
        };

        $feeType = match ($data['type']) {
            'voice' => 'voice_fee',
            'image' => 'image_fee',
            default => 'chat_fee',
        };

        $mediaPath = null;
        if ($request->hasFile('voice')) {
            $mediaPath = $request->file('voice')->store('voice-notes', 'public');
        } elseif ($request->hasFile('image')) {
            $mediaPath = $request->file('image')->store('chat-images', 'public');
        }

        try {
            $message = Message::query()->create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'type' => $data['type'],
                'body' => $data['body'] ?? null,
                'media_path' => $mediaPath,
                'amount_charged' => 0,
                'commission_amount' => 0,
            ]);

            // Only charge when male sends to female.
            if ($user->isMale()) {
                if (! $wallets->hasBalance($male, $price)) {
                    if ($mediaPath) {
                        Storage::disk('public')->delete($mediaPath);
                    }
                    $message->delete();

                    return back()->withErrors(['balance' => 'Insufficient balance. Please top up your wallet.']);
                }

                $result = $wallets->chargeInteraction(
                    $male,
                    $female,
                    $price,
                    $feeType,
                    ucfirst($data['type']).' message to '.$female->name,
                    $message,
                );

                $message->update([
                    'amount_charged' => $result['charged'],
                    'commission_amount' => $result['commission'],
                ]);
            }

            $conversation->update(['last_message_at' => now()]);

            broadcast(new MessageSent($message->fresh('sender')))->toOthers();
        } catch (RuntimeException $e) {
            return back()->withErrors(['balance' => $e->getMessage()]);
        }

        return back();
    }

    private function authorizeParticipant(User $user, Conversation $conversation): void
    {
        abort_unless(
            in_array($user->id, [$conversation->male_id, $conversation->female_id], true),
            403,
        );
    }
}
