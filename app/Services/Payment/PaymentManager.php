<?php

namespace App\Services\Payment;

use App\Models\Payment;
use App\Services\Payment\Contracts\PaymentProviderInterface;
use App\Services\Payment\DTO\PaymentSession;
use App\Services\Payment\DTO\PaymentStatus;
use App\Services\Payment\DTO\RefundResult;
use App\Services\Payment\DTO\WebhookEvent;
use App\Services\Payment\Providers\FakeProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Manager;

class PaymentManager extends Manager implements PaymentProviderInterface
{
    public function getDefaultDriver(): string
    {
        return config('payment.default', 'fake');
    }

    public function createFakeDriver(): FakeProvider
    {
        return new FakeProvider();
    }

    public function initiate(Payment $payment): PaymentSession
    {
        return $this->driver()->initiate($payment);
    }

    public function verify(Payment $payment): PaymentStatus
    {
        return $this->driver()->verify($payment);
    }

    public function refund(Payment $payment, ?int $amountCents = null): RefundResult
    {
        return $this->driver()->refund($payment, $amountCents);
    }

    public function handleWebhook(Request $request): WebhookEvent
    {
        return $this->driver()->handleWebhook($request);
    }
}
