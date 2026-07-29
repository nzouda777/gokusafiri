<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements HasMedia
{
    use HasApiTokens, HasFactory, HasRoles, InteractsWithMedia, Notifiable;

    protected $fillable = [
        'name', 'first_name', 'last_name', 'email', 'password',
        'google_id', 'avatar', 'locale', 'country', 'phone',
        'tier', 'newsletter_opt_in', 'referral_code', 'referred_by',
        'passport_number', 'passport_expiry', 'nationality', 'email_verified_at',
        'birth_date', 'newsletter_subscribed_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'passport_number' => 'encrypted',
            'passport_expiry' => 'date',
            'newsletter_opt_in' => 'boolean',
            'birth_date' => 'date',
            'newsletter_subscribed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        // Anchor date for the newsletter welcome-series automations.
        static::saving(function (self $user) {
            if ($user->newsletter_opt_in && ! $user->newsletter_subscribed_at) {
                $user->newsletter_subscribed_at = now();
            }
        });
    }

    public function operators(): BelongsToMany
    {
        return $this->belongsToMany(Operator::class)->withPivot('role')->withTimestamps();
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(self::class, 'referred_by');
    }

    public function referredUsers(): HasMany
    {
        return $this->hasMany(self::class, 'referred_by');
    }

    public function referralCommissions(): HasMany
    {
        return $this->hasMany(ReferralCommission::class, 'referrer_id');
    }

    public function getOrCreateReferralCode(): string
    {
        if ($this->referral_code) {
            return $this->referral_code;
        }

        do {
            $code = strtoupper(substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 8));
        } while (self::where('referral_code', $code)->exists());

        $this->update(['referral_code' => $code]);

        return $code;
    }

    public function memberDiscountPercent(): int
    {
        return match ($this->tier) {
            'explorer' => 5,
            default => 0,
        };
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')->singleFile();
    }
}
