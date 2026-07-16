<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificationRequest extends Model
{
    protected $fillable = [
        'user_id',
        'selfie_path',
        'id_photo_path',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $appends = [
        'selfie_url',
        'id_photo_url',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function getSelfieUrlAttribute(): ?string
    {
        return $this->selfie_path ? asset('storage/'.$this->selfie_path) : null;
    }

    public function getIdPhotoUrlAttribute(): ?string
    {
        return $this->id_photo_path ? asset('storage/'.$this->id_photo_path) : null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
