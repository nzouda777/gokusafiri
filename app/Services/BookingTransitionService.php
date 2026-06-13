<?php

namespace App\Services;

use App\Models\Payment;
use App\States\Booking\Confirmed;
use App\States\Booking\DepositPaid;
use App\States\Booking\Paid;
use App\States\Booking\Pending;

class BookingTransitionService
{
    public function onPaymentSucceeded(Payment $payment): void
    {
        $booking = $payment->booking;

        if ($payment->type === 'deposit') {
            if ($booking->status instanceof Pending) {
                $booking->status->transitionTo(DepositPaid::class);
                $booking->refresh();
                $booking->status->transitionTo(Confirmed::class);
                $booking->confirmed_at = now();
                $booking->save();
            }
        } else {
            // full or balance payment
            if ($booking->status instanceof Pending) {
                $booking->status->transitionTo(Paid::class);
                $booking->refresh();
                $booking->status->transitionTo(Confirmed::class);
                $booking->confirmed_at = now();
                $booking->save();
            } elseif ($booking->status instanceof DepositPaid) {
                $booking->status->transitionTo(Confirmed::class);
                $booking->confirmed_at = now();
                $booking->save();
            }
        }
    }
}
