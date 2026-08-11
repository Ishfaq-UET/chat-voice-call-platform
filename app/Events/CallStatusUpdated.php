<?php

namespace App\Events;

use App\Models\Call;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Call $call)
    {
        $this->call->load(['male:id,name', 'female:id,name']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.'.$this->call->male_id),
            new PrivateChannel('App.Models.User.'.$this->call->female_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'call.status';
    }

    public function broadcastWith(): array
    {
        return [
            'call' => [
                'id' => $this->call->id,
                'type' => $this->call->type,
                'status' => $this->call->status,
                'duration_seconds' => $this->call->duration_seconds,
                'total_charged' => $this->call->total_charged,
                'agora_channel' => $this->call->agora_channel,
            ],
        ];
    }
}
