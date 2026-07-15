<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TourSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'tour_id', 'starts_at', 'ends_at', 'capacity', 'seats_left', 'price_override', 'is_custom',
    ];

    protected $casts = [
        'starts_at' => 'date',
        'ends_at' => 'date',
        'capacity' => 'integer',
        'seats_left' => 'integer',
        'price_override' => 'integer',
        'is_custom' => 'boolean',
    ];

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function effectivePrice(): int
    {
        return $this->price_override ?? $this->tour->base_price;
    }

    public function hasAvailability(int $seats = 1): bool
    {
        return $this->seats_left >= $seats;
    }
}
