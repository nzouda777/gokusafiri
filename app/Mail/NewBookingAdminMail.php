<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewBookingAdminMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public Payment $payment,
    ) {
        $this->booking->loadMissing(['tour.destination', 'schedule', 'addons.tourAddon']);
    }

    public function envelope(): Envelope
    {
        $tourTitle = $this->booking->tour->getTranslation('title', 'en', false);
        $type      = ucfirst($this->payment->type);

        return new Envelope(
            subject: "[GokuSafiri] {$type} payment — {$this->booking->reference} — {$tourTitle}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.admin-new-booking');
    }
}
