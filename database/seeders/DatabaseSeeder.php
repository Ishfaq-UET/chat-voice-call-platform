<?php

namespace Database\Seeders;

use App\Models\FemaleProfile;
use App\Models\Setting;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Setting::setValue('commission_percent', 20);
        Setting::setValue('min_withdrawal', 20);

        $wallets = app(WalletService::class);

        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => User::ROLE_ADMIN,
                'email_verified_at' => now(),
                'verification_status' => 'approved',
            ],
        );
        $wallets->ensureWallet($admin);

        $male = User::query()->updateOrCreate(
            ['email' => 'male@example.com'],
            [
                'name' => 'Demo Male',
                'password' => Hash::make('password'),
                'role' => User::ROLE_MALE,
                'email_verified_at' => now(),
                'verification_status' => 'approved',
                'bio' => 'Looking for good conversations.',
                'avatar' => 'https://i.pravatar.cc/400?u=male-demo',
            ],
        );
        $wallets->ensureWallet($male);
        $maleWallet = $wallets->ensureWallet($male->fresh());
        if ((float) $maleWallet->balance < 50) {
            $wallets->credit($male, 100, 'top_up', 'Seed balance');
        }

        $creators = [
            [
                'email' => 'female@example.com',
                'name' => 'Ava Brooks',
                'bio' => 'Late-night talks, soft voice notes, and unhurried calls. Tell me about your week.',
                'online' => true,
                'chat' => 1.50,
                'voice' => 3.00,
                'call' => 6.00,
            ],
            [
                'email' => 'mia@example.com',
                'name' => 'Mia Torres',
                'bio' => 'Language swap & travel stories. Patient listener. Voice calls welcome.',
                'online' => true,
                'chat' => 1.00,
                'voice' => 2.50,
                'call' => 5.00,
            ],
            [
                'email' => 'luna@example.com',
                'name' => 'Luna Park',
                'bio' => 'Music nerd. Send a song rec, get one back. Chill energy only.',
                'online' => false,
                'chat' => 2.00,
                'voice' => 3.50,
                'call' => 7.50,
            ],
            [
                'email' => 'nora@example.com',
                'name' => 'Nora Quinn',
                'bio' => 'Deep chats about work stress, creativity, and resetting after long days.',
                'online' => true,
                'chat' => 1.75,
                'voice' => 2.75,
                'call' => 5.50,
            ],
            [
                'email' => 'sofia@example.com',
                'name' => 'Sofia Reyes',
                'bio' => 'Warm conversation and laughter. Prefer voice notes over endless typing.',
                'online' => false,
                'chat' => 1.25,
                'voice' => 2.00,
                'call' => 4.50,
            ],
            [
                'email' => 'iris@example.com',
                'name' => 'Iris Cho',
                'bio' => 'Bookish nights, tea recommendations, and calm call energy.',
                'online' => true,
                'chat' => 0.90,
                'voice' => 2.20,
                'call' => 4.00,
            ],
            [
                'email' => 'elena@example.com',
                'name' => 'Elena Vogt',
                'bio' => 'Direct, curious, multilingual. Practice speaking or just vent.',
                'online' => false,
                'chat' => 2.25,
                'voice' => 4.00,
                'call' => 8.00,
            ],
            [
                'email' => 'zara@example.com',
                'name' => 'Zara Ahmed',
                'bio' => 'Friendly check-ins and playful banter. Online evenings most nights.',
                'online' => true,
                'chat' => 1.10,
                'voice' => 2.40,
                'call' => 5.25,
            ],
            [
                'email' => 'hannah@example.com',
                'name' => 'Hannah Lee',
                'bio' => 'Fitness, food, and honest talks. Quick replies when the green dot is on.',
                'online' => true,
                'chat' => 1.40,
                'voice' => 2.90,
                'call' => 6.50,
            ],
            [
                'email' => 'priya@example.com',
                'name' => 'Priya Nair',
                'bio' => 'Soft-spoken calls and thoughtful messages. Slow evenings preferred.',
                'online' => false,
                'chat' => 1.60,
                'voice' => 3.10,
                'call' => 5.75,
            ],
            [
                'email' => 'jade@example.com',
                'name' => 'Jade Okonkwo',
                'bio' => 'Creative spark sessions. Share an idea — I’ll ask better questions.',
                'online' => true,
                'chat' => 1.80,
                'voice' => 3.25,
                'call' => 7.00,
            ],
            [
                'email' => 'claire@example.com',
                'name' => 'Claire Dubois',
                'bio' => 'Paris evenings, cinema takes, and quiet company on longer calls.',
                'online' => false,
                'chat' => 2.50,
                'voice' => 4.50,
                'call' => 9.00,
            ],
        ];

        foreach ($creators as $index => $creator) {
            $user = User::query()->updateOrCreate(
                ['email' => $creator['email']],
                [
                    'name' => $creator['name'],
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_FEMALE,
                    'email_verified_at' => now(),
                    'verification_status' => 'approved',
                    'bio' => $creator['bio'],
                    'avatar' => 'https://i.pravatar.cc/600?u='.urlencode($creator['email']),
                    'online_at' => $creator['online'] ? now()->subSeconds($index * 7) : now()->subHours(5 + $index),
                ],
            );
            $wallets->ensureWallet($user);
            FemaleProfile::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'chat_price' => $creator['chat'],
                    'voice_price' => $creator['voice'],
                    'call_price_per_minute' => $creator['call'],
                    'bank_name' => 'Demo Bank',
                    'bank_account' => '1000'.str_pad((string) ($index + 1), 6, '0', STR_PAD_LEFT),
                    'bank_holder' => $creator['name'],
                ],
            );
        }
    }
}
