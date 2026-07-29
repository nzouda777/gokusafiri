<?php

namespace App\Jobs;

use App\Mail\EmailFlowMail;
use App\Models\EmailFlow;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendEmailFlow implements ShouldQueue
{
    use Queueable;

    public function __construct(public EmailFlow $flow) {}

    public function handle(): void
    {
        // Atomically claim the flow so a concurrent dispatch (poller + manual
        // "Send Now") can't send it twice.
        $claimed = EmailFlow::where('id', $this->flow->id)
            ->where('status', 'scheduled')
            ->update(['status' => 'sending']);

        if (! $claimed) {
            return;
        }

        $flow = $this->flow->fresh();

        try {
            $count = 0;

            $flow->audienceQuery()->each(function ($user) use ($flow, &$count) {
                Mail::to($user->email)->queue(new EmailFlowMail($flow, $user->locale ?: 'en'));
                $count++;
            });

            $flow->forceFill([
                'status' => 'sent',
                'sent_at' => now(),
                'recipients_count' => $count,
            ])->save();
        } catch (\Throwable $e) {
            // Don't leave the flow stuck in "sending"  put it back so it
            // can be retried on the next poll, then let the failure surface
            // normally (queue retries / Horizon failed-jobs list).
            $flow->forceFill(['status' => 'scheduled'])->save();
            throw $e;
        }
    }
}
