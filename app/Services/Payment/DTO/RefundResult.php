<?php

namespace App\Services\Payment\DTO;

readonly class RefundResult
{
    public function __construct(
        public bool $success,
        public ?string $providerReference = null,
        public ?string $errorMessage = null,
    ) {}
}
