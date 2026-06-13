<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class BookingTraveler extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'booking_id', 'type', 'first_name', 'last_name',
        'date_of_birth', 'country', 'passport_number',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'passport_number' => 'encrypted',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('passport')->singleFile();
    }
}
