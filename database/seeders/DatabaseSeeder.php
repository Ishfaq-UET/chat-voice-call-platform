<?php

namespace Database\Seeders;

use App\Models\FemaleProfile;
use App\Models\Setting;
use App\Models\User;
use App\Services\WalletService;
use App\Support\CountryCatalog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (\Nnjeim\World\Models\Country::query()->count() === 0) {
            $this->call(WorldSeeder::class);
        }

        CountryCatalog::flushCache();

        Setting::setValue('commission_percent', 20);
        Setting::setValue('min_withdrawal', 20);

        $wallets = app(WalletService::class);

        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@admin.com'],
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
            ['email' => 'male@gmail.com'],
            [
                'name' => 'Demo Male',
                'password' => Hash::make('password'),
                'role' => User::ROLE_MALE,
                'country_code' => 'PK',
                'email_verified_at' => now(),
                'verification_status' => 'approved',
                'bio' => 'Looking for good conversations.',
                'avatar' => 'https://i.pravatar.cc/400?u=male-demo',
            ],
        );
        $wallets->ensureWallet($male);
        $maleWallet = $wallets->ensureWallet($male->fresh());
        if ((float) $maleWallet->balance < 50) {
            $wallets->credit($male, 5000, 'top_up', 'Seed balance');
        }

        $creators = [
            [
                'email' => 'female@gmail.com',
                'name' => 'Ava Brooks',
                'bio' => 'Late-night talks, soft voice notes, and unhurried calls. Tell me about your week.',
                'online' => true,
                'country' => 'PK',
                'chat' => 100,
                'voice' => 200,
                'call' => 500,
            ],
            [
                'email' => 'mia@gmail.com',
                'name' => 'Mia Torres',
                'bio' => 'Language swap & travel stories. Patient listener. Voice calls welcome.',
                'online' => true,
                'chat' => 1.00,
                'voice' => 2.50,
                'call' => 5.00,
            ],
            [
                'email' => 'luna@gmail.com',
                'name' => 'Luna Park',
                'bio' => 'Music nerd. Send a song rec, get one back. Chill energy only.',
                'online' => false,
                'chat' => 2.00,
                'voice' => 3.50,
                'call' => 7.50,
            ],
            [
                'email' => 'nora@gmail.com',
                'name' => 'Nora Quinn',
                'bio' => 'Deep chats about work stress, creativity, and resetting after long days.',
                'online' => true,
                'chat' => 1.75,
                'voice' => 2.75,
                'call' => 5.50,
            ],
            [
                'email' => 'sofia@gmail.com',
                'name' => 'Sofia Reyes',
                'bio' => 'Warm conversation and laughter. Prefer voice notes over endless typing.',
                'online' => false,
                'chat' => 1.25,
                'voice' => 2.00,
                'call' => 4.50,
            ],
            [
                'email' => 'iris@gmail.com',
                'name' => 'Iris Cho',
                'bio' => 'Bookish nights, tea recommendations, and calm call energy.',
                'online' => true,
                'chat' => 0.90,
                'voice' => 2.20,
                'call' => 4.00,
            ],
            [
                'email' => 'elena@gmail.com',
                'name' => 'Elena Vogt',
                'bio' => 'Direct, curious, multilingual. Practice speaking or just vent.',
                'online' => false,
                'chat' => 2.25,
                'voice' => 4.00,
                'call' => 8.00,
            ],
            [
                'email' => 'zara@gmail.com',
                'name' => 'Zara Ahmed',
                'bio' => 'Friendly check-ins and playful banter. Online evenings most nights.',
                'online' => true,
                'country' => 'PK',
                'chat' => 110,
                'voice' => 240,
                'call' => 525,
            ],
            [
                'email' => 'hannah@gmail.com',
                'name' => 'Hannah Lee',
                'bio' => 'Fitness, food, and honest talks. Quick replies when the green dot is on.',
                'online' => true,
                'chat' => 1.40,
                'voice' => 2.90,
                'call' => 6.50,
            ],
            [
                'email' => 'priya@gmail.com',
                'name' => 'Priya Nair',
                'bio' => 'Soft-spoken calls and thoughtful messages. Slow evenings preferred.',
                'online' => false,
                'country' => 'IN',
                'chat' => 50,
                'voice' => 100,
                'call' => 250,
            ],
            [
                'email' => 'jade@gmail.com',
                'name' => 'Jade Okonkwo',
                'bio' => 'Creative spark sessions. Share an idea — I’ll ask better questions.',
                'online' => true,
                'chat' => 1.80,
                'voice' => 3.25,
                'call' => 7.00,
            ],
            [
                'email' => 'claire@gmail.com',
                'name' => 'Claire Dubois',
                'bio' => 'Paris evenings, cinema takes, and quiet company on longer calls.',
                'online' => false,
                'country' => 'GB',
                'chat' => 1,
                'voice' => 2,
                'call' => 5,
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
                    'country_code' => $creator['country'] ?? 'US',
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

        if (env('SEED_FEMALE_PROFILES', false)) {
            $this->call(FemaleProfilesSeeder::class);
        }
    }
}
