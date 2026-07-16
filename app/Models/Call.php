<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Call extends Model
{
    protected $fillable = [
        'male_id',
        'female_id',
        'conversation_id',
        'status',
        'agora_channel',
        'rate_per_minute',
        'duration_seconds',
        'total_charged',
        'commission_amount',
        'started_at',
        'ended_at',
    ];

    protected function casts(): array
    {
        return [
            'rate_per_minute' => 'decimal:2',
            'total_charged' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function male(): BelongsTo
    {
        return $this->belongsTo(User::class, 'male_id');
    }

    public function female(): BelongsTo
    {
        return $this->belongsTo(User::class, 'female_id');
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }
}
