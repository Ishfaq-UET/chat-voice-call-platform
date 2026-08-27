<?php

namespace App\Services;

use App\Support\Agora\RtcTokenBuilder2;
use RuntimeException;

class AgoraService
{
    public const ROLE_PUBLISHER = RtcTokenBuilder2::ROLE_PUBLISHER;

    public const ROLE_SUBSCRIBER = RtcTokenBuilder2::ROLE_SUBSCRIBER;

    public function appId(): string
    {
        return (string) config('services.agora.app_id', '');
    }

    public function appCertificate(): string
    {
        return (string) config('services.agora.app_certificate', '');
    }

    public function isConfigured(): bool
    {
        return $this->appId() !== '' && $this->appCertificate() !== '';
    }

    /**
     * Unique Agora channel name for a call (maps to channel_name).
     */
    public function channelForCall(int $callId): string
    {
        return 'call_'.$callId.'_'.substr(hash('sha256', (string) $callId.config('app.key')), 0, 8);
    }

    /**
     * Build an RTC token with integer UID using Agora RtcTokenBuilder2::buildTokenWithUid.
     *
     * @param  string  $channelName  Agora channel
     * @param  int  $uid  Unique integer UID (use the app user id)
     * @param  int  $role  ROLE_PUBLISHER or ROLE_SUBSCRIBER
     * @param  int  $tokenExpireSeconds  Token lifetime from now
     * @param  int|null  $privilegeExpireSeconds  Privilege lifetime from now (defaults to token expire)
     */
    public function buildTokenWithUid(
        string $channelName,
        int $uid,
        int $role = self::ROLE_PUBLISHER,
        int $tokenExpireSeconds = 3600,
        ?int $privilegeExpireSeconds = null,
    ): string {
        if (! $this->isConfigured()) {
            throw new RuntimeException('Agora is not configured. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE in .env.');
        }

        if ($uid < 1) {
            throw new RuntimeException('Agora UID must be a positive integer.');
        }

        if ($channelName === '') {
            throw new RuntimeException('Agora channel name is required.');
        }

        $privilegeExpireSeconds ??= $tokenExpireSeconds;

        return RtcTokenBuilder2::buildTokenWithUid(
            $this->appId(),
            $this->appCertificate(),
            $channelName,
            $uid,
            $role,
            $tokenExpireSeconds,
            $privilegeExpireSeconds,
        );
    }

    /**
     * Convenience wrapper used by call screens.
     */
    public function tokenForUser(string $channelName, int $userId, int $expireSeconds = 3600): string
    {
        return $this->buildTokenWithUid(
            $channelName,
            $userId,
            self::ROLE_PUBLISHER,
            $expireSeconds,
            $expireSeconds,
        );
    }
}
