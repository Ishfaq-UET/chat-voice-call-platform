<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreatorController extends Controller
{
    public function show(Request $request, User $female): Response
    {
        abort_unless($request->user()?->isMale(), 403);
        abort_unless($female->isVerifiedFemale() && ! $female->is_banned, 404);

        $female->load('femaleProfile');

        return Inertia::render('Male/CreatorShow', [
            'creator' => [
                'id' => $female->id,
                'name' => $female->name,
                'bio' => $female->bio,
                'avatar_url' => $female->avatar_url,
                'is_online' => $female->is_online,
                'online_at' => $female->online_at?->toIso8601String(),
                'verification_status' => $female->verification_status,
                'created_at' => $female->created_at?->toDateString(),
                'female_profile' => $female->femaleProfile,
            ],
            'walletBalance' => (float) app(WalletService::class)->ensureWallet($request->user())->balance,
        ]);
    }
}
