@component('emails.layout', ['preheader' => $emailSubject])

{{-- Header --}}
<div style="padding-bottom:20px;border-bottom:1px solid #f0ede8;margin-bottom:24px;">
    <h1 style="margin:0;font-size:20px;font-weight:700;color:#16241b;">
        {{ $emailSubject }}
    </h1>
</div>

<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#4f5c53;">
    Hi {{ $contactMessage->name }},
</p>

{{-- Reply body --}}
<div style="margin-bottom:28px;">
    @foreach(explode("\n", $body) as $paragraph)
        @if(trim($paragraph) !== '')
            <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#4f5c53;">
                {{ trim($paragraph) }}
            </p>
        @endif
    @endforeach
</div>

{{-- Original message --}}
<div style="background-color:#fbf8f2;border-radius:12px;padding:20px;margin-bottom:24px;">
    <p style="margin:0 0 8px;font-size:12px;color:#8a968d;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your original message</p>
    <p style="margin:0;font-size:13px;line-height:20px;color:#4f5c53;white-space:pre-line;">{{ $contactMessage->message }}</p>
</div>

<p style="margin:0;font-size:14px;line-height:1.7;color:#4f5c53;">
    Warm regards,<br>
    The GokuSafiri Team
</p>

@endcomponent
