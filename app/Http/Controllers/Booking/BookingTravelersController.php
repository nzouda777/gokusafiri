<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingTravelersController extends Controller
{
    public function show(string $reference): Response
    {
        $booking = Booking::where('reference', $reference)
            ->with(['tour.destination', 'tour.media', 'schedule', 'travelers', 'addons.tourAddon'])
            ->firstOrFail();

        $tour  = $booking->tour;
        $media = $tour->getMedia('gallery');

        $addons = $booking->addons->map(fn ($ba) => [
            'addon' => [
                'id'    => $ba->tourAddon->id,
                'name'  => $ba->tourAddon->getTranslation('label', app()->getLocale(), false),
                'price' => $ba->unit_price,
                'per'   => 'person',
            ],
            'quantity' => $ba->quantity,
        ]);

        return Inertia::render('Booking/Travelers', [
            'booking' => [
                'reference'      => $booking->reference,
                'travelers_count' => $booking->adults + $booking->children,
                'member_discount' => $booking->member_discount ?? 0,
                'taxes'          => $booking->taxes_fees ?? 0,
                'addons'         => $addons,
                'lead' => [
                    'first_name' => $booking->lead_first_name ?? '',
                    'last_name'  => $booking->lead_last_name ?? '',
                    'email'      => $booking->lead_email ?? '',
                    'phone'      => $booking->lead_phone ?? '',
                    'date_of_birth'    => '',
                    'country_of_origin' => '',
                    'passport_number'  => '',
                ],
                'travelers' => $booking->travelers()
                    ->where('type', '!=', 'lead')
                    ->get()
                    ->map(fn ($t) => [
                        'first_name'       => $t->first_name,
                        'last_name'        => $t->last_name,
                        'date_of_birth'    => $t->date_of_birth?->toDateString() ?? '',
                        'country_of_origin' => $t->country ?? '',
                        'passport_number'  => $t->passport_number ?? '',
                    ]),
                'tour' => [
                    'id'               => $tour->id,
                    'title'            => $tour->title,
                    'base_price'       => $tour->base_price,
                    'cancellation_days' => $tour->cancellation_days,
                    'card_url'         => $media->first()?->getUrl('card') ?? '',
                    'destination' => $tour->destination ? [
                        'name'    => $tour->destination->name,
                        'country' => $tour->destination->country ?? '',
                    ] : null,
                ],
                'schedule' => $booking->schedule ? [
                    'start_date' => $booking->schedule->starts_at->toDateString(),
                    'end_date'   => $booking->schedule->ends_at->toDateString(),
                ] : null,
            ],
        ]);
    }

    public function update(Request $request, string $reference): RedirectResponse
    {
        $request->validate([
            'lead.first_name' => 'required|string|max:100',
            'lead.last_name'  => 'required|string|max:100',
            'lead.email'      => 'required|email',
            'lead.phone'      => 'nullable|string|max:30',
            'lead.date_of_birth'     => 'nullable|date',
            'lead.country_of_origin' => 'nullable|string|max:2',
            'lead.passport_number'   => 'nullable|string|max:50',
            'travelers'                   => 'array',
            'travelers.*.first_name'      => 'required|string|max:100',
            'travelers.*.last_name'       => 'required|string|max:100',
            'travelers.*.date_of_birth'   => 'nullable|date',
            'travelers.*.country_of_origin' => 'nullable|string|max:2',
            'travelers.*.passport_number' => 'nullable|string|max:50',
            'special_request' => 'nullable|string|max:2000',
        ]);

        $booking = Booking::where('reference', $reference)->firstOrFail();
        $lead    = $request->input('lead');

        // Lead info goes directly on the booking row
        $booking->update([
            'lead_first_name' => $lead['first_name'],
            'lead_last_name'  => $lead['last_name'],
            'lead_email'      => $lead['email'],
            'lead_phone'      => $lead['phone'] ?? null,
            'special_request' => $request->input('special_request'),
        ]);

        // Replace all traveler records
        $booking->travelers()->delete();

        // Lead traveler record (type='lead' carries passport info)
        $booking->travelers()->create([
            'type'           => 'lead',
            'first_name'     => $lead['first_name'],
            'last_name'      => $lead['last_name'],
            'date_of_birth'  => $lead['date_of_birth'] ?? null,
            'country'        => substr($lead['country_of_origin'] ?? '', 0, 2) ?: null,
            'passport_number' => $lead['passport_number'] ?? null,
        ]);

        foreach ($request->input('travelers', []) as $t) {
            $booking->travelers()->create([
                'type'           => 'adult',
                'first_name'     => $t['first_name'],
                'last_name'      => $t['last_name'],
                'date_of_birth'  => $t['date_of_birth'] ?? null,
                'country'        => substr($t['country_of_origin'] ?? '', 0, 2) ?: null,
                'passport_number' => $t['passport_number'] ?? null,
            ]);
        }

        return redirect("/booking/{$reference}/payment");
    }
}
