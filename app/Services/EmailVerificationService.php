<?php

namespace App\Services;

use App\Mail\EmailOtpMail;
use App\Mail\UserStatusMail;
use App\Models\User;
use App\Support\PlatformMail;
use Illuminate\Support\Facades\Hash;

class EmailVerificationService
{
    public function issueAndSend(User $user): bool
    {
        $otp = (string) random_int(100000, 999999);

        $user->forceFill([
            'email_otp_hash' => Hash::make($otp),
            'email_otp_expires_at' => now()->addMinutes(15),
        ])->save();

        return PlatformMail::send($user, new EmailOtpMail($user, $otp));
    }

    public function verify(User $user, string $otp): bool
    {
        if (! $user->email_otp_hash || ! $user->email_otp_expires_at) {
            return false;
        }

        if ($user->email_otp_expires_at->isPast()) {
            return false;
        }

        if (! Hash::check(trim($otp), $user->email_otp_hash)) {
            return false;
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'email_otp_hash' => null,
            'email_otp_expires_at' => null,
        ])->save();

        PlatformMail::send($user, new UserStatusMail(
            user: $user,
            subjectLine: 'Welcome to '.config('app.name'),
            headline: 'Email verified',
            body: 'Your email is verified. You can now use chat, wallet, and calls on '.config('app.name').'.',
            actionUrl: route('dashboard'),
            actionLabel: 'Open app',
        ));

        return true;
    }
}
