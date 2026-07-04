<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'first_name' => $request->user()->first_name ?? null,
                    'last_name' => $request->user()->last_name ?? null,
                    'email' => $request->user()->email,
                    'avatar' => method_exists($request->user(), 'getFirstMediaUrl')
                        ? $request->user()->getFirstMediaUrl('avatar') ?: null
                        : null,
                    'tier' => $request->user()->tier ?? 'Explorer',
                    'member_since' => $request->user()->created_at?->year,
                ] : null,
            ],
            'locale' => fn () => app()->getLocale(),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'subscribed' => $request->session()->get('subscribed'),
            ],
            'stripe_key' => config('services.stripe.key'),
        ]);
    }
}
