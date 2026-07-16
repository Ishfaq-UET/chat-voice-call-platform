<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FemaleProfile extends Model
{
    protected $fillable = [
        'user_id',
        'chat_price',
        'voice_price',
        'call_price_per_minute',
        'bank_name',
        'bank_account',
        'bank_holder',
    ];

    protected function casts(): array
    {
        return [
            'chat_price' => 'decimal:2',
            'voice_price' => 'decimal:2',
            'call_price_per_minute' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
