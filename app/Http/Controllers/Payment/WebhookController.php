<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\BookingTransitionService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class WebhookController extends Controller
{
    public function __construct(
        private readonly BookingTransitionService $transitions,
    ) {}

    public function handle(Request $request, string $provider): Response
    {
        if ($provider === 'stripe') {
            return $this->handleStripe($request);
        }

        // Legacy fake provider
        return response('Unknown provider', 400);
    }

    private function handleStripe(Request $request): Response
    {
        $webhookSecret = config('services.stripe.webhook_secret');
        $signature     = $request->header('Stripe-Signature');

        if (! $webhookSecret || ! $signature) {
            return response('Webhook secret or signature missing', 400);
        }

        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                $signature,
                $webhookSecret
            );
        } catch (SignatureVerificationException) {
            return response('Invalid signature', 400);
        }

        $pi = $event->data->object;

        match ($event->type) {
            'payment_intent.succeeded'       => $this->onSucceeded($pi),
            'payment_intent.payment_failed'  => $this->onFailed($pi),
            default                          => null,
        };

        return response('OK', 200);
    }

    private function onSucceeded(object $pi): void
    {
        $payment = Payment::where('provider_reference', $pi->id)->with('booking')->first();

        if (! $payment || $payment->status === 'succeeded') {
            return;
        }

        $pmId = is_string($pi->payment_method) ? $pi->payment_method : null;

        $payment->update([
            'status'  => 'succeeded',
            'paid_at' => now(),
            'payload' => (array) $pi,
        ]);

        // Save payment method for balance auto-charge
        if ($pmId && $payment->booking) {
            $payment->booking->update(['stripe_payment_method_id' => $pmId]);
        }

        $this->transitions->onPaymentSucceeded($payment->fresh(['booking']));
    }

    private function onFailed(object $pi): void
    {
        $payment = Payment::where('provider_reference', $pi->id)->first();

        if (! $payment) {
            return;
        }

        $payment->update([
            'status'  => 'failed',
            'payload' => (array) $pi,
        ]);
    }
}
