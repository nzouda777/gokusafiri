<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class EmailFlow extends Model
{
    use HasFactory, HasTranslations;

    public array $translatable = ['subject', 'body'];

    protected $fillable = [
        'name', 'type', 'audience', 'subject', 'body',
        'cta_label', 'cta_url', 'discount_code',
        'status', 'scheduled_at', 'sent_at', 'recipients_count',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'recipients_count' => 'integer',
    ];

    protected $attributes = [
        'status' => 'draft',
    ];

    public const TYPES = [
        'discount'  => 'Discount / Promo',
        'holiday'   => 'Holiday / Seasonal',
        'new_offer' => 'New Offer',
        'referral'  => 'Referral Push',
        'other'     => 'Other',
    ];

    public const AUDIENCES = [
        'all_subscribers' => 'All subscribers (opted-in)',
        'has_booked'      => 'Users who have booked before',
        'never_booked'    => 'Users who have never booked',
    ];

    public const STATUSES = [
        'draft'     => 'Draft',
        'scheduled' => 'Scheduled',
        'sending'   => 'Sending',
        'sent'      => 'Sent',
        'cancelled' => 'Cancelled',
    ];

    protected static function booted(): void
    {
        // Status is derived from scheduled_at as long as the flow hasn't
        // started sending  once sending/sent/cancelled, only explicit
        // actions (job, "Cancel") move it further, never a plain save.
        static::saving(function (self $flow) {
            if (empty($flow->status) || in_array($flow->status, ['draft', 'scheduled'], true)) {
                $flow->status = $flow->scheduled_at ? 'scheduled' : 'draft';
            }
        });
    }

    /** Users targeted by this flow, respecting newsletter consent. */
    public function audienceQuery()
    {
        $query = User::query()->whereNotNull('email')->where('newsletter_opt_in', true);

        return match ($this->audience) {
            'has_booked'   => $query->whereHas('bookings'),
            'never_booked' => $query->whereDoesntHave('bookings'),
            default        => $query,
        };
    }
}
