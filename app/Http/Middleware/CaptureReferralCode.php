<?php

namespace App\Http\Middleware;

use App\Services\ReferralService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CaptureReferralCode
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $code = $request->query('ref');

        if ($code && is_string($code) && strlen($code) <= 12) {
            $response->headers->setCookie(
                cookie(ReferralService::COOKIE_NAME, $code, ReferralService::COOKIE_MINUTES)
            );
        }

        return $response;
    }
}
