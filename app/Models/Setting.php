<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    public static function getValue(string $key, mixed $default = null): mixed
    {
        return Cache::remember("setting.{$key}", 60, function () use ($key, $default) {
            $setting = static::query()->where('key', $key)->first();

            return $setting?->value ?? $default;
        });
    }

    public static function setValue(string $key, mixed $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => (string) $value]);
        Cache::forget("setting.{$key}");
    }

    public static function commissionPercent(): float
    {
        return (float) static::getValue('commission_percent', 20);
    }

    public static function minWithdrawal(): float
    {
        return (float) static::getValue('min_withdrawal', 20);
    }

    public static function manualTopUpInstructions(): string
    {
        return (string) static::getValue(
            'manual_topup_instructions',
            "Send payment via JazzCash, EasyPaisa, or bank transfer, then submit proof in the wallet form.\nJazzCash: 0300-0000000\nEasyPaisa: 0300-0000000\nBank: Your Bank Name · Account 0000000000 · Wyak Dating",
        );
    }

    public static function logoPath(): ?string
    {
        $path = static::getValue('logo_path');

        return $path ? (string) $path : null;
    }

    public static function faviconPath(): ?string
    {
        $path = static::getValue('favicon_path');

        return $path ? (string) $path : null;
    }

    public static function logoUrl(): ?string
    {
        $path = static::logoPath();

        return $path ? asset('storage/'.$path) : null;
    }

    public static function faviconUrl(): ?string
    {
        $path = static::faviconPath();

        return $path ? asset('storage/'.$path) : null;
    }

    public static function contactEmail(): string
    {
        return (string) static::getValue('contact_email', 'support@wyakdating.local');
    }

    public static function whatsappNumber(): string
    {
        return (string) static::getValue('whatsapp_number', '');
    }

    public static function whatsappMessage(): string
    {
        return (string) static::getValue(
            'whatsapp_message',
            'Hi! I need help with '.config('app.name', 'Wyak Dating').'.',
        );
    }

    /**
     * Digits-only international number for WhatsApp links (no + or spaces).
     */
    public static function whatsappDigits(): string
    {
        $digits = preg_replace('/\D+/', '', static::whatsappNumber()) ?? '';

        // International dial prefix 00… → drop leading zeros pair
        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }

        return $digits;
    }

    public static function whatsappUrl(): ?string
    {
        return static::buildWhatsappUrl(static::whatsappDigits(), static::whatsappMessage());
    }

    public static function adWhatsappNumber(): string
    {
        return (string) static::getValue('ad_whatsapp_number', '');
    }

    public static function adWhatsappMessage(): string
    {
        return (string) static::getValue('ad_whatsapp_message', '');
    }

    public static function adWhatsappDigits(): string
    {
        $digits = preg_replace('/\D+/', '', static::adWhatsappNumber()) ?? '';

        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }

        return $digits;
    }

    public static function adWhatsappUrl(): ?string
    {
        return static::buildWhatsappUrl(static::adWhatsappDigits(), static::adWhatsappMessage());
    }

    /**
     * @return array{email: string, whatsapp_number: string, whatsapp_message: string, whatsapp_url: string|null}
     */
    public static function contact(): array
    {
        return [
            'email' => static::contactEmail(),
            'whatsapp_number' => static::whatsappNumber(),
            'whatsapp_message' => static::whatsappMessage(),
            'whatsapp_url' => static::whatsappUrl(),
        ];
    }

    public static function brandName(): string
    {
        $fromName = trim((string) static::getValue('mail_from_name', ''));

        if ($fromName !== '') {
            return $fromName;
        }

        $appName = trim((string) config('app.name', 'Wyak Dating'));

        // Legacy name still used on some servers
        if ($appName === '' || strcasecmp($appName, 'ChatVoiceCall') === 0) {
            return 'wyakdating';
        }

        return $appName;
    }

    public static function mailEnabled(): bool
    {
        return filter_var(static::getValue('mail_enabled', false), FILTER_VALIDATE_BOOLEAN);
    }

    public static function brevoApiKey(): string
    {
        return trim((string) static::getValue('brevo_api_key', ''));
    }

    /**
     * @return array{
     *     enabled: bool,
     *     api_key: string,
     *     from_address: string,
     *     from_name: string
     * }
     */
    public static function mail(): array
    {
        return [
            'enabled' => static::mailEnabled(),
            'api_key' => static::brevoApiKey(),
            'from_address' => (string) static::getValue('mail_from_address', static::contactEmail()),
            'from_name' => (string) static::getValue('mail_from_name', config('app.name', 'Wyak Dating')),
        ];
    }

    public static function mailIsConfigured(): bool
    {
        $mail = static::mail();

        return $mail['enabled']
            && $mail['api_key'] !== ''
            && $mail['from_address'] !== '';
    }

    public static function buildWhatsappUrl(string $digits, string $message = ''): ?string
    {
        if ($digits === '' || strlen($digits) < 10 || strlen($digits) > 15) {
            return null;
        }

        if (str_starts_with($digits, '0')) {
            return null;
        }

        $query = ['phone' => $digits];
        $message = trim($message);

        if ($message !== '') {
            $query['text'] = $message;
        }

        return 'https://api.whatsapp.com/send?'.http_build_query($query, '', '&', PHP_QUERY_RFC3986);
    }
}
