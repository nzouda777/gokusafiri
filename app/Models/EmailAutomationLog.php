<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailAutomationLog extends Model
{
    public $timestamps = false;

    protected $fillable = ['email_automation_id', 'subject_type', 'subject_id', 'period_key', 'sent_at'];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function automation(): BelongsTo
    {
        return $this->belongsTo(EmailAutomation::class, 'email_automation_id');
    }
}
