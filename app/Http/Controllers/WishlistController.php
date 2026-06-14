<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function toggle(Request $request): JsonResponse
    {
        $tour = $request->route('tour');
        $user = $request->user();

        $existing = Wishlist::where('user_id', $user->id)->where('tour_id', $tour->id)->first();

        if ($existing) {
            $existing->delete();
            $wishlisted = false;
        } else {
            Wishlist::create(['user_id' => $user->id, 'tour_id' => $tour->id]);
            $wishlisted = true;
        }

        return response()->json(['wishlisted' => $wishlisted]);
    }
}
