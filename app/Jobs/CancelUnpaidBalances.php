<?php

namespace App\Jobs;

use App\Mail\BookingCancelledMail;
use App\Models\Booking;
use App\States\Booking\Cancelled;
use App\States\Booking\DepositPaid;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class CancelUnpaidBalances implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        Booking::whereState('status', DepositPaid::class)
            ->whereNotNull('balance_due_at')
            ->where('balance_due_at', '<=', now())
            ->with(['tour.destination', 'schedule'])
            ->each(function (Booking $booking) {
                DB::transaction(function () use ($booking) {
                    $booking->status->transitionTo(Cancelled::class);

                    $booking->schedule()->lockForUpdate()->first();
                    $booking->schedule->increment('seats_left', $booking->totalPax());
                });

                $email = $booking->clientEmail();

                if ($email) {
                    Mail::to($email)->queue(new BookingCancelledMail($booking));
                }
            });
    }
}
