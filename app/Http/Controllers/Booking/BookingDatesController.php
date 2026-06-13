<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\TourAddon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingDatesController extends Controller
{
    public function show(string $reference): Response
    {
        $booking = Booking::where('reference', $reference)
            ->with(['tour.destination', 'tour.media', 'tour.schedules', 'tour.addons', 'addons'])
            ->firstOrFail();

        $tour  = $booking->tour;
        $media = $tour->getMedia('gallery');

        $schedules = $tour->schedules()
            ->where('starts_at', '>', now())
            ->orderBy('starts_at')
            ->get()
            ->map(fn ($s) => [
                'id'             => $s->id,
                'start_date'     => $s->starts_at->toDateString(),
                'end_date'       => $s->ends_at->toDateString(),
                'capacity'       => $s->capacity,
                'seats_left'     => $s->seats_left,
                'price_override' => $s->price_override,
            ]);

        $selectedAddonIds = $booking->addons()->pluck('tour_addon_id')->toArray();

        return Inertia::render('Booking/Dates', [
            'booking' => [
                'reference'      => $booking->reference,
                'schedule_id'    => $booking->tour_schedule_id,
                'travelers_count' => $booking->adults + $booking->children,
                'selected_addons' => $selectedAddonIds,
                'tour' => [
                    'id'               => $tour->id,
                    'title'            => $tour->title,
                    'slug'             => $tour->slug,
                    'base_price'       => $tour->base_price,
                    'currency'         => $tour->currency,
                    'duration_days'    => $tour->duration_days,
                    'max_group_size'   => $tour->max_group_size,
                    'cancellation_days' => $tour->cancellation_days,
                    'card_url'         => $media->first()?->getUrl('card') ?? '',
                    'destination' => $tour->destination ? [
                        'name'    => $tour->destination->name,
                        'country' => $tour->destination->country ?? '',
                    ] : null,
                    'schedules' => $schedules,
                    'addons'    => $tour->addons->map(fn ($a) => [
                        'id'          => $a->id,
                        'name'        => $a->getTranslation('label', app()->getLocale(), false),
                        'price'       => $a->price_per_person,
                        'per'         => 'person',
                        'description' => $a->getTranslation('description', app()->getLocale(), false),
                    ]),
                ],
            ],
        ]);
    }

    public function update(Request $request, string $reference): RedirectResponse
    {
        $request->validate([
            'schedule_id' => 'required|exists:tour_schedules,id',
            'adults'      => 'required|integer|min:1|max:20',
            'children'    => 'required|integer|min:0|max:20',
            'infants'     => 'required|integer|min:0|max:10',
            'addons'      => 'array',
            'addons.*'    => 'exists:tour_addons,id',
        ]);

        $booking = Booking::where('reference', $reference)->firstOrFail();

        $booking->update([
            'tour_schedule_id' => $request->schedule_id,
            'adults'           => $request->adults,
            'children'         => $request->children,
            'infants'          => $request->infants,
        ]);

        // Sync addons
        $booking->addons()->delete();
        $pax = $request->adults + $request->children;
        foreach ($request->addons ?? [] as $addonId) {
            $addon = TourAddon::findOrFail($addonId);
            $booking->addons()->create([
                'tour_addon_id' => $addonId,
                'quantity'      => $pax,
                'unit_price'    => $addon->price_per_person,
            ]);
        }

        $this->recalculatePricing($booking->fresh());

        return redirect("/booking/{$reference}/travelers");
    }

    private function recalculatePricing(Booking $booking): void
    {
        $booking->load(['tour', 'schedule', 'addons.tourAddon']);

        $schedule = $booking->schedule;
        $tour     = $schedule?->tour ?? $booking->tour;
        $price    = $schedule?->price_override ?? $tour->base_price;
        $pax      = $booking->adults + $booking->children;

        $subtotal    = $price * $pax;
        $addonsTotal = $booking->addons->sum(fn ($ba) => $ba->unit_price * $ba->quantity);

        $memberDiscount = $booking->user_id ? (int) round($subtotal * 0.05) : 0;
        $taxesFees      = (int) round(($subtotal + $addonsTotal - $memberDiscount) * 0.008);
        $total          = $subtotal + $addonsTotal - $memberDiscount + $taxesFees;
        $deposit        = (int) round($total * 0.20);
        $balanceDue     = $schedule ? $schedule->starts_at->subDays(30) : null;

        $booking->update([
            'subtotal'        => $subtotal,
            'total'           => $total,
            'deposit_amount'  => $deposit,
            'member_discount' => $memberDiscount,
            'taxes_fees'      => $taxesFees,
            'balance_due_at'  => $balanceDue,
        ]);
    }
}
