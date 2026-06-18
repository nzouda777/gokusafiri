<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\States\Booking\Cancelled;
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
        $booking = Booking::where('reference', $request->route('reference'))
            ->where('user_id', $request->user()->id)
            ->with(['tour', 'schedule'])
            ->firstOrFail();

        // Only pending, deposit_paid and confirmed bookings can be cancelled
        if (!in_array($booking->status->getValue(), ['pending', 'deposit_paid', 'confirmed'])) {
            return back()->withErrors(['cancel' => 'This booking cannot be cancelled.']);
        }

        // Block if departure date is today or has passed
        if ($booking->schedule && $booking->schedule->starts_at->toDateString() <= now()->toDateString()) {
            return back()->withErrors(['cancel' => 'The departure date has already passed.']);
        }

        // Block if the free-cancellation deadline has passed
        if ($booking->schedule && $booking->tour->cancellation_days !== null) {
            $deadline = $booking->schedule->starts_at->subDays($booking->tour->cancellation_days)->toDateString();
            if (now()->toDateString() > $deadline) {
                return back()->withErrors(['cancel' => 'The free-cancellation deadline has passed. Please contact support.']);
            }
        }

        $booking->status->transitionTo(Cancelled::class);

        return back()->with('success', 'Your booking has been cancelled.');
    }

    private function formatBooking(Booking $booking): array
    {
        $tour  = $booking->tour;
        $media = $tour->getMedia('gallery');

        // Compute cancellation eligibility
        $canCancel            = false;
        $cancellationDeadline = null;
        $statusValue          = $booking->status->getValue();

        if (in_array($statusValue, ['pending', 'deposit_paid', 'confirmed']) && $booking->schedule) {
            $today         = now()->toDateString();
            $departureDate = $booking->schedule->starts_at->toDateString();

            if ($departureDate > $today) {
                if ($tour->cancellation_days !== null) {
                    $deadline             = $booking->schedule->starts_at->subDays($tour->cancellation_days)->toDateString();
                    $cancellationDeadline = $deadline;
                    $canCancel            = $today <= $deadline;
                } else {
                    // No policy configured → always cancellable until departure
                    $canCancel = true;
                }
            }
        }

        return [
            'id'              => $booking->id,
            'reference'       => $booking->reference,
            'status'          => $statusValue,
            'total_amount'    => $booking->total ?? 0,
            'travelers_count' => $booking->adults + $booking->children,
            'can_cancel'              => $canCancel,
            'cancellation_deadline'   => $cancellationDeadline,
            'tour' => [
                'id'           => $tour->id,
                'title'        => $tour->title,
                'slug'         => $tour->slug,
                'duration_days' => $tour->duration_days,
                'rating_cache' => $tour->rating_cache,
                'base_price'   => $tour->base_price,
                'inclusions'   => $tour->arr('inclusions'),
                'card_url'     => $media->first()?->getUrl('card') ?? '',
                'destination'  => $tour->destination ? [
                    'name'    => $tour->destination->name,
                    'country' => $tour->destination->country ?? '',
                ] : null,
            ],
            'schedule' => $booking->schedule ? [
                'start_date' => $booking->schedule->starts_at->toDateString(),
                'end_date'   => $booking->schedule->ends_at->toDateString(),
            ] : null,
        ];
    }
}
