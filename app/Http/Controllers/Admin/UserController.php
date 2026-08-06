<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FemaleProfile;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->where('role', '!=', 'admin')
            ->with('wallet')
            ->when($request->input('role'), fn ($q, $role) => $q->where('role', $role))
            ->when($request->input('q'), function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['role', 'q']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users/Create');
    }

    public function store(Request $request, WalletService $wallets): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:40'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in(['male', 'female'])],
            'bio' => ['nullable', 'string', 'max:2000'],
            'is_banned' => ['sometimes', 'boolean'],
        ]);

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'],
            'role' => $validated['role'],
            'bio' => $validated['bio'] ?? null,
            'email_verified_at' => now(),
            'verification_status' => $validated['role'] === 'female' ? 'unverified' : 'approved',
            'is_banned' => (bool) ($validated['is_banned'] ?? false),
        ]);

        $wallets->ensureWallet($user);
        $this->syncFemaleProfile($user);

        return redirect()
            ->route('admin.users')
            ->with('success', 'User created successfully.');
    }

    public function edit(User $user): Response
    {
        abort_if($user->isAdmin(), 403);

        $user->load('wallet');

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user, WalletService $wallets): RedirectResponse
    {
        abort_if($user->isAdmin(), 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:40'],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in(['male', 'female'])],
            'bio' => ['nullable', 'string', 'max:2000'],
            'verification_status' => ['required', Rule::in(['unverified', 'pending', 'approved', 'rejected'])],
            'is_banned' => ['sometimes', 'boolean'],
        ]);

        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'bio' => $validated['bio'] ?? null,
            'verification_status' => $validated['verification_status'],
            'is_banned' => (bool) ($validated['is_banned'] ?? false),
        ];

        if (! empty($validated['password'])) {
            $payload['password'] = $validated['password'];
        }

        $user->update($payload);

        $wallets->ensureWallet($user);
        $this->syncFemaleProfile($user->fresh());

        return redirect()
            ->route('admin.users')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        abort_if($user->isAdmin(), 403);

        $user->delete();

        return redirect()
            ->route('admin.users')
            ->with('success', 'User deleted successfully.');
    }

    public function toggleBan(User $user): RedirectResponse
    {
        abort_if($user->isAdmin(), 403);

        $user->update(['is_banned' => ! $user->is_banned]);

        return back()->with('success', $user->is_banned ? 'User banned.' : 'User unbanned.');
    }

    private function syncFemaleProfile(User $user): void
    {
        if (! $user->isFemale()) {
            return;
        }

        FemaleProfile::query()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'chat_price' => 1.00,
                'voice_price' => 2.00,
                'call_price_per_minute' => 5.00,
            ],
        );
    }
}
