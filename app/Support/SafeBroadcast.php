<?php

namespace App\Support;

use Illuminate\Support\Facades\Log;
use Throwable;

class SafeBroadcast
{
    /**
     * Broadcast an event without failing the request when Reverb/Pusher is down.
     */
    public static function dispatch(mixed $event, bool $toOthers = false): void
    {
        try {
            $pending = broadcast($event);

            if ($toOthers) {
                $pending->toOthers();
            }
        } catch (Throwable $e) {
            Log::warning('Broadcast failed: '.$e->getMessage(), [
                'event' => is_object($event) ? $event::class : get_debug_type($event),
                'exception' => $e::class,
            ]);
        }
    }
}
