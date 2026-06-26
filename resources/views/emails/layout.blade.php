{{-- Shared email layout. Usage: @include('emails.layout', ['preheader' => '...', 'slot' => $__env->yieldContent('body')]) --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ $subject ?? config('app.name') }}</title>
    <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f5f2ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

@if(isset($preheader))
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">{{ $preheader }}</div>
@endif

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f2ec;padding:40px 16px;">
    <tr>
        <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

                {{-- Header --}}
                <tr>
                    <td style="background-color:#2E4A39;border-radius:16px 16px 0 0;padding:28px 40px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td>
                                    <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">GokuSafiri</span>
                                </td>
                                <td align="right">
                                    <span style="font-size:12px;color:#a8c5b0;">Your African Safari Experts</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                {{-- Body --}}
                <tr>
                    <td style="background-color:#ffffff;padding:36px 40px;">
                        {!! $slot !!}
                    </td>
                </tr>

                {{-- Footer --}}
                <tr>
                    <td style="background-color:#f5f2ec;padding:24px 40px;border-radius:0 0 16px 16px;border-top:1px solid #e4ddd0;">
                        <p style="margin:0 0 6px;font-size:12px;color:#8a968d;">
                            © {{ date('Y') }} GokuSafiri · All rights reserved
                        </p>
                        <p style="margin:0;font-size:12px;color:#b5bfb7;">
                            Questions? Reply to this email or contact us at
                            <a href="mailto:{{ config('mail.from.address') }}" style="color:#2E4A39;text-decoration:none;">{{ config('mail.from.address') }}</a>
                        </p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>

</body>
</html>
