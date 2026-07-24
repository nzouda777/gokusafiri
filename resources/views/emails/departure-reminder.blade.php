@php
    $b        = $booking;
    $tour     = $b->tour;
    $sched    = $b->schedule;
    $locale   = 'en';
    $title    = $tour->getTranslation('title', $locale, false);
    $dest     = $tour->destination;
    $pax      = $b->adults + $b->children + ($b->infants ?? 0);
    $dateRange = $sched
        ? \Carbon\Carbon::parse($sched->starts_at)->format('M j') . ' – ' . \Carbon\Carbon::parse($sched->ends_at)->format('M j, Y')
        : null;
    $when = $daysUntil === 1 ? 'tomorrow' : "in {$daysUntil} days";
    $tripUrl = route('booking.confirmation', ['locale' => $b->locale ?: 'en', 'reference' => $b->reference]);
@endphp

@component('emails.layout', ['preheader' => "Your trip to {$title} starts {$when}  here's a quick refresher before you go."])

{{-- Hero --}}
<div style="text-align:center;padding-bottom:28px;border-bottom:1px solid #f0ede8;margin-bottom:28px;">
    <div style="display:inline-block;background-color:#eef3ec;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;font-size:26px;margin-bottom:16px;">🌍</div>
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#16241b;line-height:1.2;">
        Your safari starts {{ $when }}!
    </h1>
    <p style="margin:0;font-size:15px;color:#4f5c53;">Get ready  <strong>{{ $title }}</strong> is almost here.</p>
</div>

{{-- Reference --}}
<div style="background-color:#f5f2ec;border-radius:10px;padding:14px 20px;margin-bottom:28px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#8a968d;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Booking Reference</p>
    <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:#2E4A39;letter-spacing:2px;">{{ $b->reference }}</p>
</div>

{{-- Trip summary --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    @if($dest)
    <tr>
        <td style="padding:8px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Destination</td>
        <td style="padding:8px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ $dest->name }}, {{ $dest->country }}</td>
    </tr>
    @endif
    @if($dateRange)
    <tr>
        <td style="padding:8px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Dates</td>
        <td style="padding:8px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ $dateRange }}</td>
    </tr>
    @endif
    <tr>
        <td style="padding:8px 0;font-size:13px;color:#8a968d;">Travelers</td>
        <td style="padding:8px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;">{{ $pax }} {{ $pax === 1 ? 'person' : 'people' }}</td>
    </tr>
</table>

{{-- Checklist --}}
<div style="background-color:#eef3ec;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#2E4A39;text-transform:uppercase;letter-spacing:0.5px;">Before you go</p>
    <p style="margin:0 0 6px;font-size:13px;color:#4f5c53;">🛂 &nbsp;Check your passport validity and any required visas.</p>
    <p style="margin:0 0 6px;font-size:13px;color:#4f5c53;">💉 &nbsp;Confirm your vaccinations and travel insurance are in order.</p>
    <p style="margin:0;font-size:13px;color:#4f5c53;">🎒 &nbsp;Pack light, breathable layers and a good pair of walking shoes.</p>
</div>

{{-- CTA --}}
<div style="text-align:center;margin-bottom:8px;">
    <a href="{{ $tripUrl }}"
       style="display:inline-block;background-color:#2E4A39;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;">
        View My Trip →
    </a>
</div>

@endcomponent
