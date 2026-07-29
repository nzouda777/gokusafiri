<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\EmailAutomation;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailAutomationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public EmailAutomation $automation,
        public string $recipientLocale = 'en',
        public ?User $recipientUser = null,
        public ?Booking $booking = null,
    ) {}

    public function envelope(): Envelope
    {
        $fallback = config('app.fallback_locale', 'en');

        $subject = $this->automation->getTranslation('subject', $this->recipientLocale, true)
            ?: $this->automation->getTranslation('subject', $fallback, false);

        return new Envelope(subject: $this->interpolate($subject));
    }

    public function content(): Content
    {
        $fallback = config('app.fallback_locale', 'en');

        $body = $this->automation->getTranslation('body', $this->recipientLocale, true)
            ?: $this->automation->getTranslation('body', $fallback, false);

        return new Content(
            view: 'emails.automation',
            with: [
                'emailSubject' => $this->envelope()->subject,
                'body'         => $this->interpolate($body),
                'blocks'       => $this->automation->renderBlocks($this->booking, $this->recipientUser),
                'ctaLabel'     => $this->automation->cta_label,
                'ctaUrl'       => $this->automation->cta_url,
                'discountCode' => $this->automation->discount_code,
            ],
        );
    }

    /** Supports {{tour}}, {{destination}}, {{name}}, {{days}} tokens in subject/body. */
    private function interpolate(string $text): string
    {
        $tour = $this->booking?->tour;
        $dest = $tour?->destination;

        return strtr($text, [
            '{{tour}}' => $tour?->getTranslation('title', $this->recipientLocale, false) ?? '',
            '{{destination}}' => $dest?->name ?? '',
            '{{name}}' => $this->recipientUser?->first_name ?? '',
            '{{days}}' => (string) $this->automation->offset_days,
        ]);
    }
}
