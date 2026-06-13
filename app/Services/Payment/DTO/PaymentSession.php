<?php

namespace App\Services\Payment\DTO;

readonly class PaymentSession
{
    public function __construct(
        public string $redirectUrl,
        public ?string $clientToken,
        public \DateTimeImmutable $expiresAt,
    ) {}
}
