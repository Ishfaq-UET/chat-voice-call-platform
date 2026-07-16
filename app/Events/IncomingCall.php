<?php

namespace App\Events;

use App\Models\Call;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class IncomingCall implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Call $call)
    {
        $this->call->load('male:id,name,avatar');
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.'.$this->call->female_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'call.incoming';
    }

    public function broadcastWith(): array
    {
        return [
            'call' => [
                'id' => $this->call->id,
                'status' => $this->call->status,
                'agora_channel' => $this->call->agora_channel,
                'rate_per_minute' => $this->call->rate_per_minute,
                'male' => [
                    'id' => $this->call->male->id,
                    'name' => $this->call->male->name,
                    'avatar_url' => $this->call->male->avatar_url,
                ],
            ],
        ];
    }
}
