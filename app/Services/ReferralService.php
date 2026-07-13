<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\ReferralCommission;
use App\Models\User;
use App\Settings\GeneralSettings;

class ReferralService
{
    public const COOKIE_NAME = 'gks_ref';

    public const COOKIE_MINUTES = 60 * 24 * 30; // 30 days

    /**
     * Credit the referrer of the paying client with a commission
     * for a succeeded payment. Idempotent per payment.
     */
    public function creditForPayment(Payment $payment): void
    {
        if (! $payment->isSucceeded()) {
            return;
        }

        $client = $payment->booking?->user;

        if (! $client || ! $client->referred_by || $client->referred_by === $client->id) {
            return;
        }

        if (ReferralCommission::where('payment_id', $payment->id)->exists()) {
            return;
        }

        $rate = app(GeneralSettings::class)->referral_commission_percent;

        if ($rate <= 0) {
            return;
        }

        ReferralCommission::create([
            'referrer_id' => $client->referred_by,
            'referred_user_id' => $client->id,
            'booking_id' => $payment->booking_id,
            'payment_id' => $payment->id,
            'amount' => (int) round($payment->amount * $rate / 100),
            'currency' => $payment->currency ?? 'USD',
            'rate_percent' => $rate,
        ]);
    }

    /**
     * Attach the referrer stored in the referral cookie to a
     * freshly registered user.
     */
    public function attachReferrerFromCookie(User $user): void
    {
        $code = request()->cookie(self::COOKIE_NAME);

        if (! $code || $user->referred_by) {
            return;
        }

        $referrer = User::where('referral_code', $code)->first();

        if (! $referrer || $referrer->id === $user->id) {
            return;
        }

        $user->update(['referred_by' => $referrer->id]);
    }
}
