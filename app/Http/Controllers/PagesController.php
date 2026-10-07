<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use App\Models\GalleryCountry;
use App\Models\GalleryItem;
use Illuminate\Http\Request;
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

    public function gallery(Request $request): Response
    {
        $locale   = app()->getLocale();
        $fallback = config('app.fallback_locale', 'en');

        // Media filed under a deactivated country is hidden along with its tab.
        $items = GalleryItem::active()
            ->with('country')
            ->where(fn ($q) => $q->whereNull('gallery_country_id')
                ->orWhereHas('country', fn ($c) => $c->where('is_active', true)))
            ->get()
            ->map(function (GalleryItem $item) use ($locale, $fallback) {
                $media = $item->getFirstMedia('file');
                if (! $media) {
                    return null;
                }

                $isVideo = str_starts_with($media->mime_type, 'video/');

                $width = null;
                $height = null;
                if (! $isVideo) {
                    $size = @getimagesize($media->getPath());
                    if ($size) {
                        [$width, $height] = $size;
                    }
                }

                return [
                    'id'        => $item->id,
                    'country'   => $item->country?->slug,
                    'type'      => $isVideo ? 'video' : 'image',
                    'url'       => $media->getUrl(),
                    'thumb_url' => $isVideo ? null : $media->getUrl('thumb'),
                    'caption'   => $item->getTranslation('caption', $locale, true)
                                ?: $item->getTranslation('caption', $fallback, false),
                    'width'     => $width,
                    'height'    => $height,
                ];
            })
            ->filter()
            ->values()
            ->toArray();

        // Only countries that actually have media get a tab, in admin-defined order.
        $present   = array_unique(array_filter(array_column($items, 'country')));
        $countries = GalleryCountry::active()
            ->whereIn('slug', $present)
            ->get()
            ->map(fn (GalleryCountry $country) => [
                'slug' => $country->slug,
                'name' => $country->getTranslation('name', $locale, true)
                        ?: $country->getTranslation('name', $fallback, false),
            ])
            ->values()
            ->toArray();

        // ?country=uganda deep-links to a tab; anything unknown falls back to "All".
        $requested     = (string) $request->query('country', '');
        $activeCountry = in_array($requested, array_column($countries, 'slug'), true) ? $requested : null;

        return Inertia::render('Gallery', [
            'items'         => $items,
            'countries'     => $countries,
            'activeCountry' => $activeCountry,
        ]);
    }
}
