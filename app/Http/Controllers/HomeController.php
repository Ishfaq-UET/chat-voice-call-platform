<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\WalletService;
use App\Support\CountryCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $user) {
            return Inertia::render('Welcome');
        }

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        if ($user->isFemale()) {
            return redirect()->route('female.dashboard');
        }

        $countryCode = CountryCatalog::normalize($user->country_code);

        $baseQuery = User::query()
            ->where('role', User::ROLE_FEMALE)
            ->where('verification_status', 'approved')
            ->where('is_banned', false)
            ->where('country_code', $countryCode);

        $query = (clone $baseQuery)->with('femaleProfile');

        if ($request->boolean('online')) {
            $query->where('online_at', '>=', now()->subMinutes(2));
        }

        if ($request->filled('q')) {
            $search = trim((string) $request->input('q'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('bio', 'like', "%{$search}%");
            });
        }

        if ($request->filled('max_chat_price')) {
            $query->whereHas('femaleProfile', function ($q) use ($request) {
                $q->where('chat_price', '<=', (float) $request->input('max_chat_price'));
            });
        }

        if ($request->filled('max_call_price')) {
            $query->whereHas('femaleProfile', function ($q) use ($request) {
                $q->where('call_price_per_minute', '<=', (float) $request->input('max_call_price'));
            });
        }

        $sort = $request->input('sort', 'online');
        match ($sort) {
            'chat_price' => $query->join('female_profiles', 'female_profiles.user_id', '=', 'users.id')
                ->orderBy('female_profiles.chat_price')
                ->select('users.*'),
            'call_price' => $query->join('female_profiles', 'female_profiles.user_id', '=', 'users.id')
                ->orderBy('female_profiles.call_price_per_minute')
                ->select('users.*'),
            'newest' => $query->orderByDesc('users.created_at'),
            default => $query->orderByDesc('users.online_at')->orderByDesc('users.id'),
        };

        $females = $query->paginate(9)->withQueryString();

        return Inertia::render('Male/Home', [
            'females' => $females,
            'market' => CountryCatalog::marketFor($countryCode),
            'filters' => [
                'online' => $request->boolean('online'),
                'q' => $request->input('q', ''),
                'max_chat_price' => $request->input('max_chat_price', ''),
                'max_call_price' => $request->input('max_call_price', ''),
                'sort' => $sort,
            ],
            'walletBalance' => (float) app(WalletService::class)->ensureWallet($user)->balance,
            'stats' => [
                'total' => (clone $baseQuery)->count(),
                'online' => (clone $baseQuery)
                    ->where('online_at', '>=', now()->subMinutes(2))
                    ->count(),
            ],
        ]);
    }
}
