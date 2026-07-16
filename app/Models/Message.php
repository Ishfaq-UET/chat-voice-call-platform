<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'type',
        'body',
        'media_path',
        'amount_charged',
        'commission_amount',
    ];

    protected $appends = [
        'media_url',
    ];

    protected function casts(): array
    {
        return [
            'amount_charged' => 'decimal:2',
            'commission_amount' => 'decimal:2',
        ];
    }

    public function getMediaUrlAttribute(): ?string
    {
        return $this->media_path ? asset('storage/'.$this->media_path) : null;
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
