<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth()->check() || ! auth()->user()->hasAnyRole(['admin', 'super_admin'])) {
            abort(403, 'This area is restricted to administrators.');
        }

        return $next($request);
    }
}
