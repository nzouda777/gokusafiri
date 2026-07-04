<?php

namespace App\Http\Middleware;

use App\Settings\GeneralSettings;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckComingSoon
{
    public function __construct(private GeneralSettings $settings) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('admin*', 'livewire*', 'webhooks/*', 'fake-pay/*', 'coming-soon*', 'up', 'login*', 'logout*')) {
            return $next($request);
        }

        if ($this->settings->coming_soon_enabled) {
            return redirect()->to('/coming-soon');
        }

        return $next($request);
    }
}
