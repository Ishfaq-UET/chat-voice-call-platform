<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'male_id',
        'female_id',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
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

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function otherParty(User $user): User
    {
        return $user->id === $this->male_id ? $this->female : $this->male;
    }
}
