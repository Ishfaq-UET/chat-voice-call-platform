<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    return \App\Models\Conversation::query()
        ->where('id', $conversationId)
        ->where(function ($q) use ($user) {
            $q->where('male_id', $user->id)->orWhere('female_id', $user->id);
        })
        ->exists();
});
