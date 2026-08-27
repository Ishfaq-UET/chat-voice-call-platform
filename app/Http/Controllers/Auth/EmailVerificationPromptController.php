<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\EmailVerificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    public function __invoke(Request $request): RedirectResponse|Response
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        return Inertia::render('Auth/VerifyEmail', [
            'status' => session('status'),
            'email' => $request->user()->email,
        ]);
    }

    public function verify(Request $request, EmailVerificationService $verification): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        $data = $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        if (! $verification->verify($request->user(), $data['otp'])) {
            return back()->withErrors([
                'otp' => 'Invalid or expired code. Request a new one and try again.',
            ]);
        }

        return redirect()->intended(route('dashboard', absolute: false))
            ->with('success', 'Email verified successfully.');
    }
}
