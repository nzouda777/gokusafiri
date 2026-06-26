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
    $pax     = $b->adults + $b->children + ($b->infants ?? 0);
    $payType = ucfirst($payment->type); // deposit / full / balance
    $clientName = trim(($b->lead_first_name ?? '') . ' ' . ($b->lead_last_name ?? ''));
@endphp

@component('emails.layout', ['preheader' => "[Admin] {$payType} payment received for {$b->reference} — {$title}"])

{{-- Header --}}
<div style="padding-bottom:20px;border-bottom:1px solid #f0ede8;margin-bottom:24px;">
    <p style="margin:0 0 4px;font-size:12px;color:#8a968d;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Admin Notification</p>
    <h1 style="margin:0;font-size:20px;font-weight:700;color:#16241b;">
        {{ $payType }} Payment Received
    </h1>
</div>

{{-- Payment badge --}}
<div style="display:inline-block;background-color:{{ $payment->type === 'deposit' ? '#fff3eb' : '#eef3ec' }};color:{{ $payment->type === 'deposit' ? '#E07A3F' : '#2E4A39' }};font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:20px;text-transform:uppercase;letter-spacing:0.5px;">
    {{ $payType }} — {{ $fmt($payment->amount) }}
</div>

{{-- Booking details --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;width:40%;">Reference</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:700;text-align:right;border-bottom:1px solid #f0ede8;">{{ $b->reference }}</td>
    </tr>
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Client</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">
            {{ $clientName ?: 'N/A' }}
            @if($b->lead_email) · <a href="mailto:{{ $b->lead_email }}" style="color:#2E4A39;">{{ $b->lead_email }}</a> @endif
        </td>
    </tr>
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Tour</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ $title }}</td>
    </tr>
    @if($dest)
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Destination</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ $dest->name }}, {{ $dest->country }}</td>
    </tr>
    @endif
    @if($dateRange)
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Dates</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ $dateRange }}</td>
    </tr>
    @endif
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Travelers</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ $b->adults }}A / {{ $b->children }}C / {{ $b->infants ?? 0 }}I ({{ $pax }} total)</td>
    </tr>
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Booking status</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ class_basename($b->status) }}</td>
    </tr>
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Payment plan</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ ucfirst($b->payment_plan) }}</td>
    </tr>
    @if($b->deposit_amount && $b->payment_plan === 'deposit')
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Deposit</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ $fmt($b->deposit_amount) }}</td>
    </tr>
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Balance due</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">
            {{ $fmt($b->balance_amount) }}
            @if($b->balance_due_at) ({{ $b->balance_due_at->format('M j, Y') }}) @endif
        </td>
    </tr>
    @endif
    <tr>
        <td style="padding:9px 0 0;font-size:14px;color:#16241b;font-weight:700;">Total</td>
        <td style="padding:9px 0 0;font-size:16px;color:#2E4A39;font-weight:800;text-align:right;">{{ $fmt($b->total) }}</td>
    </tr>
</table>

{{-- Stripe ref --}}
@if($payment->provider_reference)
<div style="background-color:#f5f2ec;border-radius:8px;padding:10px 16px;margin-bottom:20px;">
    <p style="margin:0;font-size:12px;color:#8a968d;">Stripe reference: <span style="color:#16241b;font-family:monospace;">{{ $payment->provider_reference }}</span></p>
</div>
@endif

{{-- Admin link --}}
<div style="text-align:center;">
    <a href="{{ config('app.url') }}/admin/bookings/{{ $b->id }}"
       style="display:inline-block;background-color:#2E4A39;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:11px 28px;border-radius:50px;">
        View in Admin →
    </a>
</div>

@endcomponent
