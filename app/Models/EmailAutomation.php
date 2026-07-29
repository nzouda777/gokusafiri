<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class EmailAutomation extends Model
{
    use HasFactory, HasTranslations;

    public array $translatable = ['subject', 'body'];

    protected $fillable = [
        'name', 'category', 'trigger_event', 'offset_days', 'send_time',
        'recurring_day_of_month', 'audience', 'include_blocks', 'is_active',
        'subject', 'body', 'cta_label', 'cta_url', 'discount_code', 'last_sent_period',
    ];

    protected $casts = [
        'offset_days' => 'integer',
        'recurring_day_of_month' => 'integer',
        'include_blocks' => 'array',
        'is_active' => 'boolean',
    ];

    public const CATEGORIES = [
        'onboarding'      => 'Onboarding (newsletter signup)',
        'booking_journey' => 'Booking journey',
        'lifecycle'       => 'Lifecycle (birthday, monthly)',
    ];

    public const TRIGGER_EVENTS = [
        'newsletter_signup' => 'When a user subscribes to the newsletter',
        'booking_confirmed' => 'When a booking is confirmed',
        'before_departure'  => 'N days before departure',
        'departure_day'     => 'On departure / arrival day',
        'after_trip_end'    => 'N days after the trip ends',
        'user_birthday'     => "On the user's birthday (yearly)",
        'recurring_monthly' => 'Every month, on a fixed day',
    ];

    // Triggers anchored to a single user or booking  deduplicated per subject.
    public const SUBJECT_TRIGGERS = [
        'newsletter_signup', 'booking_confirmed', 'before_departure', 'departure_day', 'after_trip_end', 'user_birthday',
    ];

    public const AUDIENCES = [
        'all_subscribers' => 'All subscribers (opted-in)',
        'has_booked'      => 'Users who have booked before',
        'never_booked'    => 'Users who have never booked',
    ];

    public const BLOCKS = [
        'trip_summary'             => 'Trip summary (destination, dates, travelers)',
        'pre_departure_checklist'  => 'Pre-departure checklist (passport, visa, vaccinations, insurance)',
        'packing_checklist'        => 'Packing checklist',
        'itinerary_link'           => 'Link to view itinerary / booking',
        'invoice_link'             => 'Payment summary',
        'guide_info'                => "Guide's name & WhatsApp",
        'driver_info'               => "Driver's name",
        'hotel_info'                => 'First-night hotel info',
        'emergency_contact'        => 'Emergency contact',
        'referral_block'           => 'Referral program (link & reward)',
        'support_contact'          => 'Support contact',
        'weather_note'             => 'Weather reminder',
    ];

    public function logs(): HasMany
    {
        return $this->hasMany(EmailAutomationLog::class);
    }

    public function isSubjectTrigger(): bool
    {
        return in_array($this->trigger_event, self::SUBJECT_TRIGGERS, true);
    }

    public function currentPeriodKey(): string
    {
        return $this->trigger_event === 'user_birthday' ? (string) now()->year : 'once';
    }

    public function hasSent(string $subjectType, int $subjectId): bool
    {
        return $this->logs()
            ->where('subject_type', $subjectType)
            ->where('subject_id', $subjectId)
            ->where('period_key', $this->currentPeriodKey())
            ->exists();
    }

    public function markSent(string $subjectType, int $subjectId): void
    {
        $this->logs()->create([
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'period_key' => $this->currentPeriodKey(),
            'sent_at' => now(),
        ]);
    }

    public function isPastSendTime(): bool
    {
        return now()->format('H:i') >= substr((string) $this->send_time, 0, 5);
    }

    /** Users targeted by broadcast-style triggers (newsletter_signup, recurring_monthly), respecting consent. */
    public function audienceQuery()
    {
        $query = User::query()->whereNotNull('email')->where('newsletter_opt_in', true);

        return match ($this->audience) {
            'has_booked'   => $query->whereHas('bookings'),
            'never_booked' => $query->whereDoesntHave('bookings'),
            default        => $query,
        };
    }

    /** Renders the admin-selected dynamic blocks as ready-to-embed HTML, using real booking/user data when available. */
    public function renderBlocks(?Booking $booking, ?User $user): array
    {
        $schedule = $booking?->schedule;
        $tour = $booking?->tour;
        $html = [];

        foreach ((array) ($this->include_blocks ?? []) as $block) {
            $html[] = match ($block) {
                'trip_summary' => $this->blockTripSummary($booking, $tour, $schedule),
                'pre_departure_checklist' => $this->blockChecklist(
                    'Before you go',
                    ['🛂 Check your passport validity and any required visas.', '💉 Confirm your vaccinations and travel insurance are in order.']
                ),
                'packing_checklist' => $this->blockChecklist(
                    'Packing checklist',
                    ['🎒 Light, breathable layers and a good pair of walking shoes.', '🔌 Universal adapter, sunscreen, and a reusable water bottle.']
                ),
                'itinerary_link', 'invoice_link' => $booking ? $this->blockTripLink($booking, $block) : null,
                'guide_info' => $schedule?->guide_name ? $this->blockContact('Your guide', $schedule->guide_name, $schedule->guide_phone) : null,
                'driver_info' => $schedule?->driver_name ? $this->blockContact('Your driver', $schedule->driver_name) : null,
                'hotel_info' => $schedule?->hotel_name ? $this->blockContact('First-night hotel', $schedule->hotel_name, null, $schedule->hotel_address) : null,
                'emergency_contact' => $schedule?->emergency_contact ? $this->blockContact('Emergency contact', $schedule->emergency_contact) : null,
                'referral_block' => $user ? $this->blockReferral($user) : null,
                'support_contact' => $this->blockContact('Need help?', config('mail.admin_email', config('mail.from.address'))),
                'weather_note' => $this->blockChecklist('Weather', ['🌤️ Check the forecast for your destination a few days before you fly.']),
                default => null,
            };
        }

        return array_values(array_filter($html));
    }

    private function blockTripSummary(?Booking $booking, ?Tour $tour, ?TourSchedule $schedule): ?string
    {
        if (! $booking || ! $tour) {
            return null;
        }

        $dest = $tour->destination;
        $dateRange = $schedule
            ? \Carbon\Carbon::parse($schedule->starts_at)->format('M j').' – '.\Carbon\Carbon::parse($schedule->ends_at)->format('M j, Y')
            : null;
        $pax = $booking->totalPax();

        $rows = '';
        if ($dest) {
            $rows .= "<tr><td style='padding:8px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;'>Destination</td><td style='padding:8px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;'>{$dest->name}, {$dest->country}</td></tr>";
        }
        if ($dateRange) {
            $rows .= "<tr><td style='padding:8px 0;font-size:13px;color:#8a968d;border-bottom:1px solid #f0ede8;'>Dates</td><td style='padding:8px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8;'>{$dateRange}</td></tr>";
        }
        $rows .= "<tr><td style='padding:8px 0;font-size:13px;color:#8a968d;'>Travelers</td><td style='padding:8px 0;font-size:13px;color:#16241b;font-weight:600;text-align:right;'>{$pax} ".($pax === 1 ? 'person' : 'people').'</td></tr>';

        return "<table width='100%' cellpadding='0' cellspacing='0' border='0' style='margin-bottom:24px;'>{$rows}</table>";
    }

    private function blockChecklist(string $title, array $lines): string
    {
        $items = implode('', array_map(
            fn ($l) => "<p style='margin:0 0 6px;font-size:13px;color:#4f5c53;'>{$l}</p>",
            $lines
        ));

        return "<div style='background-color:#eef3ec;border-radius:12px;padding:20px 24px;margin-bottom:24px;'>".
               "<p style='margin:0 0 10px;font-size:13px;font-weight:700;color:#2E4A39;text-transform:uppercase;letter-spacing:0.5px;'>{$title}</p>{$items}</div>";
    }

    private function blockTripLink(Booking $booking, string $block): string
    {
        $url = route('booking.confirmation', ['locale' => $booking->locale ?: 'en', 'reference' => $booking->reference]);
        $label = $block === 'invoice_link' ? 'View Payment Summary' : 'View My Itinerary';

        return "<div style='text-align:center;margin-bottom:24px;'><a href='{$url}' style='display:inline-block;padding:12px 28px;background-color:#2E4A39;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:50px;'>{$label} →</a></div>";
    }

    private function blockContact(string $title, string $name, ?string $phone = null, ?string $extra = null): string
    {
        $phoneLine = $phone ? "<p style='margin:2px 0 0;font-size:13px;color:#6e8c79;'>{$phone}</p>" : '';
        $extraLine = $extra ? "<p style='margin:2px 0 0;font-size:13px;color:#4f5c53;'>{$extra}</p>" : '';

        return "<div style='background-color:#f5f2ec;border-radius:10px;padding:14px 20px;margin-bottom:16px;'>".
               "<p style='margin:0;font-size:11px;color:#8a968d;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;'>{$title}</p>".
               "<p style='margin:4px 0 0;font-size:15px;color:#16241b;font-weight:700;'>{$name}</p>{$phoneLine}{$extraLine}</div>";
    }

    private function blockReferral(User $user): string
    {
        $code = $user->getOrCreateReferralCode();

        return "<div style='background-color:#fff3eb;border-left:4px solid #E07A3F;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px;'>".
               "<p style='margin:0 0 6px;font-size:13px;color:#4f5c53;'>Earn 5% travel credit for every friend you refer who books a trip.</p>".
               "<p style='margin:0;font-size:13px;color:#8a968d;'>Your referral code: <strong style='color:#2E4A39;letter-spacing:1px;'>{$code}</strong></p></div>";
    }
}
