<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManualTopUpRequest extends Model
{
    public const CHANNELS = [
        'jazzcash' => 'JazzCash',
        'easypaisa' => 'EasyPaisa',
        'bank_transfer' => 'Bank transfer',
        'other' => 'Other',
    ];

    protected $fillable = [
        'user_id',
        'payment_method_id',
        'payment_channel',
        'sender_account_name',
        'sender_number',
        'receiver_account',
        'amount',
        'transaction_id',
        'screenshot_path',
        'member_notes',
        'status',
        'admin_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $appends = [
        'screenshot_url',
        'payment_channel_label',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'reviewed_at' => 'datetime',
        ];
    }

    public function getScreenshotUrlAttribute(): ?string
    {
        return $this->screenshot_path ? asset('storage/'.$this->screenshot_path) : null;
    }

    public function getPaymentChannelLabelAttribute(): string
    {
        return $this->paymentMethod?->name
            ?? (self::CHANNELS[$this->payment_channel] ?? ucfirst(str_replace('_', ' ', (string) $this->payment_channel)));
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(ManualPaymentMethod::class, 'payment_method_id');
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
