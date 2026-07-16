<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateOnlineStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->is_banned) {
            $user->forceFill(['online_at' => now()])->saveQuietly();
        }

        return $next($request);
    }
}
