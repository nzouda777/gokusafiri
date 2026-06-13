<?php

namespace App\Services\Payment\Providers;

use App\Models\Payment;
use App\Services\Payment\Contracts\PaymentProviderInterface;
use App\Services\Payment\DTO\PaymentSession;
use App\Services\Payment\DTO\PaymentStatus;
use App\Services\Payment\DTO\RefundResult;
use App\Services\Payment\DTO\WebhookEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FakeProvider implements PaymentProviderInterface
{
    public function initiate(Payment $payment): PaymentSession
    {
        $ref = 'FAKE-' . strtoupper(Str::random(8));
        $payment->update(['provider_reference' => $ref, 'status' => 'processing']);

        return new PaymentSession(
            redirectUrl: route('fake-pay.show', $payment),
            clientToken: null,
            expiresAt: new \DateTimeImmutable('+30 minutes'),
        );
    }

    public function verify(Payment $payment): PaymentStatus
    {
        return new PaymentStatus(status: $payment->status, providerReference: $payment->provider_reference);
    }

    public function refund(Payment $payment, ?int $amountCents = null): RefundResult
    {
        return new RefundResult(success: true, providerReference: 'REFUND-' . strtoupper(Str::random(8)));
    }

    public function handleWebhook(Request $request): WebhookEvent
    {
        $validated = $request->validate([
            'provider_reference' => 'required|string',
            'status' => 'required|in:succeeded,failed',
        ]);

        return new WebhookEvent(
            providerReference: $validated['provider_reference'],
            status: $validated['status'],
            rawPayload: $request->all(),
        );
    }
}
