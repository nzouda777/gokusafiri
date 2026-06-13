<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Tour;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SavedController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $savedTours = Tour::published()
            ->whereHas('wishlists', fn ($q) => $q->where('user_id', $user->id))
            ->with(['destination', 'media'])
            ->get()
            ->map(fn (Tour $tour) => [
                'id' => $tour->id,
                'slug' => $tour->slug,
                'title' => $tour->title,
                'type' => $tour->type,
                'base_price' => $tour->base_price,
                'duration_days' => $tour->duration_days,
                'rating_cache' => $tour->rating_cache,
                'badge' => $tour->badge,
                'inclusions' => $tour->arr('inclusions'),
                'is_wishlisted' => true,
                'card_url' => $tour->getMedia('gallery')->first()?->getUrl('card') ?? '',
                'destination' => $tour->destination ? [
                    'name' => $tour->destination->name,
                    'country' => $tour->destination->country ?? '',
                ] : null,
            ]);

        return Inertia::render('Account/Saved', [
            'savedTours' => $savedTours,
        ]);
    }
}
