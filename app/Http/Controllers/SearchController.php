<?php

namespace App\Http\Controllers;

use App\Models\Tour;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request): Response
    {
        // Redirect to tours index with search params
        $filters = $request->only(['destination', 'dates', 'travelers', 'experience', 'q']);

        $query = Tour::published()->with(['destination', 'media']);

        if ($q = $filters['q'] ?? $filters['destination'] ?? null) {
            $query->where(fn ($q2) => $q2
                ->whereJsonContains('title->en', $q)
                ->orWhereHas('destination', fn ($d) => $d->where('name', 'like', "%{$q}%"))
            );
        }

        if ($exp = $filters['experience'] ?? null) {
            $query->where('style', $exp);
        }

        $tours = $query->orderByDesc('rating_cache')->paginate(12)->withQueryString();

        return Inertia::render('Tours/Index', [
            'tours' => [
                'data' => collect($tours->items())->map(fn ($t) => $this->formatTour($t)),
                'current_page' => $tours->currentPage(),
                'last_page' => $tours->lastPage(),
                'per_page' => $tours->perPage(),
                'total' => $tours->total(),
                'from' => $tours->firstItem(),
                'to' => $tours->lastItem(),
            ],
            'filters' => $filters,
            'totalCount' => $tours->total(),
            'isPackages' => false,
        ]);
    }

    private function formatTour(Tour $tour): array
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
            'inclusions' => $tour->arr('inclusions'),
            'card_url' => $media->first()?->getUrl('card') ?? '',
            'thumb_url' => $media->first()?->getUrl('thumb') ?? '',
            'destination' => $tour->destination ? [
                'id' => $tour->destination->id,
                'name' => $tour->destination->name,
                'country' => $tour->destination->country ?? '',
                'slug' => $tour->destination->slug,
            ] : null,
        ];
    }
}
