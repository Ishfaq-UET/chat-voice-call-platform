<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\NameChangeRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'pendingNameChange' => $user->isAdmin()
                ? null
                : $user->nameChangeRequests()->where('status', 'pending')->latest()->first(),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $requestedName = $validated['name'];
        $nameChanged = $requestedName !== $user->name;
        $status = null;

        if (! $user->isAdmin() && $nameChanged) {
            if ($user->nameChangeRequests()->where('status', 'pending')->exists()) {
                return Redirect::route('profile.edit')->with('status', 'name-change-pending');
            }

            NameChangeRequest::query()->create([
                'user_id' => $user->id,
                'current_name' => $user->name,
                'requested_name' => $requestedName,
                'status' => 'pending',
            ]);

            unset($validated['name']);
            $status = 'name-change-submitted';
        }

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit')->with('status', $status);
    }

    public function updateAvatar(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'avatar' => ['required', 'image', 'max:5120'],
            'bio' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();
        $path = $data['avatar']->store('avatars', 'public');

        $user->update([
            'avatar' => $path,
            'bio' => array_key_exists('bio', $data) ? $data['bio'] : $user->bio,
        ]);

        return Redirect::route('profile.edit')->with('status', 'avatar-updated');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
