<?php

namespace App\Services;

readonly class PriceBreakdown
{
    public function __construct(
        public int $subtotal,
        public int $memberDiscount,
        public int $taxesFees,
        public int $total,
        public int $depositAmount,
    ) {}

    public function balanceDue(): int
    {
        return $this->total - $this->depositAmount;
    }

    public function toArray(): array
    {
        return [
            'subtotal' => $this->subtotal,
            'member_discount' => $this->memberDiscount,
            'taxes_fees' => $this->taxesFees,
            'total' => $this->total,
            'deposit_amount' => $this->depositAmount,
            'balance_due' => $this->balanceDue(),
        ];
    }
}
