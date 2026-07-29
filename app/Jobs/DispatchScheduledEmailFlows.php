<?php

namespace App\Jobs;

use App\Models\EmailFlow;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class DispatchScheduledEmailFlows implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        EmailFlow::where('status', 'scheduled')
            ->where('scheduled_at', '<=', now())
            ->each(fn (EmailFlow $flow) => SendEmailFlow::dispatch($flow));
    }
}
