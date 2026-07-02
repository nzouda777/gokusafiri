<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DepositReceivedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking)
    {
        $this->booking->loadMissing(['tour.destination', 'schedule', 'addons.tourAddon']);
    }

    public function envelope(): Envelope
    {
        $tourTitle = $this->booking->tour->getTranslation('title', 'en', false);

        return new Envelope(
            subject: "Deposit received  {$tourTitle}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.deposit-received');
    }
}
