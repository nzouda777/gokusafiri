<?php

namespace App\Jobs;

use App\Models\Booking;
use App\States\Booking\Cancelled;
use App\States\Booking\DepositPaid;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CancelUnpaidBalances implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        Booking::whereState('status', DepositPaid::class)
            ->whereNotNull('balance_due_at')
            ->where('balance_due_at', '<=', now())
            ->each(function (Booking $booking) {
                \DB::transaction(function () use ($booking) {
                    $booking->status->transitionTo(Cancelled::class);

                    // Libérer les places
                    $booking->schedule()->lockForUpdate()->first();
                    $booking->schedule->increment('seats_left', $booking->totalPax());

                    // TODO: dispatch CancellationMail
                });
            });
    }
}
