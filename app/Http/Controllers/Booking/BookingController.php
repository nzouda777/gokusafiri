<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Tour;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function start(Request $request): RedirectResponse
    {
        $request->validate([
            'tour_id'    => 'required|exists:tours,id',
            'travelers'  => 'required|integer|min:1|max:20',
            'pay_full'   => 'boolean',
        ]);

        $tour = Tour::findOrFail($request->tour_id);

        $booking = Booking::create([
            'tour_id'      => $tour->id,
            'user_id'      => $request->user()?->id,
            'adults'       => max(1, (int) $request->travelers),
            'children'     => 0,
            'infants'      => 0,
            'payment_plan' => $request->boolean('pay_full') ? 'full' : 'deposit',
            'subtotal'     => 0,
            'total'        => 0,
            'deposit_amount' => 0,
            'currency'     => $tour->currency ?? 'USD',
        ]);

        return redirect("/booking/{$booking->reference}/dates");
    }

    public function confirmation(Request $request): Response
    {
        $reference = $request->route('reference');
        $booking = Booking::where('reference', $reference)
            ->with(['tour.destination', 'tour.media', 'schedule', 'travelers', 'addons.tourAddon'])
            ->firstOrFail();

        $tour      = $booking->tour;
        $cardUrl   = $tour->getMedia('gallery')->first()?->getUrl('card') ?? '';
        $schedule  = $booking->schedule;

        $cancellationDeadline = $schedule && $tour->cancellation_days
            ? $schedule->starts_at->subDays($tour->cancellation_days)->toDateString()
            : null;

        $addons = $booking->addons->map(fn ($ba) => [
            'addon' => [
                'id'    => $ba->tourAddon->id,
                'name'  => $ba->tourAddon->getTranslation('label', app()->getLocale(), false),
                'price' => $ba->unit_price,
                'per'   => 'person',
            ],
            'quantity' => $ba->quantity,
        ]);

        return Inertia::render('Booking/Confirmation', [
            'booking' => [
                'reference'             => $booking->reference,
                'total_amount'          => $booking->total,
                'deposit_amount'        => $booking->deposit_amount,
                'member_discount'       => $booking->member_discount ?? 0,
                'taxes'                 => $booking->taxes_fees ?? 0,
                'travelers_count'       => $booking->adults + $booking->children,
                'lead_email'            => $booking->lead_email ?? $request->user()?->email ?? '',
                'cancellation_deadline' => $cancellationDeadline,
                'addons'                => $addons,
                'tour' => [
                    'id'               => $tour->id,
                    'title'            => $tour->title,
                    'slug'             => $tour->slug,
                    'base_price'       => $tour->base_price,
                    'card_url'         => $cardUrl,
                    'cancellation_days' => $tour->cancellation_days,
                    'destination'      => $tour->destination ? [
                        'name'    => $tour->destination->name,
                        'country' => $tour->destination->country ?? '',
                    ] : null,
                ],
                'schedule' => $schedule ? [
                    'start_date' => $schedule->starts_at->toDateString(),
                    'end_date'   => $schedule->ends_at->toDateString(),
                ] : null,
            ],
        ]);
    }

    public function itineraryPdf(Request $request)
    {
        $reference = $request->route('reference');
        $booking = Booking::where('reference', $reference)->firstOrFail();
        return response()->json(['reference' => $booking->reference, 'message' => 'PDF generation pending']);
    }
}
