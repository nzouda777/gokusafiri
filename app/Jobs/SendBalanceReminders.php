<?php

namespace App\Jobs;

use App\Mail\BalanceReminderMail;
use App\Models\Booking;
use App\States\Booking\DepositPaid;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

class SendBalanceReminders implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        Booking::whereState('status', DepositPaid::class)
            ->whereNotNull('balance_due_at')
            ->whereBetween('balance_due_at', [now(), now()->addDays(7)])
            ->with(['tour.destination', 'schedule'])
            ->each(function (Booking $booking) {
                $email = $booking->clientEmail();

                if (! $email) {
                    return;
                }

                $signedUrl = URL::signedRoute('booking.balance.pay', ['booking' => $booking]);

                Mail::to($email)->queue(new BalanceReminderMail($booking, $signedUrl));
            });
    }
}
