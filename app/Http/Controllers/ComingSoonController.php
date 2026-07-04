<?php

namespace App\Http\Controllers;

use App\Models\ComingSoonSubscriber;
use App\Settings\GeneralSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComingSoonController extends Controller
{
    public function show(GeneralSettings $settings): Response|RedirectResponse
    {
        if (! $settings->coming_soon_enabled) {
            return redirect()->to('/');
        }

        return Inertia::render('ComingSoon', [
            'launch_date' => '2026-07-11T00:00:00+00:00',
        ]);
    }

    public function subscribe(Request $request): RedirectResponse
    {
        $request->validate(['email' => ['required', 'email', 'max:255']]);

        ComingSoonSubscriber::firstOrCreate(['email' => $request->email]);

        return back()->with('subscribed', true);
    }
}
