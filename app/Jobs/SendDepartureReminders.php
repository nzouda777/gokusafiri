<?php

namespace App\Jobs;

use App\Mail\DepartureReminderMail;
use App\Models\Booking;
use App\Settings\GeneralSettings;
use App\States\Booking\Confirmed;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendDepartureReminders implements ShouldQueue
{
    use Queueable;

    public function handle(GeneralSettings $settings): void
    {
        $day1 = max(0, $settings->departure_reminder_days_1);
        $day2 = max(0, $settings->departure_reminder_days_2);
        $maxDays = max($day1, $day2);

        Booking::whereState('status', Confirmed::class)
            ->whereHas('schedule', fn ($q) => $q->whereBetween('starts_at', [now()->startOfDay(), now()->addDays($maxDays)->endOfDay()]))
            ->where(function ($q) {
                $q->whereNull('departure_reminder_1_sent_at')
                    ->orWhereNull('departure_reminder_2_sent_at');
            })
            ->with(['tour.destination', 'schedule'])
            ->each(function (Booking $booking) use ($day1, $day2) {
                $schedule = $booking->schedule;
                if (! $schedule) {
                    return;
                }

                $email = $booking->clientEmail();
                if (! $email) {
                    return;
                }

                $daysUntil = now()->startOfDay()->diffInDays($schedule->starts_at->copy()->startOfDay(), false);
                if ($daysUntil < 0) {
                    return;
                }

                if ($daysUntil <= $day1 && ! $booking->departure_reminder_1_sent_at) {
                    Mail::to($email)->queue(new DepartureReminderMail($booking, $daysUntil));
                    $booking->forceFill(['departure_reminder_1_sent_at' => now()])->save();
                } elseif ($daysUntil <= $day2 && ! $booking->departure_reminder_2_sent_at) {
                    Mail::to($email)->queue(new DepartureReminderMail($booking, $daysUntil));
                    $booking->forceFill(['departure_reminder_2_sent_at' => now()])->save();
                }
            });
    }
}
