<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ManualPaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'country_code',
        'account_title',
        'bank_name',
        'account_number',
        'extra_instructions',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function topUpRequests(): HasMany
    {
        return $this->hasMany(ManualTopUpRequest::class, 'payment_method_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeForCountry(Builder $query, string $countryCode): Builder
    {
        return $query->where('country_code', strtoupper($countryCode));
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /** @return array<string, mixed> */
    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'country_code' => $this->country_code,
            'account_title' => $this->account_title,
            'bank_name' => $this->bank_name,
            'account_number' => $this->account_number,
            'extra_instructions' => $this->extra_instructions,
        ];
    }
}
