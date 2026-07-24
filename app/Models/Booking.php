<?php

namespace App\Models;

use App\States\Booking\BookingState;
use App\States\Booking\Pending;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\ModelStates\HasStates;

class Booking extends Model
{
    use HasFactory, HasStates, SoftDeletes;

    protected $fillable = [
        'reference', 'user_id', 'tour_id', 'tour_schedule_id', 'departure_time',
        'lead_first_name', 'lead_last_name', 'lead_email', 'lead_phone',
        'adults', 'children', 'infants',
        'subtotal', 'member_discount', 'taxes_fees', 'total', 'currency',
        'payment_plan', 'deposit_amount', 'balance_due_at',
        'status', 'locale', 'expires_at', 'confirmed_at',
        'stripe_customer_id', 'stripe_payment_method_id', 'special_request',
        'departure_reminder_1_sent_at', 'departure_reminder_2_sent_at',
    ];

    protected $casts = [
        'adults' => 'integer',
        'children' => 'integer',
        'infants' => 'integer',
        'subtotal' => 'integer',
        'member_discount' => 'integer',
        'taxes_fees' => 'integer',
        'total' => 'integer',
        'deposit_amount' => 'integer',
        'balance_due_at' => 'datetime',
        'expires_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'departure_reminder_1_sent_at' => 'datetime',
        'departure_reminder_2_sent_at' => 'datetime',
        'status' => BookingState::class,
    ];

    protected static function booted(): void
    {
        static::creating(function (self $booking) {
            if (empty($booking->reference)) {
                $booking->reference = self::generateReference();
            }
            if (empty($booking->expires_at)) {
                $booking->expires_at = now()->addMinutes(20);
            }
        });
    }

    public static function generateReference(): string
    {
        do {
            $ref = 'GKS-'.strtoupper(substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 5));
        } while (self::where('reference', $ref)->exists());

        return $ref;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(TourSchedule::class, 'tour_schedule_id');
    }

    public function getBalanceAmountAttribute(): int
    {
        return max(0, ($this->total ?? 0) - ($this->deposit_amount ?? 0));
    }

    // Convenience alias used in controllers/views
    public function addons(): HasMany
    {
        return $this->hasMany(BookingAddon::class);
    }

    public function travelers(): HasMany
    {
        return $this->hasMany(BookingTraveler::class);
    }

    public function bookingAddons(): HasMany
    {
        return $this->hasMany(BookingAddon::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function totalPax(): int
    {
        return $this->adults + $this->children + $this->infants;
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast() && $this->status instanceof Pending;
    }

    public function clientEmail(): ?string
    {
        return $this->lead_email ?? $this->user?->email;
    }

    public function scopePending($query)
    {
        return $query->whereState('status', Pending::class);
    }
}
