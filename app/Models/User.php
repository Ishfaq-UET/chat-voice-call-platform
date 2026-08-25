<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const ROLE_MALE = 'male';

    public const ROLE_FEMALE = 'female';

    public const ROLE_ADMIN = 'admin';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'bio',
        'phone',
        'country_code',
        'verification_status',
        'online_at',
        'is_banned',
        'email_otp_hash',
        'email_otp_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'email_otp_hash',
    ];

    protected $appends = [
        'avatar_url',
        'is_online',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'email_otp_expires_at' => 'datetime',
            'password' => 'hashed',
            'online_at' => 'datetime',
            'is_banned' => 'boolean',
        ];
    }

    /**
     * Admins are treated as verified for middleware purposes.
     */
    public function hasVerifiedEmail(): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        return $this->email_verified_at !== null;
    }

    public function sendEmailVerificationNotification(): void
    {
        app(\App\Services\EmailVerificationService::class)->issueAndSend($this);
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if (! $this->avatar) {
            return null;
        }

        if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://')) {
            return $this->avatar;
        }

        return asset('storage/'.$this->avatar);
    }

    public function getIsOnlineAttribute(): bool
    {
        return $this->online_at !== null && $this->online_at->gt(now()->subMinutes(2));
    }

    public function isMale(): bool
    {
        return $this->role === self::ROLE_MALE;
    }

    public function isFemale(): bool
    {
        return $this->role === self::ROLE_FEMALE;
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isVerifiedFemale(): bool
    {
        return $this->isFemale() && $this->verification_status === 'approved';
    }

    public function sameCountryAs(User $other): bool
    {
        return strtoupper((string) $this->country_code) === strtoupper((string) $other->country_code);
    }

    public function scopeInCountry($query, ?string $countryCode)
    {
        return $query->where('country_code', strtoupper((string) $countryCode));
    }

    public function femaleProfile(): HasOne
    {
        return $this->hasOne(FemaleProfile::class);
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function verificationRequests(): HasMany
    {
        return $this->hasMany(VerificationRequest::class);
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class);
    }

    public function nameChangeRequests(): HasMany
    {
        return $this->hasMany(NameChangeRequest::class);
    }

    public function manualTopUpRequests(): HasMany
    {
        return $this->hasMany(ManualTopUpRequest::class);
    }
}
