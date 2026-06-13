<?php

namespace App\Jobs;

use App\Models\Booking;
use App\States\Booking\Expired;
use App\States\Booking\Pending;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ReleaseExpiredBookings implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        Booking::whereState('status', Pending::class)
            ->where('expires_at', '<=', now())
            ->with('schedule')
            ->each(function (Booking $booking) {
                \DB::transaction(function () use ($booking) {
                    $booking->status->transitionTo(Expired::class);

                    // Ré-incrémenter les places
                    $booking->schedule()->lockForUpdate()->first();
                    $booking->schedule->increment('seats_left', $booking->totalPax());
                });
            });
    }
}
