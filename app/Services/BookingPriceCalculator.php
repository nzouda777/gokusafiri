<?php

namespace App\Services;

use App\Models\TourSchedule;
use App\Models\User;

/**
 * All amounts in cents (integer). Never use floats.
 */
class BookingPriceCalculator
{
    public function __construct(
        private readonly int $taxFeePercent = 0,
        private readonly int $depositPercent = 20,
    ) {}

    /**
     * @param  array<int, int>  $addonLines  [addon_id => quantity]
     * @param  array<int, int>  $addonPrices [addon_id => price_per_person_cents]
     */
    public function calculate(
        TourSchedule $schedule,
        int $adults,
        int $children,
        int $infants,
        array $addonLines = [],
        array $addonPrices = [],
        ?User $user = null,
    ): PriceBreakdown {
        $basePrice = $schedule->effectivePrice();

        // Tour discount
        $tourDiscount = $schedule->tour->discount_percent ?? 0;
        $discountedPrice = (int) round($basePrice * (1 - $tourDiscount / 100));

        $subtotal = $discountedPrice * $adults
            + $discountedPrice * $children;
        // infants free

        // Add-ons
        $addonTotal = 0;
        foreach ($addonLines as $addonId => $qty) {
            $unitPrice = $addonPrices[$addonId] ?? 0;
            $addonTotal += $unitPrice * $qty * ($adults + $children);
        }
        $subtotal += $addonTotal;

        // Member discount (applied after add-ons)
        $memberDiscountPercent = $user?->memberDiscountPercent() ?? 0;
        $memberDiscount = (int) round($subtotal * $memberDiscountPercent / 100);
        $afterMemberDiscount = $subtotal - $memberDiscount;

        // Taxes & fees
        $taxesFees = (int) round($afterMemberDiscount * $this->taxFeePercent / 100);
        $total = $afterMemberDiscount + $taxesFees;

        // Deposit
        $depositAmount = (int) round($total * $this->depositPercent / 100);

        return new PriceBreakdown(
            subtotal: $subtotal,
            memberDiscount: $memberDiscount,
            taxesFees: $taxesFees,
            total: $total,
            depositAmount: $depositAmount,
        );
    }
}
