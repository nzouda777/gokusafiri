<?php

namespace App\Mail;

use App\Models\EmailFlow;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailFlowMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public EmailFlow $flow,
        public string $recipientLocale = 'en',
    ) {}

    public function envelope(): Envelope
    {
        $fallback = config('app.fallback_locale', 'en');

        $subject = $this->flow->getTranslation('subject', $this->recipientLocale, true)
            ?: $this->flow->getTranslation('subject', $fallback, false);

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        $fallback = config('app.fallback_locale', 'en');

        $body = $this->flow->getTranslation('body', $this->recipientLocale, true)
            ?: $this->flow->getTranslation('body', $fallback, false);

        return new Content(
            view: 'emails.marketing-flow',
            with: [
                'emailSubject' => $this->envelope()->subject,
                'body'         => $body,
                'ctaLabel'     => $this->flow->cta_label,
                'ctaUrl'       => $this->flow->cta_url,
                'discountCode' => $this->flow->discount_code,
            ],
        );
    }
}
