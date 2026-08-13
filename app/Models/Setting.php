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
}
