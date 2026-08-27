<?php

namespace App\Support;

use Illuminate\Support\Facades\Log;
use Throwable;

class SafeBroadcast
{
    /**
     * Broadcast an event without failing the request when Reverb/Pusher is down.
     *
     * Laravel's PendingBroadcast sends in __destruct(), so we unset it inside
     * the try block to catch connection failures.
     */
    public static function dispatch(mixed $event, bool $toOthers = false): void
    {
        try {
            $pending = broadcast($event);

            if ($toOthers) {
                $pending->toOthers();
            }

            // Force broadcast now (inside try) instead of on object destruction later.
            unset($pending);
        } catch (Throwable $e) {
            Log::warning('Broadcast failed: '.$e->getMessage(), [
                'event' => is_object($event) ? $event::class : get_debug_type($event),
                'exception' => $e::class,
            ]);
        }
    }
}
