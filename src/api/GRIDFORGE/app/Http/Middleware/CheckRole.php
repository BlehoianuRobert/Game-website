<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $player = auth()->user();

        if (! $player || ! in_array($player->role?->name, $roles, true)) {
            abort(403);
        }

        return $next($request);
    }
}
