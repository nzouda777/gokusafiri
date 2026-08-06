<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use App\Models\Tour;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $wishlistedIds = $request->user()
            ? $request->user()->wishlists()->pluck('tour_id')->flip()->all()
            : [];

        $featured = Tour::published()
            ->packages()
            ->with(['destination', 'media'])
            ->withCount(['bookings as booked_this_week' => fn ($q) => $q->whereBetween('bookings.created_at', [now()->subWeek(), now()])])
            ->orderByDesc('rating_cache')
            ->limit(3)
            ->get()
            ->map(fn (Tour $t) => $this->formatTour($t, $wishlistedIds));

        $destinations = $this->getDestinations();
        $testimonials = $this->getTestimonials();
        $faqs = $this->getFaqs();

        return Inertia::render('Home', [
            'featured' => $featured,
            'destinations' => $destinations,
            'testimonials' => $testimonials,
            'faqs' => $faqs,
            'stats' => [
                'travelers' => '120k+',
                'countries' => 14,
                'rating' => 4.9,
            ],
        ]);
    }

    private function formatTour(Tour $tour, array $wishlistedIds = []): array
    {
        $media = $tour->getMedia('gallery');
        $hero = $media->first()?->getUrl('hero') ?? '';
        $card = $media->first()?->getUrl('card') ?? '';
        $thumb = $media->first()?->getUrl('thumb') ?? '';

        return [
            'id' => $tour->id,
            'slug' => $tour->slug,
            'title' => $tour->title,
            'excerpt' => $tour->excerpt,
            'type' => $tour->type,
            'base_price' => $tour->base_price,
            'currency' => $tour->currency,
            'duration_days' => $tour->duration_days,
            'max_group_size' => $tour->max_group_size,
            'style' => $tour->style,
            'rating_cache' => $tour->rating_cache,
            'reviews_count_cache' => $tour->reviews_count_cache,
            'badge' => $tour->badge,
            'discount_percent' => $tour->discount_percent,
            'cancellation_days' => $tour->cancellation_days,
            'inclusions' => $tour->arr('inclusions'),
            'hero_url' => $hero,
            'card_url' => $card,
            'thumb_url' => $thumb,
            'is_wishlisted' => isset($wishlistedIds[$tour->id]),
            'destination' => $tour->destination ? [
                'id' => $tour->destination->id,
                'name' => $tour->destination->name,
                'country' => $tour->destination->country ?? '',
                'slug' => $tour->destination->slug,
            ] : null,
            'seats_left' => $tour->schedules()->where('starts_at', '>', now())->min('seats_left'),
            'booked_this_week' => $tour->booked_this_week ?? 0,
        ];
    }

    private function getDestinations(): array
    {
        return [
            ['name' => 'Masai Mara',        'slug' => 'masai-mara',       'image' => '/images/destinations/masai-mara.jpg',     'count' => 24, 'country' => 'Kenya', 'available' => false],
            ['name' => 'Victoria Falls',     'slug' => 'victoria-falls',   'image' => '/images/destinations/victoria-falls.jpg', 'count' => 11, 'country' => 'Zambia', 'available' => false],
            ['name' => 'Cape Town',          'slug' => 'cape-town',        'image' => '/images/destinations/cape-town.jpg',      'count' => 18, 'country' => 'South Africa', 'available' => false],
            ['name' => 'Sahara & Marrakech', 'slug' => 'sahara-marrakech', 'image' => '/images/destinations/marrakech.jpg',      'count' => 15, 'country' => 'Morocco', 'available' => false],
            ['name' => 'Bwindi Forest',      'slug' => 'bwindi-forest',    'image' => '/images/destinations/bwindi.jpg',         'count' => 7,  'country' => 'Uganda', 'available' => false],
        ];
    }

    private function getTestimonials(): array
    {
        return [
            [
                'name' => 'Amara O.',
                'location' => 'Serengeti',
                'year' => 2026,
                'text' => 'The Migration crossing left us speechless. Our guide knew exactly where to be, every single day.',
            ],
            [
                'name' => 'James R.',
                'location' => 'Zanzibar',
                'year' => 2026,
                'text' => 'Booked in minutes, paid a deposit, and everything from flights to lodges just worked. Flawless.',
            ],
            [
                'name' => 'Lena M.',
                'location' => 'Kilimanjaro',
                'year' => 2024,
                'text' => 'Summiting Kilimanjaro with Gokusafiri was the trip of a lifetime. The crew made it feel safe.',
            ],
        ];
    }

    private function getFaqs(): array
    {
        $locale = app()->getLocale();
        $fallback = config('app.fallback_locale', 'en');

        return Faq::active()->get()->map(fn (Faq $faq) => [
            'q' => $faq->getTranslation('question', $locale, true) ?: $faq->getTranslation('question', $fallback, false),
            'a' => $faq->getTranslation('answer', $locale, true) ?: $faq->getTranslation('answer', $fallback, false),
        ])->filter(fn ($f) => $f['q'] && $f['a'])->values()->toArray();
    }
}
