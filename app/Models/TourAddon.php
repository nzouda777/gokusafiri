<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Translatable\HasTranslations;

class TourAddon extends Model
{
    use HasFactory, HasTranslations;

    public array $translatable = ['label', 'description'];

    protected $fillable = ['tour_id', 'label', 'description', 'price_per_person', 'position'];

    protected $casts = [
        'price_per_person' => 'integer',
        'position' => 'integer',
    ];

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}
