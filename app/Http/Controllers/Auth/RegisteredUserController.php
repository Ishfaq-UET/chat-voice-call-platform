<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\FemaleProfile;
use App\Models\User;
use App\Services\WalletService;
use App\Support\CountryCatalog;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(Request $request): Response
    {
        $role = $request->query('role') === 'female' ? 'female' : 'male';

        return Inertia::render('Auth/Register', [
            'preferredRole' => $role,
            'countries' => CountryCatalog::optionsForSelect(),
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function store(Request $request, WalletService $wallets): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:male,female',
            'country_code' => ['required', 'string', 'size:2', CountryCatalog::countryCodeRule()],
        ]);

        $countryCode = CountryCatalog::normalize($request->country_code);
        $defaultPrices = CountryCatalog::defaultPrices($countryCode);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'country_code' => $countryCode,
            'email_verified_at' => now(),
            'verification_status' => $request->role === 'female' ? 'unverified' : 'approved',
        ]);

        $wallets->ensureWallet($user);

        if ($user->isFemale()) {
            FemaleProfile::query()->create([
                'user_id' => $user->id,
                'chat_price' => $defaultPrices['chat'],
                'voice_price' => $defaultPrices['voice'],
                'call_price_per_minute' => $defaultPrices['call'],
            ]);
        }

        event(new Registered($user));

        Auth::login($user);

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        if ($user->isFemale()) {
            return redirect()->route('female.dashboard');
        }

        return redirect()->route('home');
    }
}
