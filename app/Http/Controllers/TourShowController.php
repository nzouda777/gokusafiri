<?php

namespace App\Http\Controllers;

use App\Models\Tour;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TourShowController extends Controller
{
    public function show(Request $request): Response
    {
        $slug = $request->route('slug');
        $tour = Tour::published()
            ->where('slug', $slug)
            ->with(['destination', 'media', 'schedules', 'addons', 'reviews' => fn ($q) => $q->where('is_approved', true)->with('user')->latest()])
            ->firstOrFail();

        $userId = $request->user()?->id;
        $isWishlisted = $userId
            ? $tour->wishlists()->where('user_id', $userId)->exists()
            : false;
        $userHasReviewed = $userId
            ? $tour->reviews()->where('user_id', $userId)->exists()
            : false;

        $media = $tour->getMedia('gallery');

        $gallery = $media->map(fn ($m) => [
            'id' => $m->id,
            'url' => $m->getUrl(),
            'thumb_url' => $m->getUrl('thumb'),
            'card_url' => $m->getUrl('card'),
            'hero_url' => $m->getUrl('hero'),
        ])->values();

        $schedules = $tour->schedules()
            ->where('starts_at', '>', now())
            ->orderBy('starts_at')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'start_date' => $s->starts_at->toDateString(),
                'end_date' => $s->ends_at->toDateString(),
                'capacity' => $s->capacity,
                'seats_left' => max(0, $s->capacity - $s->bookings()->count()),
                'price_override' => $s->price_override,
            ]);

        $seatsLeft = $schedules->min('seats_left');

        return Inertia::render('Tours/Show', [
            'tour' => [
                'id' => $tour->id,
                'slug' => $tour->slug,
                'title' => $tour->title,
                'excerpt' => $tour->excerpt,
                'description' => $tour->description,
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
                'destination' => $tour->destination ? [
                    'id' => $tour->destination->id,
                    'name' => $tour->destination->name,
                    'country' => $tour->destination->country ?? '',
                    'slug' => $tour->destination->slug,
                ] : null,
                'deposit_percent' => $tour->deposit_percent ?? 20,
                'difficulty' => $tour->difficulty,
                'min_age' => $tour->min_age,
                'languages' => $tour->languages ?? [],
                'practical_info' => $tour->practical_info,
                'included' => $tour->arr('included'),
                'excluded' => $tour->arr('excluded'),
                'inclusions' => $tour->arr('inclusions'),
                'itinerary' => $tour->arr('itinerary'),
                'gallery' => $gallery,
                'hero_url' => $gallery->first()['hero_url'] ?? '',
                'card_url' => $gallery->first()['card_url'] ?? '',
                'addons' => $tour->addons->map(fn ($a) => [
                    'id'          => $a->id,
                    'name'        => $a->getTranslation('label', app()->getLocale(), false),
                    'price'       => $a->price_per_person,
                    'description' => $a->getTranslation('description', app()->getLocale(), false),
                ]),
                'highlights' => $tour->arr('highlights'),
                'schedules' => $schedules,
                'is_wishlisted' => $isWishlisted,
                'user_has_reviewed' => $userHasReviewed,
                'seats_left' => $seatsLeft,
                'reviews' => $tour->reviews->map(fn ($r) => [
                    'id'             => $r->id,
                    'rating'         => $r->rating,
                    'body'           => $r->body,
                    'author_name'    => $r->author_name ?? $r->user?->name ?? 'Anonymous',
                    'author_avatar'  => $r->author_avatar,
                    'location_label' => $r->location_label,
                    'year'           => $r->traveled_at?->year ?? $r->created_at->year,
                ]),
            ],
        ]);
    }
}
