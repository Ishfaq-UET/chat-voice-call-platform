<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\EmailVerificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    public function store(Request $request, EmailVerificationService $verification): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        $sent = $verification->issueAndSend($request->user());

        return back()->with(
            'status',
            $sent ? 'verification-otp-sent' : 'verification-otp-failed',
        );
    }
}
