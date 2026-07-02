<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BalancePaidMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking)
    {
        $this->booking->loadMissing(['tour.destination', 'schedule']);
    }

    public function envelope(): Envelope
    {
        $tourTitle = $this->booking->tour->getTranslation('title', 'en', false);

        return new Envelope(
            subject: "Balance received  {$tourTitle} is fully paid",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.balance-paid');
    }
}
