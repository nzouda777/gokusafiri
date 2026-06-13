<?php

namespace App\Services\Payment\DTO;

readonly class PaymentStatus
{
    public function __construct(
        public string $status,
        public ?string $providerReference = null,
    ) {}

    public function isSucceeded(): bool
    {
        return $this->status === 'succeeded';
    }
}
