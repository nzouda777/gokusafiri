<?php

namespace App\Services\Payment\DTO;

readonly class WebhookEvent
{
    public function __construct(
        public string $providerReference,
        public string $status,
        public array $rawPayload,
    ) {}
}
