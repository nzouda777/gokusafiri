<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\TourAddon;
use App\Settings\GeneralSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingDatesController extends Controller
{
    public function show(Request $request): Response
    {
        $reference = $request->route('reference');
        $booking = Booking::where('reference', $reference)
            ->with(['tour.destination', 'tour.media', 'tour.addons', 'addons'])
            ->firstOrFail();

        $tour = $booking->tour;
        $media = $tour->getMedia('gallery');

        // The departure date previously picked for this booking
        $customDate = $booking->schedule?->starts_at->toDateString();

        $selectedAddonIds = $booking->addons()->pluck('tour_addon_id')->toArray();

        return Inertia::render('Booking/Dates', [
            'booking' => [
                'reference' => $booking->reference,
                'custom_date' => $customDate,
                'departure_time' => $booking->departure_time,
                'adults' => $booking->adults,
                'children' => $booking->children,
                'infants' => $booking->infants,
                'selected_addons' => $selectedAddonIds,
                'tour' => [
                    'id' => $tour->id,
                    'title' => $tour->title,
                    'slug' => $tour->slug,
                    'type' => $tour->type,
                    'base_price' => $tour->base_price,
                    'child_price' => $tour->child_price,
                    'discount_percent' => $tour->discount_percent ?? 0,
                    'deposit_percent' => $tour->deposit_percent ?? app(GeneralSettings::class)->deposit_percent,
                    'currency' => $tour->currency,
                    'duration_days' => $tour->duration_days,
                    'max_group_size' => $tour->max_group_size,
                    'cancellation_days' => $tour->cancellation_days,
                    'card_url' => $media->first()?->getUrl('card') ?? '',
                    'destination' => $tour->destination ? [
                        'name' => $tour->destination->name,
                        'country' => $tour->destination->country ?? '',
                    ] : null,
                    'addons' => $tour->addons->map(fn ($a) => [
                        'id' => $a->id,
                        'name' => $a->getTranslation('label', app()->getLocale(), false),
                        'price' => $a->price_per_person,
                        'per' => 'person',
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
            'custom_date' => 'required|date|after:tomorrow',
            'departure_time' => ['nullable', 'regex:/^([01]\d|2[0-3]):[0-5]\d$/'],
            'adults' => 'required|integer|min:1|max:20',
            'children' => 'required|integer|min:0|max:20',
            'infants' => 'required|integer|min:0|max:10',
            'addons' => 'array',
            'addons.*' => 'exists:tour_addons,id',
        ]);

        $booking = Booking::where('reference', $reference)->with('tour')->firstOrFail();

        // The client picks their own departure date — attach a private
        // schedule for that date.
        $scheduleId = $booking->tour->customScheduleFor($request->custom_date)->id;

        $booking->update([
            'tour_schedule_id' => $scheduleId,
            'departure_time' => $request->departure_time,
            'adults' => $request->adults,
            'children' => $request->children,
            'infants' => $request->infants,
        ]);

        // Sync addons
        $booking->addons()->delete();
        $pax = $request->adults + $request->children;
        foreach ($request->addons ?? [] as $addonId) {
            $addon = TourAddon::findOrFail($addonId);
            $booking->addons()->create([
                'tour_addon_id' => $addonId,
                'quantity' => $pax,
                'unit_price' => $addon->price_per_person,
            ]);
        }

        $this->recalculatePricing($booking->fresh());

        return redirect("/booking/{$reference}/travelers");
    }

    private function recalculatePricing(Booking $booking): void
    {
        $booking->load(['tour', 'schedule', 'addons.tourAddon']);

        $settings = app(GeneralSettings::class);
        $schedule = $booking->schedule;
        $tour = $schedule?->tour ?? $booking->tour;
        $basePrice = $schedule?->price_override ?? $tour->base_price;

        // Apply per-tour promotional discount to unit prices
        $tourDiscPct = $tour->discount_percent ?? 0;
        $adultPrice = (int) round($basePrice * (1 - $tourDiscPct / 100));
        $childPrice = (int) round(($tour->child_price ?? $basePrice) * (1 - $tourDiscPct / 100));

        // Adults pay full price, children pay child_price, infants are free
        $subtotal = ($adultPrice * $booking->adults) + ($childPrice * $booking->children);
        $addonsTotal = $booking->addons->sum(fn ($ba) => $ba->unit_price * $ba->quantity);

        $memberDiscount = $booking->user_id
            ? (int) round(($subtotal + $addonsTotal) * $settings->tier_discount_percent / 100)
            : 0;
        $taxesFees = (int) round(($subtotal + $addonsTotal - $memberDiscount) * $settings->tax_fee_percent / 100);
        $total = $subtotal + $addonsTotal - $memberDiscount + $taxesFees;
        $deposit = (int) round($total * (($tour->deposit_percent ?? $settings->deposit_percent) / 100));
        $balanceDue = $schedule ? $schedule->starts_at->subDays(30) : null;

        $booking->update([
            'subtotal' => $subtotal,
            'total' => $total,
            'deposit_amount' => $deposit,
            'member_discount' => $memberDiscount,
            'taxes_fees' => $taxesFees,
            'balance_due_at' => $balanceDue,
        ]);
    }
}
