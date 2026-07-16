<?php

namespace App\Services;

/**
 * Minimal Agora RTC token builder (UID integer tokens).
 * Uses App ID + App Certificate from config when available.
 * Falls back to empty token in local demo mode when certificate is missing.
 */
class AgoraService
{
    public function appId(): string
    {
        return (string) config('services.agora.app_id', '');
    }

    public function channelForCall(int $callId): string
    {
        return 'call_'.$callId.'_'.substr(md5((string) $callId), 0, 8);
    }

    public function buildToken(string $channel, int $uid, int $expireSeconds = 3600): string
    {
        $appId = $this->appId();
        $certificate = (string) config('services.agora.app_certificate', '');

        if ($appId === '' || $certificate === '') {
            // Demo / local mode — Agora accepts empty token if certificate is not enabled.
            return '';
        }

        $privilegeExpire = time() + $expireSeconds;

        return $this->buildRtcTokenWithUid($appId, $certificate, $channel, $uid, $privilegeExpire);
    }

    private function buildRtcTokenWithUid(
        string $appId,
        string $appCertificate,
        string $channelName,
        int $uid,
        int $privilegeExpireTs,
    ): string {
        $version = '007';
        $message = [
            'salt' => random_int(1, 99999999),
            'ts' => time() + 24 * 3600,
            'messages' => [
                1 => $privilegeExpireTs, // join channel
                2 => $privilegeExpireTs, // publish audio
            ],
        ];

        $content = $this->packMessage($message);
        $signature = hash_hmac('sha256', $appId.$channelName.$uid.$content, $appCertificate, true);
        $crcChannel = crc32($channelName);
        $crcUid = crc32((string) $uid);

        $raw = $signature.pack('V', $crcChannel).pack('V', $crcUid).pack('v', strlen($content)).$content;
        $token = $version.$appId.base64_encode($raw);

        return $token;
    }

    private function packMessage(array $message): string
    {
        $buffer = pack('V', $message['salt']).pack('V', $message['ts']).pack('v', count($message['messages']));
        foreach ($message['messages'] as $key => $value) {
            $buffer .= pack('v', $key).pack('V', $value);
        }

        return $buffer;
    }
}
