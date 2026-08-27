<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function index(Request $request): Response
    {
        $conversations = Conversation::query()
            ->with([
                'male:id,name,email,avatar',
                'female:id,name,email,avatar',
            ])
            ->withCount([
                'messages',
                'messages as voice_count' => fn ($q) => $q->where('type', 'voice'),
                'messages as image_count' => fn ($q) => $q->where('type', 'image'),
                'messages as text_count' => fn ($q) => $q->where('type', 'text'),
            ])
            ->withSum('messages as total_charged', 'amount_charged')
            ->withSum('messages as total_commission', 'commission_amount')
            ->when($request->input('q'), function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->whereHas('male', function ($male) use ($search) {
                        $male->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })->orWhereHas('female', function ($female) use ($search) {
                        $female->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                });
            })
            ->orderByDesc('last_message_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Chats/Index', [
            'conversations' => $conversations,
            'filters' => $request->only(['q']),
            'summary' => [
                'conversations' => Conversation::query()->count(),
                'messages' => Message::query()->count(),
                'voice_notes' => Message::query()->where('type', 'voice')->count(),
                'images' => Message::query()->where('type', 'image')->count(),
                'chat_revenue' => (float) Message::query()->sum('amount_charged'),
            ],
        ]);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        $conversation->load([
            'male:id,name,email,avatar',
            'female:id,name,email,avatar',
        ]);

        $messages = $conversation->messages()
            ->with('sender:id,name,role,avatar')
            ->when($request->input('type'), fn ($q, $type) => $q->where('type', $type))
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Admin/Chats/Show', [
            'conversation' => [
                ...$conversation->toArray(),
                'totals' => [
                    'messages' => $conversation->messages()->count(),
                    'charged' => (float) $conversation->messages()->sum('amount_charged'),
                    'commission' => (float) $conversation->messages()->sum('commission_amount'),
                ],
            ],
            'messages' => $messages,
            'filters' => $request->only(['type']),
        ]);
    }
}
