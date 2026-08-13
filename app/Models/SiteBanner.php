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
        'country_code',
        'is_active',
        'starts_at',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
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
     * Prefer a country-specific banner; fall back to a global (null country) banner.
     *
     * @return array{id:int,title:?string,message:string,image_url:?string,link_url:?string,link_label:?string,country_code:?string,version:string}|null
     */
    public static function resolveForRequest(Request $request): ?array
    {
        $country = static::detectCountryCode($request);

        $base = static::query()->active()->currentlyRunning();

        $banner = null;

        if ($country) {
            $banner = (clone $base)
                ->where('country_code', strtoupper($country))
                ->latest('updated_at')
                ->first();
        }

        if (! $banner) {
            $banner = (clone $base)
                ->whereNull('country_code')
                ->latest('updated_at')
                ->first();
        }

        return $banner?->toPublicArray();
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
            'country_code' => $this->country_code,
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
