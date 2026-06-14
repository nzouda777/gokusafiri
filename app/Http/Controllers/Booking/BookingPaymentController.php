<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\BookingTransitionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\StripeClient;

class BookingPaymentController extends Controller
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    // ──────────────────────────────────────────────
    // GET /booking/{reference}/payment
    // ──────────────────────────────────────────────
    public function show(Request $request): Response
    {
        $reference = $request->route('reference');
        $booking = Booking::where('reference', $reference)
            ->with(['tour.destination', 'tour.media', 'schedule', 'addons.tourAddon'])
            ->firstOrFail();

        $tour    = $booking->tour;
        $media   = $tour->getMedia('gallery');
        $locale  = app()->getLocale();

        $addons = $booking->addons->map(fn ($ba) => [
            'addon' => [
                'id'    => $ba->tourAddon->id,
                'name'  => $ba->tourAddon->getTranslation('label', $locale, false),
                'price' => $ba->unit_price,
                'per'   => 'person',
            ],
            'quantity' => $ba->quantity,
        ]);

        $balanceDueDate = $booking->balance_due_at?->toDateString();

        // Get or create Stripe Customer for this user/email
        $customerId = $this->resolveStripeCustomer($booking);

        // Create a fresh PaymentIntent (cancel any stale initiated ones first)
        $clientSecret = $this->createPaymentIntent($booking, $customerId);

        return Inertia::render('Booking/Payment', [
            'booking' => [
                'reference'       => $booking->reference,
                'total_amount'    => $booking->total,
                'deposit_amount'  => $booking->deposit_amount,
                'balance_amount'  => $booking->balance_amount,
                'balance_due_date' => $balanceDueDate,
                'payment_plan'    => $booking->payment_plan,
                'member_discount' => $booking->member_discount ?? 0,
                'taxes'           => $booking->taxes_fees ?? 0,
                'travelers_count' => $booking->adults + $booking->children,
                'addons'          => $addons,
                'tour' => [
                    'id'               => $tour->id,
                    'title'            => $tour->title,
                    'base_price'       => $tour->base_price,
                    'cancellation_days' => $tour->cancellation_days,
                    'card_url'         => $media->first()?->getUrl('card') ?? '',
                    'destination' => $tour->destination ? [
                        'name'    => $tour->destination->name,
                        'country' => $tour->destination->country ?? '',
                    ] : null,
                ],
                'schedule' => $booking->schedule ? [
                    'start_date' => $booking->schedule->starts_at->toDateString(),
                    'end_date'   => $booking->schedule->ends_at->toDateString(),
                ] : null,
            ],
            'client_secret' => $clientSecret,
            'stripe_key'    => config('services.stripe.key'),
        ]);
    }

    // ──────────────────────────────────────────────
    // POST /booking/{reference}/payment/plan
    // Switch between deposit and full payment (creates a new PaymentIntent)
    // ──────────────────────────────────────────────
    public function updatePlan(Request $request): JsonResponse
    {
        $reference = $request->route('reference');
        $request->validate(['plan' => 'required|in:full,deposit']);

        $booking = Booking::where('reference', $reference)->firstOrFail();
        $booking->update(['payment_plan' => $request->plan]);

        // Cancel any stale initiated PaymentIntents for this booking
        $this->cancelInitiatedPayments($booking);

        $customerId = $this->resolveStripeCustomer($booking);
        $clientSecret = $this->createPaymentIntent($booking->fresh(), $customerId);

        return response()->json(['client_secret' => $clientSecret]);
    }

    // ──────────────────────────────────────────────
    // GET /booking/{reference}/payment/complete
    // Stripe redirects here after 3DS or bank redirect
    // ──────────────────────────────────────────────
    public function complete(Request $request): RedirectResponse
    {
        $reference      = $request->route('reference');
        $piId           = $request->query('payment_intent');
        $redirectStatus = $request->query('redirect_status');

        if (! $piId) {
            return redirect("/booking/{$reference}/payment")
                ->withErrors(['payment' => 'Payment could not be verified.']);
        }

        $pi      = $this->stripe->paymentIntents->retrieve($piId, ['expand' => ['payment_method']]);
        $payment = Payment::where('provider_reference', $piId)->first();

        if ($pi->status === 'succeeded') {
            if ($payment && $payment->status !== 'succeeded') {
                $payment->update([
                    'status'  => 'succeeded',
                    'paid_at' => now(),
                    'payload' => $pi->toArray(),
                ]);

                // Save payment method on the booking for future balance charge
                $pmId = is_string($pi->payment_method) ? $pi->payment_method : $pi->payment_method?->id;
                if ($pmId) {
                    $payment->booking->update(['stripe_payment_method_id' => $pmId]);
                }

                app(BookingTransitionService::class)->onPaymentSucceeded($payment->fresh(['booking']));
            }
            return redirect("/booking/{$reference}/confirmation");
        }

        if ($redirectStatus === 'failed' || $pi->status === 'requires_payment_method') {
            return redirect("/booking/{$reference}/payment")
                ->withErrors(['payment' => 'Your payment was declined. Please try a different payment method.']);
        }

        // Payment still processing — show confirmation and rely on webhook
        return redirect("/booking/{$reference}/confirmation");
    }

    // ──────────────────────────────────────────────
    // Signed balance payment link
    // ──────────────────────────────────────────────
    public function payBalance(Request $request): RedirectResponse
    {
        $booking = $request->route('booking');
        $pmId = $booking->stripe_payment_method_id;

        if (! $pmId) {
            return back()->withErrors(['payment' => 'No saved payment method on file.']);
        }

        $currency = strtolower($booking->tour?->currency ?? 'usd');
        $type     = 'balance';
        $iKey     = $booking->reference . '-balance-' . date('Ymd');

        try {
            $pi = $this->stripe->paymentIntents->create([
                'amount'         => $booking->balance_amount,
                'currency'       => $currency,
                'customer'       => $booking->stripe_customer_id,
                'payment_method' => $pmId,
                'confirm'        => true,
                'off_session'    => true,
                'description'    => "GokuSafiri balance #{$booking->reference}",
                'metadata'       => ['booking_reference' => $booking->reference, 'type' => $type],
            ], ['idempotency_key' => $iKey]);

            $payment = Payment::create([
                'booking_id'       => $booking->id,
                'type'             => $type,
                'provider'         => 'stripe',
                'provider_reference' => $pi->id,
                'amount'           => $booking->balance_amount,
                'currency'         => $currency,
                'status'           => $pi->status === 'succeeded' ? 'succeeded' : 'initiated',
                'idempotency_key'  => $iKey,
                'paid_at'          => $pi->status === 'succeeded' ? now() : null,
            ]);

            if ($pi->status === 'succeeded') {
                app(BookingTransitionService::class)->onPaymentSucceeded($payment->fresh(['booking']));
            }
        } catch (\Stripe\Exception\ApiErrorException $e) {
            return back()->withErrors(['payment' => $e->getMessage()]);
        }

        return redirect("/booking/{$booking->reference}/confirmation");
    }

    // ──────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────

    private function resolveStripeCustomer(Booking $booking): ?string
    {
        if ($booking->stripe_customer_id) {
            return $booking->stripe_customer_id;
        }

        if (! config('services.stripe.secret')) {
            return null;
        }

        $email = $booking->lead_email ?? $booking->user?->email;
        if (! $email) {
            return null;
        }

        $customer = $this->stripe->customers->create([
            'email'    => $email,
            'name'     => trim(($booking->lead_first_name ?? '') . ' ' . ($booking->lead_last_name ?? '')),
            'metadata' => ['booking_reference' => $booking->reference],
        ]);

        $booking->update(['stripe_customer_id' => $customer->id]);

        return $customer->id;
    }

    private function createPaymentIntent(Booking $booking, ?string $customerId): ?string
    {
        if (! config('services.stripe.secret')) {
            return null;
        }

        $isFull   = $booking->payment_plan === 'full';
        $amount   = $isFull ? $booking->total : $booking->deposit_amount;
        $type     = $isFull ? 'full' : 'deposit';
        $currency = strtolower($booking->tour?->currency ?? 'usd');
        $iKey     = $booking->reference . '-' . $type . '-' . date('YmdH');

        $params = [
            'amount'   => $amount,
            'currency' => $currency,
            'automatic_payment_methods' => ['enabled' => true],
            'description' => "GokuSafiri #{$booking->reference} ({$type})",
            'metadata'    => [
                'booking_reference' => $booking->reference,
                'type'              => $type,
            ],
        ];

        if ($customerId) {
            $params['customer'] = $customerId;
            // Save this payment method to the customer for balance auto-charge
            $params['setup_future_usage'] = 'off_session';
        }

        $pi = $this->stripe->paymentIntents->create($params, ['idempotency_key' => $iKey]);

        $booking->payments()->updateOrCreate(
            ['idempotency_key' => $iKey],
            [
                'type'               => $type,
                'provider'           => 'stripe',
                'provider_reference' => $pi->id,
                'amount'             => $amount,
                'currency'           => $currency,
                'status'             => 'initiated',
                'idempotency_key'    => $iKey,
            ]
        );

        return $pi->client_secret;
    }

    private function cancelInitiatedPayments(Booking $booking): void
    {
        $booking->payments()->where('status', 'initiated')->each(function (Payment $p) {
            try {
                $this->stripe->paymentIntents->cancel($p->provider_reference);
            } catch (\Throwable) {
            }
            $p->update(['status' => 'cancelled']);
        });
    }
}
