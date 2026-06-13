<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    private const SUPPORTED = ['en', 'fr', 'es'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->route('locale')
            ?? $request->session()->get('locale')
            ?? $this->fromAcceptLanguage($request)
            ?? 'en';

        if (! in_array($locale, self::SUPPORTED, true)) {
            $locale = 'en';
        }

        app()->setLocale($locale);
        $request->session()->put('locale', $locale);

        if ($user = $request->user()) {
            if ($user->locale !== $locale) {
                $user->update(['locale' => $locale]);
            }
        }

        return $next($request);
    }

    private function fromAcceptLanguage(Request $request): ?string
    {
        $header = $request->header('Accept-Language', '');
        foreach (explode(',', $header) as $lang) {
            $code = strtolower(substr(trim($lang), 0, 2));
            if (in_array($code, self::SUPPORTED, true)) {
                return $code;
            }
        }

        return null;
    }
}
