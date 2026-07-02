<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Inertia\Inertia;
use Inertia\Response;

class PagesController extends Controller
{
    public function about(): Response        { return Inertia::render('Company/About'); }
    public function guides(): Response       { return Inertia::render('Company/Guides'); }
    public function sustainability(): Response { return Inertia::render('Company/Sustainability'); }
    public function careers(): Response      { return Inertia::render('Company/Careers'); }
    public function help(): Response         { return Inertia::render('Support/Help'); }
    public function contact(): Response      { return Inertia::render('Support/Contact'); }
    public function cancellationPolicy(): Response { return Inertia::render('Legal/CancellationPolicy'); }
    public function insurance(): Response    { return Inertia::render('Legal/Insurance'); }
    public function privacy(): Response      { return Inertia::render('Legal/Privacy'); }
    public function terms(): Response        { return Inertia::render('Legal/Terms'); }
    public function cookies(): Response      { return Inertia::render('Legal/Cookies'); }

    public function faq(): Response
    {
        $locale   = app()->getLocale();
        $fallback = config('app.fallback_locale', 'en');

        $faqs = Faq::active()
            ->get()
            ->map(fn (Faq $faq) => [
                'q' => $faq->getTranslation('question', $locale, true)
                        ?: $faq->getTranslation('question', $fallback, false),
                'a' => $faq->getTranslation('answer', $locale, true)
                        ?: $faq->getTranslation('answer', $fallback, false),
            ])
            ->filter(fn ($f) => $f['q'] && $f['a'])
            ->values()
            ->toArray();

        return Inertia::render('FAQ', ['faqs' => $faqs]);
    }
}
