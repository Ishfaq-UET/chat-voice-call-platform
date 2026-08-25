<?php

namespace App\Support;

use App\Mail\Transport\BrevoTransport;
use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class PlatformMail
{
    public static function configureFromSettings(): void
    {
        if (! Setting::mailIsConfigured()) {
            return;
        }

        $mail = Setting::mail();

        Config::set('mail.default', 'brevo');
        Config::set('mail.mailers.brevo', [
            'transport' => 'brevo',
        ]);
        Config::set('mail.from.address', $mail['from_address']);
        Config::set('mail.from.name', $mail['from_name']);
    }

    public static function registerTransport(): void
    {
        Mail::extend('brevo', function () {
            $apiKey = Setting::brevoApiKey();

            if ($apiKey === '') {
                throw new \RuntimeException('Brevo API key is not configured.');
            }

            return new BrevoTransport($apiKey);
        });
    }

    public static function send(object $notifiable, object $mailable): bool
    {
        if (! Setting::mailIsConfigured()) {
            Log::info('Mail skipped (Brevo not configured)', [
                'mailable' => $mailable::class,
            ]);

            return false;
        }

        self::configureFromSettings();

        try {
            $email = is_object($notifiable) && isset($notifiable->email)
                ? $notifiable->email
                : (string) $notifiable;

            Mail::mailer('brevo')->to($email)->send($mailable);

            return true;
        } catch (Throwable $e) {
            Log::warning('Mail send failed: '.$e->getMessage(), [
                'mailable' => $mailable::class,
                'exception' => $e::class,
            ]);

            return false;
        }
    }
}
