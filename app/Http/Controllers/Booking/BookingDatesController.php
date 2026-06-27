<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\TourAddon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BookingDatesController extends Controller
{
    public function show(Request $request): Response
    {
        $reference = $request->route('reference');
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
                'adults'         => $booking->adults,
                'children'       => $booking->children,
                'infants'        => $booking->infants,
                'selected_addons' => $selectedAddonIds,
                'tour' => [
                    'id'               => $tour->id,
                    'title'            => $tour->title,
                    'slug'             => $tour->slug,
                    'base_price'       => $tour->base_price,
                    'child_price'      => $tour->child_price,
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

    public function update(Request $request): RedirectResponse
    {
        $reference = $request->route('reference');
        $request->validate([
            'schedule_id' => [
                'required',
                Rule::exists('tour_schedules', 'id')->where(
                    fn ($q) => $q->where('starts_at', '>', now())
                ),
            ],
            'adults'   => 'required|integer|min:1|max:20',
            'children' => 'required|integer|min:0|max:20',
            'infants'  => 'required|integer|min:0|max:10',
            'addons'   => 'array',
            'addons.*' => 'exists:tour_addons,id',
        ]);

        $booking = Booking::where('reference', $reference)->with('tour')->firstOrFail();

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

        $schedule   = $booking->schedule;
        $tour       = $schedule?->tour ?? $booking->tour;
        $adultPrice = $schedule?->price_override ?? $tour->base_price;
        $childPrice = $tour->child_price ?? $adultPrice; // fallback to adult price if not configured

        // Adults pay full price, children pay child_price, infants are free
        $subtotal    = ($adultPrice * $booking->adults) + ($childPrice * $booking->children);
        $addonsTotal = $booking->addons->sum(fn ($ba) => $ba->unit_price * $ba->quantity);

        $memberDiscount = $booking->user_id ? (int) round($subtotal * 0.05) : 0;
        $taxesFees      = (int) round(($subtotal + $addonsTotal - $memberDiscount) * 0.008);
        $total          = $subtotal + $addonsTotal - $memberDiscount + $taxesFees;
        $deposit        = (int) round($total * (($tour->deposit_percent ?? 20) / 100));
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
