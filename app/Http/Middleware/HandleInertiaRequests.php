<?php

namespace App\Http\Middleware;

use App\Services\WalletService;
use App\Models\Setting;
use App\Models\SiteBanner;
use App\Support\CountryCatalog;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar_url' => $user->avatar_url,
                    'bio' => $user->bio,
                    'country_code' => $user->country_code,
                    'verification_status' => $user->verification_status,
                    'is_banned' => $user->is_banned,
                    'is_online' => $user->is_online,
                ] : null,
            ],
            'market' => fn () => $user
                ? CountryCatalog::marketFor($user->country_code)
                : null,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'walletBalance' => fn () => $user
                ? (float) app(WalletService::class)->ensureWallet($user)->balance
                : null,
            'branding' => fn () => [
                'logo_url' => Setting::logoUrl(),
                'favicon_url' => Setting::faviconUrl(),
                'app_name' => config('app.name', 'Wyak Dating'),
            ],
            'contact' => fn () => Setting::contact(),
            'siteBanner' => fn () => SiteBanner::resolveForRequest($request),
        ];
    }
}
