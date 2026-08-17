<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteBanner extends Model
{
    protected $fillable = [
        'title',
        'message',
        'image_path',
        'link_url',
        'link_label',
        'country_codes',
        'is_active',
        'starts_at',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'country_codes' => 'array',
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path
            ? asset('storage/'.$this->image_path)
            : null;
    }

    /** @return list<string> */
    public function targetedCountryCodes(): array
    {
        $codes = $this->country_codes ?? [];

        if (! is_array($codes)) {
            return [];
        }

        return array_values(array_unique(array_filter(array_map(
            fn ($code) => strtoupper(trim((string) $code)),
            $codes,
        ))));
    }

    public function isGlobal(): bool
    {
        return $this->targetedCountryCodes() === [];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeCurrentlyRunning(Builder $query): Builder
    {
        $now = now();

        return $query
            ->where(function (Builder $q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function (Builder $q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            });
    }

    /**
     * Prefer a country-specific banner; fall back to a global (empty countries) banner.
     *
     * @return array{id:int,title:?string,message:string,image_url:?string,link_url:?string,link_label:?string,country_codes:list<string>,version:int}|null
     */
    public static function resolveForRequest(Request $request): ?array
    {
        $country = static::detectCountryCode($request);
        $banners = static::query()
            ->active()
            ->currentlyRunning()
            ->latest('updated_at')
            ->get();

        if ($country) {
            $match = $banners->first(
                fn (self $banner) => in_array($country, $banner->targetedCountryCodes(), true),
            );

            if ($match) {
                return $match->toPublicArray();
            }
        }

        return $banners
            ->first(fn (self $banner) => $banner->isGlobal())
            ?->toPublicArray();
    }

    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'message' => $this->message,
            'image_url' => $this->image_url,
            'link_url' => $this->link_url,
            'link_label' => $this->link_label,
            'country_codes' => $this->targetedCountryCodes(),
            'version' => $this->updated_at?->timestamp ?? $this->id,
        ];
    }

    public static function detectCountryCode(Request $request): ?string
    {
        $user = $request->user();
        if ($user?->country_code) {
            return strtoupper((string) $user->country_code);
        }

        $header = $request->header('CF-IPCountry')
            ?: $request->server('HTTP_CF_IPCOUNTRY');

        if (is_string($header) && strlen($header) === 2 && strtoupper($header) !== 'XX') {
            return strtoupper($header);
        }

        $sessionCountry = $request->session()->get('visitor_country_code');
        if (is_string($sessionCountry) && strlen($sessionCountry) === 2) {
            return strtoupper($sessionCountry);
        }

        return null;
    }

    public function deleteImage(): void
    {
        if ($this->image_path) {
            Storage::disk('public')->delete($this->image_path);
        }
    }
}
