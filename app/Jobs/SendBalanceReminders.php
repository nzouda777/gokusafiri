<?php

namespace App\Jobs;

use App\Models\Booking;
use App\States\Booking\DepositPaid;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\URL;

class SendBalanceReminders implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        Booking::whereState('status', DepositPaid::class)
            ->whereNotNull('balance_due_at')
            ->whereBetween('balance_due_at', [now(), now()->addDays(7)])
            ->each(function (Booking $booking) {
                $signedUrl = URL::signedRoute('booking.balance.pay', ['booking' => $booking]);

                // TODO: dispatch BalanceReminderMail
                \Log::info("Balance reminder queued for booking {$booking->reference}", [
                    'url' => $signedUrl,
                ]);
            });
    }
}
