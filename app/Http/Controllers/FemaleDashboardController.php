<?php

namespace App\Http\Controllers;

use App\Models\VerificationRequest;
use App\Services\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FemaleDashboardController extends Controller
{
    public function __invoke(Request $request, WalletService $wallets): Response
    {
        $user = $request->user()->load('femaleProfile');
        $latestVerification = $user->verificationRequests()->latest()->first();

        return Inertia::render('Female/Dashboard', [
            'profile' => $user->femaleProfile,
            'verification' => $latestVerification,
            'verificationStatus' => $user->verification_status,
            'avatarUrl' => $user->avatar_url,
            'bio' => $user->bio,
            'walletBalance' => (float) $wallets->ensureWallet($user)->balance,
        ]);
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
            'bio' => $data['bio'] ?? $user->bio,
        ]);

        return back()->with('success', 'Profile photo updated. It will now show in Discover.');
    }

    public function updateBio(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'bio' => ['nullable', 'string', 'max:500'],
        ]);

        $request->user()->update([
            'bio' => $data['bio'],
        ]);

        return back()->with('success', 'Bio updated.');
    }

    public function updatePricing(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'chat_price' => ['required', 'numeric', 'min:0.1'],
            'voice_price' => ['required', 'numeric', 'min:0.1'],
            'call_price_per_minute' => ['required', 'numeric', 'min:0.1'],
        ]);

        $request->user()->femaleProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $data,
        );

        return back()->with('success', 'Prices updated.');
    }

    public function updateBank(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'bank_name' => ['required', 'string', 'max:255'],
            'bank_account' => ['required', 'string', 'max:255'],
            'bank_holder' => ['required', 'string', 'max:255'],
        ]);

        $request->user()->femaleProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $data,
        );

        return back()->with('success', 'Bank details saved.');
    }

    public function submitVerification(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->verification_status === 'approved') {
            return back()->with('error', 'Already verified.');
        }

        if ($user->verification_status === 'pending') {
            return back()->with('error', 'Verification is already pending review.');
        }

        $data = $request->validate([
            'selfie' => ['required', 'image', 'mimes:jpeg,jpg', 'max:5120'],
            'id_photo' => ['nullable', 'image', 'max:5120'],
        ]);

        $selfiePath = $data['selfie']->store('verifications', 'public');
        $idPath = isset($data['id_photo']) ? $data['id_photo']->store('verifications', 'public') : null;

        VerificationRequest::query()->create([
            'user_id' => $user->id,
            'selfie_path' => $selfiePath,
            'id_photo_path' => $idPath,
            'status' => 'pending',
        ]);

        // If the creator has no profile photo yet, use the selfie as their Discover avatar.
        $updates = ['verification_status' => 'pending'];
        if (! $user->avatar) {
            $avatarPath = 'avatars/'.basename($selfiePath);
            Storage::disk('public')->copy($selfiePath, $avatarPath);
            $updates['avatar'] = $avatarPath;
        }

        $user->update($updates);

        return back()->with('success', 'Verification submitted for review.');
    }
}
