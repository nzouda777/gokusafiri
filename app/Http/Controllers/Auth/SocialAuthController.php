<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback(): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName(),
                'first_name' => explode(' ', $googleUser->getName())[0] ?? '',
                'last_name' => implode(' ', array_slice(explode(' ', $googleUser->getName()), 1)) ?: '',
                'google_id' => $googleUser->getId(),
                'password' => bcrypt(str()->random(32)),
                'email_verified_at' => now(),
            ]
        );

        // Update avatar from Google
        if ($googleUser->getAvatar() && !$user->getFirstMedia('avatar')) {
            $user->addMediaFromUrl($googleUser->getAvatar())
                ->toMediaCollection('avatar');
        }

        Auth::login($user, true);

        return redirect('/account/trips');
    }
}
