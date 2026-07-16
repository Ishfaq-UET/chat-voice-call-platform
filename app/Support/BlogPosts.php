<?php

namespace App\Support;

class BlogPosts
{
    /**
     * @return array<string, array<string, mixed>>
     */
    public static function all(): array
    {
        return [
            'face-verification-protects-both-sides' => [
                'slug' => 'face-verification-protects-both-sides',
                'tag' => 'Safety',
                'title' => 'How face verification protects both sides',
                'excerpt' => 'Why creators verify once, and how members benefit from a trusted discover list.',
                'date' => 'July 10, 2026',
                'author' => 'Team ChatVoiceCall',
                'tone' => 'bg-lilac',
                'sections' => [
                    [
                        'heading' => 'Why random chat apps feel risky',
                        'body' => 'Anonymous roulette apps make it easy to meet someone — and just as easy to meet a fake profile. No identity checks, no rates, no accountability. ChatVoiceCall flips that model: creators verify before they appear in Discover, and members only pay after they choose who to talk to.',
                    ],
                    [
                        'heading' => 'What face verification means here',
                        'body' => 'Creators upload a clear selfie (and optionally an ID photo). An admin reviews the request and either approves or rejects it with a reason. Until approval, the creator stays hidden from the member Discover list.',
                        'features' => [
                            'Selfie review by a human admin',
                            'Optional ID photo for stronger checks',
                            'Reject reasons sent back to the creator',
                            'Only approved profiles show online + pricing',
                        ],
                    ],
                    [
                        'heading' => 'How members benefit',
                        'body' => 'When you browse Discover you are not spinning a wheel of unknowns. You see a photo, bio, online status, and clear chat / voice / call prices. That reduces spam and makes conversations feel intentional from the first message.',
                    ],
                    [
                        'heading' => 'How creators benefit',
                        'body' => 'Verification is a trust badge. Members are more willing to top up and start chats when they believe the person on the other side is real. Combined with wallet billing, creators get paid for time without chasing off-platform payments.',
                    ],
                ],
            ],
            'wallet-pricing-for-chat-and-calls' => [
                'slug' => 'wallet-pricing-for-chat-and-calls',
                'tag' => 'Guides',
                'title' => 'How wallet pricing works for chat and calls',
                'excerpt' => 'Per-message, voice note, and per-minute call billing — explained simply.',
                'date' => 'July 8, 2026',
                'author' => 'Team ChatVoiceCall',
                'tone' => 'bg-mint',
                'sections' => [
                    [
                        'heading' => 'One wallet, three ways to talk',
                        'body' => 'Members fund a single wallet, then spend it on text messages, voice notes, or live voice calls. Every creator sets their own prices — you always see the numbers on their profile before you start.',
                    ],
                    [
                        'heading' => 'How charges work',
                        'features' => [
                            'Text chat — charged per message at the creator’s chat price',
                            'Voice notes — charged per voice note at the voice price',
                            'Voice calls — billed per minute while the call is connected',
                            'Insufficient balance blocks the send / ends the call safely',
                        ],
                        'body' => 'If your balance is too low, the app asks you to top up instead of sending a half-paid message. Calls check balance while connected and can end when funds run out.',
                    ],
                    [
                        'heading' => 'Where the money goes',
                        'body' => 'When a member pays, the platform keeps a commission (default 20%, configurable by admin). The rest goes straight to the creator’s wallet as earnings. Creators can request a withdrawal once they hit the minimum amount.',
                    ],
                    [
                        'heading' => 'Demo vs live payments',
                        'body' => 'Without Stripe keys, top-ups credit instantly for local testing. With Stripe configured, members pay via Checkout and webhooks credit the wallet after a successful payment.',
                    ],
                ],
            ],
            'setting-rates-that-convert' => [
                'slug' => 'setting-rates-that-convert',
                'tag' => 'Creators',
                'title' => 'Setting rates that convert without burning out',
                'excerpt' => 'Practical pricing tips for new creators on ChatVoiceCall.',
                'date' => 'July 2, 2026',
                'author' => 'Team ChatVoiceCall',
                'tone' => 'bg-skyish',
                'sections' => [
                    [
                        'heading' => 'Start simple',
                        'body' => 'New creators often overprice calls and underprice chat — or the reverse. A simple starting point: keep chat affordable so members can “test the vibe,” then make voice notes and live calls your higher-ticket options.',
                    ],
                    [
                        'heading' => 'A starter pricing framework',
                        'features' => [
                            'Chat: low enough to invite a first message',
                            'Voice note: mid-tier for personal connection',
                            'Call / minute: highest, since it takes your full attention',
                            'Review weekly — raise prices when you are often fully booked',
                        ],
                    ],
                    [
                        'heading' => 'Write a bio that sells the experience',
                        'body' => 'Members skim. Lead with what you offer in one line — language practice, late-night talks, soft voice notes — then add borders (“no spam”, “evenings only”). Add a clear photo after verification so your card stands out in Discover.',
                    ],
                    [
                        'heading' => 'Protect your energy',
                        'body' => 'Go offline when you need a break. You control availability with your online status. Pair that with prices that respect your time so every conversation feels worth it for both sides.',
                    ],
                ],
            ],
            'safe-paid-chat-alternatives' => [
                'slug' => 'safe-paid-chat-alternatives',
                'tag' => 'Chat Platforms',
                'title' => 'Safe paid chat alternatives: better than random stranger roulette',
                'excerpt' => 'Why members are leaving anonymous video roulette for verified creators, clear rates, and wallet billing.',
                'date' => 'July 12, 2026',
                'author' => 'Team ChatVoiceCall',
                'tone' => 'bg-lilac',
                'sections' => [
                    [
                        'heading' => 'Random chat changed — so should your expectations',
                        'body' => 'For years, “talk to strangers” meant open a site, enable a camera, and hope. That model created millions of chats, and just as many safety and spam problems. In 2026, people still want spontaneous conversation — but they also want trust, boundaries, and a fair way to pay for someone’s time.',
                    ],
                    [
                        'heading' => 'ChatVoiceCall — verified creators, chat + voice',
                        'body' => 'ChatVoiceCall is built for paid 1-on-1 conversation. Members discover face-verified creators, see pricing up front, and pay from a wallet for text, voice notes, and live calls.',
                        'features' => [
                            'Face verification before Discover',
                            'Text chat, voice notes, and voice calling',
                            'Prices shown on every profile',
                            'Creator withdrawals after commission',
                            'Members-only access (no guest roulette)',
                        ],
                    ],
                    [
                        'heading' => 'Why people look for alternatives',
                        'body' => 'Common reasons include bots, harassment, no way to continue a good chat, and platforms that never built real moderation. A wallet-based, verified-creator product solves a different job: intentional conversation with clear commercial terms.',
                        'features' => [
                            'Fewer fake profiles',
                            'Accountable login',
                            'Transparent billing',
                            'Ability to choose who you contact',
                        ],
                    ],
                    [
                        'heading' => 'What to look for in a safer chat product',
                        'body' => 'Prefer products with age gates, verification, report/ban tools, and in-app payments. Avoid sending money off-platform. If a creator asks you to leave the app to pay, that is a red flag on ChatVoiceCall — and against community rules.',
                    ],
                ],
            ],
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function listed(): array
    {
        return array_values(array_map(fn (array $post) => [
            'slug' => $post['slug'],
            'tag' => $post['tag'],
            'title' => $post['title'],
            'excerpt' => $post['excerpt'],
            'date' => $post['date'],
            'tone' => $post['tone'],
        ], self::all()));
    }

    public static function find(string $slug): ?array
    {
        return self::all()[$slug] ?? null;
    }
}
