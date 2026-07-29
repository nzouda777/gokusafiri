<?php

namespace App\Jobs;

use App\Mail\EmailAutomationMail;
use App\Models\Booking;
use App\Models\EmailAutomation;
use App\Models\EmailAutomationLog;
use App\Models\User;
use App\States\Booking\Confirmed;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class DispatchEmailAutomations implements ShouldQueue
{
    use Queueable;

    // Safety bound so a paused/broken automation doesn't suddenly fire for
    // events far in the past once re-activated.
    private const CATCH_UP_WINDOW_DAYS = 14;

    public function handle(): void
    {
        EmailAutomation::where('is_active', true)->get()->each(function (EmailAutomation $automation) {
            if (! $automation->isPastSendTime()) {
                return;
            }

            match ($automation->trigger_event) {
                'newsletter_signup' => $this->sendToUsers($automation, $this->newsletterCandidates($automation)),
                'user_birthday'     => $this->sendToUsers($automation, $this->birthdayCandidates($automation)),
                'booking_confirmed' => $this->sendToBookings($automation, $this->bookingConfirmedCandidates($automation)),
                'before_departure'  => $this->sendToBookings($automation, $this->beforeDepartureCandidates($automation)),
                'departure_day'     => $this->sendToBookings($automation, $this->departureDayCandidates($automation)),
                'after_trip_end'    => $this->sendToBookings($automation, $this->afterTripEndCandidates($automation)),
                'recurring_monthly' => $this->sendRecurringBroadcast($automation),
                default => null,
            };
        });
    }

    private function alreadySentIds(EmailAutomation $automation, string $subjectType): array
    {
        return EmailAutomationLog::where('email_automation_id', $automation->id)
            ->where('subject_type', $subjectType)
            ->where('period_key', $automation->currentPeriodKey())
            ->pluck('subject_id')
            ->all();
    }

    private function newsletterCandidates(EmailAutomation $automation)
    {
        return $automation->audienceQuery()
            ->whereNotNull('newsletter_subscribed_at')
            ->whereDate('newsletter_subscribed_at', '<=', now()->subDays($automation->offset_days))
            ->whereDate('newsletter_subscribed_at', '>=', now()->subDays($automation->offset_days + self::CATCH_UP_WINDOW_DAYS))
            ->whereNotIn('id', $this->alreadySentIds($automation, 'user'))
            ->get();
    }

    private function birthdayCandidates(EmailAutomation $automation)
    {
        return User::query()
            ->whereNotNull('email')
            ->whereNotNull('birth_date')
            ->whereMonth('birth_date', now()->month)
            ->whereDay('birth_date', now()->day)
            ->whereNotIn('id', $this->alreadySentIds($automation, 'user'))
            ->get();
    }

    private function bookingConfirmedCandidates(EmailAutomation $automation)
    {
        return Booking::whereState('status', Confirmed::class)
            ->whereNotNull('confirmed_at')
            ->whereDate('confirmed_at', '<=', now()->subDays($automation->offset_days))
            ->whereDate('confirmed_at', '>=', now()->subDays($automation->offset_days + self::CATCH_UP_WINDOW_DAYS))
            ->whereNotIn('id', $this->alreadySentIds($automation, 'booking'))
            ->with(['tour.destination', 'schedule', 'user'])
            ->get();
    }

    private function beforeDepartureCandidates(EmailAutomation $automation)
    {
        return Booking::whereState('status', Confirmed::class)
            ->whereHas('schedule', fn ($q) => $q
                ->where('starts_at', '>=', now()->startOfDay())
                ->where('starts_at', '<=', now()->addDays($automation->offset_days)->endOfDay()))
            ->whereNotIn('id', $this->alreadySentIds($automation, 'booking'))
            ->with(['tour.destination', 'schedule', 'user'])
            ->get();
    }

    private function departureDayCandidates(EmailAutomation $automation)
    {
        return Booking::whereState('status', Confirmed::class)
            ->whereHas('schedule', fn ($q) => $q->whereDate('starts_at', now()->toDateString()))
            ->whereNotIn('id', $this->alreadySentIds($automation, 'booking'))
            ->with(['tour.destination', 'schedule', 'user'])
            ->get();
    }

    private function afterTripEndCandidates(EmailAutomation $automation)
    {
        return Booking::whereState('status', Confirmed::class)
            ->whereHas('schedule', fn ($q) => $q
                ->where('ends_at', '<=', now()->subDays($automation->offset_days)->endOfDay())
                ->where('ends_at', '>=', now()->subDays($automation->offset_days + self::CATCH_UP_WINDOW_DAYS)))
            ->whereNotIn('id', $this->alreadySentIds($automation, 'booking'))
            ->with(['tour.destination', 'schedule', 'user'])
            ->get();
    }

    private function sendToUsers(EmailAutomation $automation, $users): void
    {
        foreach ($users as $user) {
            Mail::to($user->email)->queue(new EmailAutomationMail($automation, $user->locale ?: 'en', $user));
            $automation->markSent('user', $user->id);
        }
    }

    private function sendToBookings(EmailAutomation $automation, $bookings): void
    {
        foreach ($bookings as $booking) {
            $email = $booking->clientEmail();
            if (! $email) {
                continue;
            }

            Mail::to($email)->queue(new EmailAutomationMail(
                $automation,
                $booking->locale ?: 'en',
                $booking->user,
                $booking,
            ));
            $automation->markSent('booking', $booking->id);
        }
    }

    private function sendRecurringBroadcast(EmailAutomation $automation): void
    {
        $currentPeriod = now()->format('Y-m');

        if ($automation->last_sent_period === $currentPeriod) {
            return;
        }

        if (now()->day < ($automation->recurring_day_of_month ?? 1)) {
            return;
        }

        $automation->audienceQuery()->each(function (User $user) use ($automation) {
            Mail::to($user->email)->queue(new EmailAutomationMail($automation, $user->locale ?: 'en', $user));
        });

        $automation->forceFill(['last_sent_period' => $currentPeriod])->save();
    }
}
