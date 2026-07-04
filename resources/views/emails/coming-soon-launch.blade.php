@component('emails.layout', ['preheader' => $emailSubject])

{{-- Hero banner --}}
<div style="margin:-36px -40px 32px;border-radius:0;overflow:hidden;position:relative;">
    <div style="background:linear-gradient(160deg,#16241b 0%,#2e4a39 60%,#3a5a45 100%);padding:40px 40px 36px;text-align:center;">
        <img src="{{ config('app.url') }}/images/main-white.png"
             alt="GokuSafiri"
             width="150"
             style="height:auto;display:inline-block;border:0;outline:none;text-decoration:none;margin-bottom:16px;">
        <h1 style="margin:0 0 10px;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;letter-spacing:-0.3px;">
            {{ $emailSubject }}
        </h1>
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.65);letter-spacing:0.5px;">
            Africa's finest safaris, curated for you.
        </p>
    </div>
</div>

{{-- Body message --}}
<div style="margin-bottom:28px;">
    @foreach(explode("\n", $body) as $paragraph)
        @if(trim($paragraph) !== '')
            <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#4f5c53;">
                {{ trim($paragraph) }}
            </p>
        @endif
    @endforeach
</div>

{{-- CTA button --}}
<div style="text-align:center;margin-bottom:32px;">
    <a href="{{ $ctaUrl }}"
       style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#e07a3f,#d9722a);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.2px;">
        {{ $ctaLabel }}
    </a>
</div>

{{-- Divider --}}
<div style="border-top:1px solid #f0ede8;margin-bottom:24px;"></div>

{{-- Trust strip --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
    <tr>
        <td style="text-align:center;padding:0 8px;">
            <p style="margin:0;font-size:12px;color:#8a968d;">⭐ Rated 4.9/5</p>
        </td>
        <td style="text-align:center;padding:0 8px;border-left:1px solid #e4ddd0;border-right:1px solid #e4ddd0;">
            <p style="margin:0;font-size:12px;color:#8a968d;">🌍 14 Countries</p>
        </td>
        <td style="text-align:center;padding:0 8px;">
            <p style="margin:0;font-size:12px;color:#8a968d;">🛡️ Free cancellation</p>
        </td>
    </tr>
</table>

@endcomponent
