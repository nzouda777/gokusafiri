<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BalanceReminderMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public string  $payUrl,
    ) {
        $this->booking->loadMissing(['tour.destination', 'schedule']);
    }

    public function envelope(): Envelope
    {
        $tourTitle = $this->booking->tour->getTranslation('title', 'en', false);
        $dueDate   = $this->booking->balance_due_at?->format('M j, Y') ?? '';

        return new Envelope(
            subject: "Balance due {$dueDate} — {$tourTitle}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.balance-reminder');
    }
}
