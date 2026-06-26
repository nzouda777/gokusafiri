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
    $balanceDue = $b->balance_due_at?->format('F j, Y') ?? 'to be confirmed';
    $pax = $b->adults + $b->children + ($b->infants ?? 0);
@endphp

@component('emails.layout', ['preheader' => "Deposit received for {$title}. Your balance of {$fmt($b->balance_amount)} is due {$balanceDue}."])

{{-- Hero --}}
<div style="text-align:center;padding-bottom:28px;border-bottom:1px solid #f0ede8;margin-bottom:28px;">
    <div style="display:inline-block;background-color:#fff3eb;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;font-size:26px;margin-bottom:16px;">💳</div>
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#16241b;line-height:1.2;">Deposit Received!</h1>
    <p style="margin:0;font-size:15px;color:#4f5c53;">Your spot on <strong>{{ $title }}</strong> is reserved.</p>
</div>

{{-- Reference --}}
<div style="background-color:#f5f2ec;border-radius:10px;padding:14px 20px;margin-bottom:28px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#8a968d;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Booking Reference</p>
    <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:#2E4A39;letter-spacing:2px;">{{ $b->reference }}</p>
</div>

{{-- Payment breakdown --}}
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
        <td style="padding:8px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Travelers</td>
        <td style="padding:8px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ $pax }} {{ $pax === 1 ? 'person' : 'people' }}</td>
    </tr>
    <tr>
        <td style="padding:8px 0;font-size:13px;color:#2E4A39;font-weight:600;border-bottom:1px solid #f0ede8;">Deposit paid today</td>
        <td style="padding:8px 0;font-size:13px;color:#2E4A39;font-weight:700;text-align:right;border-bottom:1px solid #f0ede8;">{{ $fmt($b->deposit_amount) }}</td>
    </tr>
    <tr>
        <td style="padding:8px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Remaining balance</td>
        <td style="padding:8px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ $fmt($b->balance_amount) }}</td>
    </tr>
    <tr>
        <td style="padding:10px 0 0;font-size:13px;color:#16241b;font-weight:700;">Total</td>
        <td style="padding:10px 0 0;font-size:16px;color:#16241b;font-weight:800;text-align:right;">{{ $fmt($b->total) }}</td>
    </tr>
</table>

{{-- Balance due alert --}}
<div style="background-color:#fff3eb;border-left:4px solid #E07A3F;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:28px;">
    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#E07A3F;">Balance due by {{ $balanceDue }}</p>
    <p style="margin:0;font-size:13px;color:#4f5c53;">
        We'll send you a reminder 7 days before the due date with a secure payment link.
    </p>
</div>

<p style="margin:0;font-size:14px;color:#4f5c53;text-align:center;">
    We're thrilled to have you on this adventure. See you in Africa! 🌍
</p>

@endcomponent
