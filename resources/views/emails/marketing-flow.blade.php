@component('emails.layout', ['preheader' => $emailSubject])

{{-- Body content (admin-authored rich text) --}}
<div style="margin-bottom:28px;font-size:15px;line-height:1.7;color:#4f5c53;">
    {!! $body !!}
</div>

@if($discountCode)
{{-- Discount code --}}
<div style="background-color:#f5f2ec;border:1px dashed #c5d3c8;border-radius:10px;padding:16px 20px;margin-bottom:28px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#8a968d;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Promo Code</p>
    <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:#2E4A39;letter-spacing:2px;">{{ $discountCode }}</p>
</div>
@endif

@if($ctaUrl)
{{-- CTA button --}}
<div style="text-align:center;margin-bottom:8px;">
    <a href="{{ $ctaUrl }}"
       style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#e07a3f,#d9722a);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.2px;">
        {{ $ctaLabel ?: 'Learn More' }}
    </a>
</div>
@endif

@endcomponent
