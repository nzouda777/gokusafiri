<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TripsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tab = $request->input('tab', 'upcoming');

        $bookings = Booking::where('user_id', $user->id)
            ->with(['tour.destination', 'tour.media', 'schedule'])
            ->when($tab === 'upcoming', fn ($q) => $q->whereIn('status', ['confirmed', 'payment_pending']))
            ->when($tab === 'past', fn ($q) => $q->where('status', 'completed'))
            ->when($tab === 'cancelled', fn ($q) => $q->where('status', 'cancelled'))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Booking $b) => $this->formatBooking($b));

        $stats = [
            'upcoming' => Booking::where('user_id', $user->id)->whereIn('status', ['confirmed', 'payment_pending'])->count(),
            'completed' => Booking::where('user_id', $user->id)->where('status', 'completed')->count(),
            'countries' => Booking::where('user_id', $user->id)->join('tour_schedules', 'bookings.tour_schedule_id', '=', 'tour_schedules.id')->join('tours', 'bookings.tour_id', '=', 'tours.id')->join('destinations', 'tours.destination_id', '=', 'destinations.id')->distinct('destinations.country')->count('destinations.country'),
            'tier' => 'Explorer',
        ];

        $nextDeparture = Booking::where('user_id', $user->id)
            ->whereIn('status', ['confirmed'])
            ->with(['tour.destination', 'tour.media', 'schedule'])
            ->whereHas('schedule', fn ($q) => $q->where('starts_at', '>', now()))
            ->orderByRaw('(SELECT starts_at FROM tour_schedules WHERE tour_schedules.id = bookings.tour_schedule_id) ASC')
            ->first();

        $nextDepartureData = null;
        if ($nextDeparture?->schedule) {
            $media = $nextDeparture->tour->getMedia('gallery');
            $nextDepartureData = [
                'title' => $nextDeparture->tour->title,
                'destination' => $nextDeparture->tour->destination?->name,
                'start_date' => $nextDeparture->schedule->starts_at->toDateString(),
                'end_date' => $nextDeparture->schedule->ends_at->toDateString(),
                'days_to_go' => (int) now()->diffInDays($nextDeparture->schedule->starts_at),
                'reference' => $nextDeparture->reference,
                'card_url' => $media->first()?->getUrl('card'),
            ];
        }

        return Inertia::render('Account/Trips', [
            'bookings' => $bookings,
            'stats' => $stats,
            'next_departure' => $nextDepartureData,
            'tab' => $tab,
        ]);
    }

    public function cancel(Request $request): RedirectResponse
    {
        $reference = $request->route('reference');
        $booking = Booking::where('reference', $reference)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $booking->update(['status' => 'cancelled']);

        return back()->with('success', 'Booking cancelled successfully.');
    }

    private function formatBooking(Booking $booking): array
    {
        $tour = $booking->tour;
        $media = $tour->getMedia('gallery');

        return [
            'id' => $booking->id,
            'reference' => $booking->reference,
            'status' => $booking->status,
            'total_amount' => $booking->total_amount,
            'travelers_count' => $booking->travelers_count,
            'tour' => [
                'id' => $tour->id,
                'title' => $tour->title,
                'slug' => $tour->slug,
                'duration_days' => $tour->duration_days,
                'rating_cache' => $tour->rating_cache,
                'base_price' => $tour->base_price,
                'inclusions' => $tour->arr('inclusions'),
                'card_url' => $media->first()?->getUrl('card') ?? '',
                'destination' => $tour->destination ? [
                    'name' => $tour->destination->name,
                    'country' => $tour->destination->country ?? '',
                ] : null,
            ],
            'schedule' => $booking->schedule ? [
                'start_date' => $booking->schedule->starts_at->toDateString(),
                'end_date' => $booking->schedule->ends_at->toDateString(),
            ] : null,
        ];
    }
}
