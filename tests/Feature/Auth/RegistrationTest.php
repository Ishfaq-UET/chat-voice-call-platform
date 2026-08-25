<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\WorldSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Nnjeim\World\Models\Country;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (Country::query()->count() === 0) {
            $this->seed(WorldSeeder::class);
        }
    }

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '03001234567',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'male',
            'country_code' => 'PK',
        ]);

        $response->assertSessionDoesntHaveErrors();
        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'phone' => '923001234567',
            'role' => 'male',
        ]);
        $this->assertDatabaseMissing('users', [
            'email' => 'test@example.com',
            'email_verified_at' => now()->toDateTimeString(),
        ]);
        $this->assertNull(User::where('email', 'test@example.com')->value('email_verified_at'));
        $response->assertRedirect(route('verification.notice', absolute: false));
    }

    public function test_registration_requires_unique_phone(): void
    {
        User::factory()->create([
            'phone' => '923001112233',
            'role' => 'male',
        ]);

        $response = $this->post('/register', [
            'name' => 'Another User',
            'email' => 'another@example.com',
            'phone' => '3001112233',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'male',
            'country_code' => 'PK',
        ]);

        $response->assertSessionHasErrors('phone');
        $this->assertGuest();
    }
}
