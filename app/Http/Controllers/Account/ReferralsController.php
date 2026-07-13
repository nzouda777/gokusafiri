<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Settings\GeneralSettings;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReferralsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $code = $user->getOrCreateReferralCode();

        $commissions = $user->referralCommissions()
            ->with('booking:id,reference')
            ->latest()
            ->get();

        return Inertia::render('Account/Referrals', [
            'referral' => [
                'code' => $code,
                'link' => rtrim(config('app.url'), '/').'/?ref='.$code,
                'rate_percent' => app(GeneralSettings::class)->referral_commission_percent,
                'signups' => $user->referredUsers()->count(),
                'earned_total' => (int) $commissions->sum('amount'),
                'pending_total' => (int) $commissions->where('status', 'earned')->sum('amount'),
                'paid_total' => (int) $commissions->where('status', 'paid')->sum('amount'),
                'commissions' => $commissions->map(fn ($c) => [
                    'id' => $c->id,
                    'booking_reference' => $c->booking?->reference,
                    'amount' => $c->amount,
                    'currency' => $c->currency,
                    'status' => $c->status,
                    'date' => $c->created_at->toDateString(),
                ]),
            ],
        ]);
    }
}
