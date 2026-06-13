<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id', 'type', 'provider', 'provider_reference',
        'amount', 'currency', 'status', 'idempotency_key', 'payload', 'paid_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'payload' => 'array',
        'paid_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function scopeSucceeded($query)
    {
        return $query->where('status', 'succeeded');
    }

    public function isSucceeded(): bool
    {
        return $this->status === 'succeeded';
    }
}
