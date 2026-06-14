<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Tour;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $slug = $request->route('slug');
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'body'   => 'required|string|min:20|max:2000',
        ]);

        $tour = Tour::published()->where('slug', $slug)->firstOrFail();
        $user = $request->user();

        if (Review::where('tour_id', $tour->id)->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'You have already submitted a review for this tour.');
        }

        Review::create([
            'tour_id'     => $tour->id,
            'user_id'     => $user->id,
            'rating'      => $request->rating,
            'body'        => $request->body,
            'author_name' => $user->name,
            'is_approved' => false,
        ]);

        return back()->with('success', 'Thank you! Your review will appear after moderation.');
    }
}
