<?php

namespace App\Http\Controllers;

use App\Models\Tour;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TourIndexController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->render($request, false);
    }

    public function packages(Request $request): Response
    {
        return $this->render($request, true);
    }

    private function render(Request $request, bool $packages): Response
    {
        $query = Tour::published()
            ->with(['destination', 'media', 'schedules'])
            ->when($packages, fn ($q) => $q->packages(), fn ($q) => $q->tours());

        // Search
        if ($q = $request->input('q')) {
            $query->where(fn ($q2) => $q2
                ->whereJsonContains('title->en', $q)
                ->orWhereHas('destination', fn ($d) => $d->where('name', 'like', "%{$q}%"))
            );
        }

        // Destination filter
        if ($dest = $request->input('destination')) {
            $query->whereHas('destination', fn ($d) => $d->where('slug', $dest));
        }

        // Region (via destination relationship)
        if ($regions = $request->input('region')) {
            $query->whereHas('destination', fn ($d) => $d->whereIn('region', (array) $regions));
        }

        // Style
        if ($styles = $request->input('style')) {
            $query->whereIn('style', (array) $styles);
        }

        // Duration
        if ($durations = $request->input('duration')) {
            $query->where(function ($q) use ($durations) {
                foreach ((array) $durations as $d) {
                    [$min, $max] = match ($d) {
                        '1-3' => [1, 3],
                        '4-7' => [4, 7],
                        '8-14' => [8, 14],
                        '15+' => [15, 999],
                        default => [0, 999],
                    };
                    $q->orWhereBetween('duration_days', [$min, $max]);
                }
            });
        }

        // Max price
        if ($maxPrice = $request->input('max_price')) {
            $query->where('base_price', '<=', (int) $maxPrice);
        }

        // Rating
        if ($rating = $request->input('rating')) {
            $minRating = (float) rtrim($rating, '+');
            $query->where('rating_cache', '>=', $minRating);
        }

        // Quick filters
        if ($quick = $request->input('quick')) {
            $quickArr = (array) $quick;
            if (in_array('deals', $quickArr)) {
                $query->where('discount_percent', '>', 0);
            }
            if (in_array('free_cancel', $quickArr)) {
                $query->where('cancellation_days', '>=', 0);
            }
            if (in_array('small_group', $quickArr)) {
                $query->where('max_group_size', '<=', 12);
            }
            if (in_array('best_value', $quickArr)) {
                $query->where('rating_cache', '>=', 4.5)->where('discount_percent', '>', 0);
            }
        }

        // Sorting
        $sort = $request->input('sort', 'recommended');
        match ($sort) {
            'price_asc' => $query->orderBy('base_price'),
            'price_desc' => $query->orderByDesc('base_price'),
            'rating' => $query->orderByDesc('rating_cache'),
            'duration' => $query->orderBy('duration_days'),
            default => $query->orderByDesc('rating_cache')->orderByDesc('reviews_count_cache'),
        };

        $totalCount = $query->count();
        $tours = $query->paginate(12)->withQueryString();

        $wishlistedIds = $request->user()
            ? $request->user()->wishlists()->pluck('tour_id')->flip()->all()
            : [];

        return Inertia::render('Tours/Index', [
            'tours' => [
                'data' => $tours->items() === [] ? [] : collect($tours->items())->map(fn ($t) => $this->formatTour($t, $wishlistedIds)),
                'current_page' => $tours->currentPage(),
                'last_page' => $tours->lastPage(),
                'per_page' => $tours->perPage(),
                'total' => $tours->total(),
                'from' => $tours->firstItem(),
                'to' => $tours->lastItem(),
            ],
            'filters' => $request->only(['sort', 'min_price', 'max_price', 'duration', 'region', 'style', 'rating', 'q', 'destination', 'quick', 'experience']),
            'totalCount' => $totalCount,
            'isPackages' => $packages,
        ]);
    }

    private function formatTour(Tour $tour, array $wishlistedIds = []): array
    {
        $media = $tour->getMedia('gallery');

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
            'deposit_percent' => $tour->deposit_percent ?? 20,
            'difficulty' => $tour->difficulty,
            'inclusions' => $tour->arr('inclusions'),
            'card_url' => $media->first()?->getUrl('card') ?? '',
            'thumb_url' => $media->first()?->getUrl('thumb') ?? '',
            'is_wishlisted' => isset($wishlistedIds[$tour->id]),
            'destination' => $tour->destination ? [
                'id' => $tour->destination->id,
                'name' => $tour->destination->name,
                'country' => $tour->destination->country ?? '',
                'slug' => $tour->destination->slug,
            ] : null,
            'seats_left' => $tour->schedules->where('starts_at', '>', now())->min('seats_left'),
            'booked_this_week' => 0,
        ];
    }
}
