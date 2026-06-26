@php
    $b        = $booking;
    $tour     = $b->tour;
    $sched    = $b->schedule;
    $locale   = 'en';
    $title    = $tour->getTranslation('title', $locale, false);
    $dest     = $tour->destination;
    $fmt      = fn(int $cents) => '$' . number_format($cents / 100, 0);
    $dateRange = $sched
        ? \Carbon\Carbon::parse($sched->starts_at)->format('M j') . ' – ' . \Carbon\Carbon::parse($sched->ends_at)->format('M j, Y')
        : null;
    $pax = $b->adults + $b->children + ($b->infants ?? 0);
@endphp

@component('emails.layout', ['preheader' => "Your booking {$b->reference} for {$title} has been cancelled."])

{{-- Hero --}}
<div style="text-align:center;padding-bottom:28px;border-bottom:1px solid #f0ede8;margin-bottom:28px;">
    <div style="display:inline-block;background-color:#fef2f2;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;font-size:26px;margin-bottom:16px;">✕</div>
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#16241b;line-height:1.2;">Booking Cancelled</h1>
    <p style="margin:0;font-size:15px;color:#4f5c53;">Your booking for <strong>{{ $title }}</strong> has been cancelled.</p>
</div>

{{-- Reference --}}
<div style="background-color:#f5f2ec;border-radius:10px;padding:14px 20px;margin-bottom:28px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#8a968d;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Booking Reference</p>
    <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:#8a968d;letter-spacing:2px;text-decoration:line-through;">{{ $b->reference }}</p>
</div>

{{-- Trip info --}}
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

{{-- Reason note --}}
<div style="background-color:#fef2f2;border-left:4px solid #e87a7a;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:28px;">
    <p style="margin:0;font-size:13px;color:#4f5c53;">
        This booking was cancelled because the outstanding balance was not received by the due date.
        If you believe this is an error or would like to rebook, please contact us.
    </p>
</div>

{{-- CTA --}}
<div style="text-align:center;">
    <a href="{{ config('app.url') }}/tours"
       style="display:inline-block;background-color:#2E4A39;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 30px;border-radius:50px;">
        Browse Tours Again →
    </a>
</div>

@endcomponent
