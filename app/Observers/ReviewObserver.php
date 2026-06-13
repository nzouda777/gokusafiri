<?php

namespace App\Observers;

use App\Models\Review;
use App\Models\Tour;

class ReviewObserver
{
    public function saved(Review $review): void
    {
        if ($review->is_approved) {
            $this->updateTourCache($review->tour_id);
        }
    }

    public function deleted(Review $review): void
    {
        $this->updateTourCache($review->tour_id);
    }

    private function updateTourCache(int $tourId): void
    {
        $stats = Review::where('tour_id', $tourId)
            ->where('is_approved', true)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total')
            ->first();

        Tour::where('id', $tourId)->update([
            'rating_cache' => round($stats->avg_rating ?? 0, 2),
            'reviews_count_cache' => $stats->total ?? 0,
        ]);
    }
}
