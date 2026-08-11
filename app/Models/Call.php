<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Call extends Model
{
    public const TYPE_AUDIO = 'audio';

    public const TYPE_VIDEO = 'video';

    public const STATUS_RINGING = 'ringing';

    public const STATUS_ACTIVE = 'active'; // accepted / in progress

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_MISSED = 'missed';

    public const STATUS_ENDED = 'ended';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'male_id',
        'female_id',
        'conversation_id',
        'type',
        'status',
        'agora_channel',
        'rate_per_minute',
        'duration_seconds',
        'total_charged',
        'commission_amount',
        'started_at',
        'answered_at',
        'ended_at',
    ];

    protected function casts(): array
    {
        return [
            'rate_per_minute' => 'decimal:2',
            'total_charged' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'started_at' => 'datetime',
            'answered_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function isVideo(): bool
    {
        return $this->type === self::TYPE_VIDEO;
    }

    public function isAudio(): bool
    {
        return $this->type === self::TYPE_AUDIO;
    }

    /** Alias for Agora schema naming (caller = member). */
    public function getCallerIdAttribute(): int
    {
        return (int) $this->male_id;
    }

    /** Alias for Agora schema naming (receiver = creator). */
    public function getReceiverIdAttribute(): int
    {
        return (int) $this->female_id;
    }

    /** Alias for channel_name. */
    public function getChannelNameAttribute(): ?string
    {
        return $this->agora_channel;
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
