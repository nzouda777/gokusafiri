<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function view(User $user, Booking $booking): bool
    {
        return $booking->user_id === $user->id || $user->hasRole('admin');
    }

    public function cancel(User $user, Booking $booking): bool
    {
        if (! $this->view($user, $booking)) {
            return false;
        }

        $departureDate = $booking->schedule->starts_at;
        $tour = $booking->schedule->tour;

        return $tour->isCancellationFree($departureDate);
    }
}
