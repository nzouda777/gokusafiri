@php
    $m = $contactMessage;
@endphp

@component('emails.layout', ['preheader' => "New contact message from {$m->name}"])

{{-- Header --}}
<div style="padding-bottom:20px;border-bottom:1px solid #f0ede8;margin-bottom:24px;">
    <p style="margin:0 0 4px;font-size:12px;color:#8a968d;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Admin Notification</p>
    <h1 style="margin:0;font-size:20px;font-weight:700;color:#16241b;">
        New Contact Message
    </h1>
</div>

{{-- Details --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;width:40%;">Name</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:700;text-align:right;border-bottom:1px solid #f0ede8;">{{ $m->name }}</td>
    </tr>
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Email</td>
        <td style="padding:7px 0;font-size:13px;text-align:right;border-bottom:1px solid #f0ede8;">
            <a href="mailto:{{ $m->email }}" style="color:#2E4A39;font-weight:600;">{{ $m->email }}</a>
        </td>
    </tr>
    @if($m->phone)
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Phone</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ $m->phone }}</td>
    </tr>
    @endif
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Topic</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ ucfirst($m->topic) }}</td>
    </tr>
    @if($m->subject)
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Subject</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ $m->subject }}</td>
    </tr>
    @endif
    @if($m->booking_reference)
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Booking reference</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:700;text-align:right;border-bottom:1px solid #f0ede8;">{{ $m->booking_reference }}</td>
    </tr>
    @endif
    <tr>
        <td style="padding:7px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;">Locale</td>
        <td style="padding:7px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;">{{ strtoupper($m->locale) }}</td>
    </tr>
</table>

{{-- Message body --}}
<div style="background-color:#fbf8f2;border-radius:12px;padding:20px;margin-bottom:24px;">
    <p style="margin:0;font-size:14px;line-height:22px;color:#16241b;white-space:pre-line;">{{ $m->message }}</p>
</div>

<a href="mailto:{{ $m->email }}?subject=Re: {{ rawurlencode($m->subject ?? 'Your message to GokuSafiri') }}"
   style="display:inline-block;background-color:#2E4A39;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:24px;text-decoration:none;">
    Reply to {{ $m->name }}
</a>

@endcomponent
