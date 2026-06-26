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
    $dueDate  = $b->balance_due_at?->format('F j, Y') ?? 'soon';
    $daysLeft = $b->balance_due_at ? now()->diffInDays($b->balance_due_at, false) : null;
@endphp

@component('emails.layout', ['preheader' => "Your balance of {$fmt($b->balance_amount)} for {$title} is due {$dueDate}."])

{{-- Hero --}}
<div style="text-align:center;padding-bottom:28px;border-bottom:1px solid #f0ede8;margin-bottom:28px;">
    <div style="display:inline-block;background-color:#fff3eb;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;font-size:26px;margin-bottom:16px;">⏰</div>
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#16241b;line-height:1.2;">Balance Payment Reminder</h1>
    <p style="margin:0;font-size:15px;color:#4f5c53;">
        Your balance for <strong>{{ $title }}</strong>
        @if($daysLeft !== null)
            is due in <strong>{{ $daysLeft }} {{ $daysLeft === 1 ? 'day' : 'days' }}</strong>.
        @else
            is coming due.
        @endif
    </p>
</div>

{{-- Reference --}}
<div style="background-color:#f5f2ec;border-radius:10px;padding:14px 20px;margin-bottom:28px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#8a968d;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Booking Reference</p>
    <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:#2E4A39;letter-spacing:2px;">{{ $b->reference }}</p>
</div>

{{-- Payment info --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    @if($dateRange)
    <tr>
        <td style="padding:8px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Trip dates</td>
        <td style="padding:8px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ $dateRange }}</td>
    </tr>
    @endif
    <tr>
        <td style="padding:8px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Already paid (deposit)</td>
        <td style="padding:8px 0;font-size:13px;color:#2E4A39;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ $fmt($b->deposit_amount) }}</td>
    </tr>
    <tr>
        <td style="padding:10px 0 0;font-size:14px;color:#E07A3F;font-weight:700;">Balance due {{ $dueDate }}</td>
        <td style="padding:10px 0 0;font-size:18px;color:#E07A3F;font-weight:800;text-align:right;">{{ $fmt($b->balance_amount) }}</td>
    </tr>
</table>

{{-- CTA --}}
<div style="text-align:center;margin-bottom:28px;">
    <a href="{{ $payUrl }}"
       style="display:inline-block;background-color:#2E4A39;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;">
        Pay Balance Now →
    </a>
    <p style="margin:12px 0 0;font-size:11px;color:#8a968d;">
        This link is secure and unique to your booking. It expires after payment.
    </p>
</div>

{{-- Warning --}}
<div style="background-color:#fff3eb;border-left:4px solid #E07A3F;border-radius:0 10px 10px 0;padding:14px 18px;">
    <p style="margin:0;font-size:12px;color:#4f5c53;">
        ⚠️ &nbsp;If the balance is not received by <strong>{{ $dueDate }}</strong>, your booking may be cancelled and your deposit forfeited per our terms.
    </p>
</div>

@endcomponent
