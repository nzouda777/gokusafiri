<?php

namespace App\Services\Payment\Contracts;

use App\Models\Payment;
use App\Services\Payment\DTO\PaymentSession;
use App\Services\Payment\DTO\PaymentStatus;
use App\Services\Payment\DTO\RefundResult;
use App\Services\Payment\DTO\WebhookEvent;
use Illuminate\Http\Request;

interface PaymentProviderInterface
{
    public function initiate(Payment $payment): PaymentSession;

    public function verify(Payment $payment): PaymentStatus;

    public function refund(Payment $payment, ?int $amountCents = null): RefundResult;

    public function handleWebhook(Request $request): WebhookEvent;
}
