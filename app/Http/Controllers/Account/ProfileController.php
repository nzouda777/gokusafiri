<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Account/Profile', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone ?? null,
                'country' => $user->country ?? null,
                'passport_number' => $user->passport_number ?? null,
                'passport_expiry' => $user->passport_expiry?->format('Y-m-d') ?? null,
                'nationality' => $user->nationality ?? null,
                'avatar' => $user->getFirstMediaUrl('avatar') ?: null,
                'tier' => $user->tier ?? 'Explorer',
                'member_since' => $user->created_at?->year,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'required|email|unique:users,email,' . $request->user()->id,
            'phone'      => 'nullable|string|max:30',
            'country'    => 'nullable|string|max:2',
        ]);

        $user = $request->user();
        $user->update([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'name'       => $request->first_name . ' ' . $request->last_name,
            'email'      => $request->email,
            'phone'      => $request->phone,
            'country'    => $request->country,
        ]);

        return back()->with('success', 'Profile updated.');
    }
}
