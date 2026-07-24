<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DepartureReminderMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public int $daysUntil,
    ) {
        $this->booking->loadMissing(['tour.destination', 'schedule']);
    }

    public function envelope(): Envelope
    {
        $tourTitle = $this->booking->tour->getTranslation('title', 'en', false);
        $when = $this->daysUntil === 1 ? 'tomorrow' : "in {$this->daysUntil} days";

        return new Envelope(
            subject: "Your safari to {$tourTitle} starts {$when}!",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.departure-reminder');
    }
}
