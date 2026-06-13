<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class FakePayController extends Controller
{
    public function show(Payment $payment): View
    {
        return view('fake-pay', ['payment' => $payment]);
    }

    public function process(Request $request, Payment $payment): RedirectResponse
    {
        $status = $request->input('action') === 'succeed' ? 'succeeded' : 'failed';

        // Appel au webhook interne pour garder le même flux que les vrais providers
        $request->merge([
            'provider_reference' => $payment->provider_reference,
            'status' => $status,
        ]);

        app(WebhookController::class)->handle($request, 'fake');

        return redirect()->route('booking.confirmation', $payment->booking->reference);
    }
}
