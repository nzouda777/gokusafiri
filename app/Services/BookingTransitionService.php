<?php

namespace App\Services;

use App\Mail\BalancePaidMail;
use App\Mail\BookingConfirmedMail;
use App\Mail\DepositReceivedMail;
use App\Mail\NewBookingAdminMail;
use App\Models\Payment;
use App\States\Booking\Confirmed;
use App\States\Booking\DepositPaid;
use App\States\Booking\Paid;
use App\States\Booking\Pending;
use Illuminate\Support\Facades\Mail;

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

                $this->sendClientMail(new DepositReceivedMail($booking->fresh()), $booking->clientEmail());
                $this->sendAdminMail(new NewBookingAdminMail($booking->fresh(), $payment));
            }
        } else {
            // full or balance payment
            if ($booking->status instanceof Pending) {
                $booking->status->transitionTo(Paid::class);
                $booking->refresh();
                $booking->status->transitionTo(Confirmed::class);
                $booking->confirmed_at = now();
                $booking->save();

                $this->sendClientMail(new BookingConfirmedMail($booking->fresh()), $booking->clientEmail());
                $this->sendAdminMail(new NewBookingAdminMail($booking->fresh(), $payment));

            } elseif ($booking->status instanceof DepositPaid) {
                $booking->status->transitionTo(Confirmed::class);
                $booking->confirmed_at = now();
                $booking->save();

                $this->sendClientMail(new BalancePaidMail($booking->fresh()), $booking->clientEmail());
                $this->sendAdminMail(new NewBookingAdminMail($booking->fresh(), $payment));
            }
        }
    }

    private function sendClientMail(object $mailable, ?string $email): void
    {
        if (! $email) {
            return;
        }

        Mail::to($email)->queue($mailable);
    }

    private function sendAdminMail(object $mailable): void
    {
        $adminEmail = config('mail.admin_email');

        if (! $adminEmail) {
            return;
        }

        Mail::to($adminEmail)->queue($mailable);
    }
}
