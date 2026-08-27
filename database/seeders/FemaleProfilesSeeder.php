<?php

namespace Database\Seeders;

use App\Models\FemaleProfile;
use App\Models\User;
use App\Models\Wallet;
use App\Support\CountryCatalog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Nnjeim\World\Models\Country;

class FemaleProfilesSeeder extends Seeder
{
    public const TOTAL = 1000;

    private const EMAIL_DOMAIN = 'wyakdating.test';

    private const BIOS = [
        'Warm voice notes and unhurried conversations. Tell me about your day.',
        'Late-night chats, travel stories, and patient listening.',
        'Music, books, and cozy calls — calm energy only.',
        'Friendly banter, honest advice, and quick replies when online.',
        'Soft-spoken calls and thoughtful messages. Here for good talks.',
        'Creative chats about ideas, work stress, and fresh starts.',
        'Language practice, cultural swaps, and laugh-out-loud moments.',
        'Fitness tips, food talk, and motivational check-ins.',
        'Cinema, art, and deep conversations on slow evenings.',
        'Playful energy with a kind heart. Voice calls welcome.',
    ];

    public function run(): void
    {
        if (Country::query()->count() === 0) {
            $this->call(WorldSeeder::class);
        }

        CountryCatalog::flushCache();

        $existing = User::query()
            ->where('role', User::ROLE_FEMALE)
            ->where('email', 'like', 'seed.creator.%@'.self::EMAIL_DOMAIN)
            ->count();

        if ($existing >= self::TOTAL) {
            $this->command?->info("Skipping: {$existing} seeded creator profiles already exist.");

            return;
        }

        $toCreate = self::TOTAL - $existing;
        $countries = CountryCatalog::codes();
        $password = Hash::make('password');
        $now = now();
        $faker = fake();

        $this->command?->info("Seeding {$toCreate} female creator profiles across ".count($countries).' countries…');

        $bar = $this->command?->getOutput()->createProgressBar($toCreate);
        $bar?->start();

        $startIndex = $existing;

        for ($i = 0; $i < $toCreate; $i++) {
            $index = $startIndex + $i + 1;
            $countryCode = $countries[$index % count($countries)];
            $defaults = CountryCatalog::defaultPrices($countryCode);
            $firstName = $faker->firstName('female');
            $lastName = $faker->lastName();
            $name = "{$firstName} {$lastName}";
            $email = sprintf('seed.creator.%04d@%s', $index, self::EMAIL_DOMAIN);
            $isOnline = $faker->boolean(35);

            $user = User::query()->create([
                'name' => $name,
                'email' => $email,
                'password' => $password,
                'role' => User::ROLE_FEMALE,
                'country_code' => $countryCode,
                'avatar' => $this->avatarUrl($index),
                'bio' => $faker->randomElement(self::BIOS).' '.$faker->sentence(),
                'phone' => $faker->optional(0.4)->e164PhoneNumber(),
                'email_verified_at' => $now,
                'verification_status' => 'approved',
                'online_at' => $isOnline ? $now->copy()->subMinutes($faker->numberBetween(0, 90)) : $now->copy()->subHours($faker->numberBetween(2, 72)),
                'is_banned' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            FemaleProfile::query()->create([
                'user_id' => $user->id,
                'chat_price' => $this->varyPrice($defaults['chat']),
                'voice_price' => $this->varyPrice($defaults['voice']),
                'call_price_per_minute' => $this->varyPrice($defaults['call']),
                'bank_name' => 'Seed Bank',
                'bank_account' => 'SEED'.str_pad((string) $index, 8, '0', STR_PAD_LEFT),
                'bank_holder' => $name,
            ]);

            Wallet::query()->create([
                'user_id' => $user->id,
                'balance' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $bar?->advance();
        }

        $bar?->finish();
        $this->command?->newLine(2);
        $this->command?->info('Done. Login as male@gmail.com (PK) to browse creators in Pakistan.');
        $this->command?->info('All seeded creators use password: password');
    }

    private function avatarUrl(int $seedIndex): string
    {
        // Portrait photos — cycles 0–99 for variety.
        $portrait = $seedIndex % 100;

        return "https://randomuser.me/api/portraits/women/{$portrait}.jpg";
    }

    private function varyPrice(float $base): float
    {
        $factor = fake()->randomFloat(2, 0.85, 1.25);

        return round(max(0.1, $base * $factor), 2);
    }
}
