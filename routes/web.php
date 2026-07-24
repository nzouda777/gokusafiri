<?php

use App\Http\Controllers\Account\ProfileController;
use App\Http\Controllers\Account\ReferralsController;
use App\Http\Controllers\Account\SavedController;
use App\Http\Controllers\Account\TripsController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\Booking\BookingController;
use App\Http\Controllers\Booking\BookingDatesController;
use App\Http\Controllers\Booking\BookingPaymentController;
use App\Http\Controllers\Booking\BookingTravelersController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ComingSoonController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PagesController;
use App\Http\Controllers\Payment\FakePayController;
use App\Http\Controllers\Payment\WebhookController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TourIndexController;
use App\Http\Controllers\TourShowController;
use App\Http\Controllers\WishlistController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public app routes  closure used twice:
|  1. With explicit locale prefix  : /en/tours, /fr/tours, /es/tours
|  2. Without locale prefix        : /tours (fallback, unnamed to avoid conflicts)
|--------------------------------------------------------------------------
*/

$appRoutes = function (bool $named) {
    $n = fn (string $name) => $named ? fn ($r) => $r->name($name) : fn ($r) => $r;

    // Home
    $r = Route::get('/', [HomeController::class, 'index']);
    if ($named) {
        $r->name('home');
    }

    // Tours
    $r = Route::get('/tours', [TourIndexController::class, 'index']);
    if ($named) {
        $r->name('tours.index');
    }

    // Packages
    $r = Route::get('/packages', [TourIndexController::class, 'packages']);
    if ($named) {
        $r->name('packages.index');
    }

    // Tour detail
    $r = Route::get('/tours/{slug}', [TourShowController::class, 'show']);
    if ($named) {
        $r->name('tours.show');
    }

    // Package detail
    $r = Route::get('/packages/{slug}', [TourShowController::class, 'show']);
    if ($named) {
        $r->name('packages.show');
    }

    // Tour reviews
    $r = Route::post('/tours/{slug}/reviews', [ReviewController::class, 'store'])
        ->middleware('auth');
    if ($named) {
        $r->name('reviews.store');
    }

    // Search
    $r = Route::get('/search', [SearchController::class, 'index']);
    if ($named) {
        $r->name('search');
    }

    // Wishlist
    $r = Route::post('/wishlist/{tour}', [WishlistController::class, 'toggle'])
        ->middleware('auth');
    if ($named) {
        $r->name('wishlist.toggle');
    }

    // Booking wizard
    $r = Route::post('/booking/start', [BookingController::class, 'start']);
    if ($named) {
        $r->name('booking.start');
    }

    $r = Route::get('/booking/{reference}/dates', [BookingDatesController::class, 'show']);
    if ($named) {
        $r->name('booking.dates');
    }
    Route::post('/booking/{reference}/dates', [BookingDatesController::class, 'update']);

    $r = Route::get('/booking/{reference}/travelers', [BookingTravelersController::class, 'show']);
    if ($named) {
        $r->name('booking.travelers');
    }
    Route::post('/booking/{reference}/travelers', [BookingTravelersController::class, 'update']);

    $r = Route::get('/booking/{reference}/payment', [BookingPaymentController::class, 'show']);
    if ($named) {
        $r->name('booking.payment');
    }

    // Switch deposit ↔ full  returns new client_secret as JSON
    Route::post('/booking/{reference}/payment/plan', [BookingPaymentController::class, 'updatePlan']);

    // Stripe redirects here after 3DS / bank auth
    $r = Route::get('/booking/{reference}/payment/complete', [BookingPaymentController::class, 'complete']);
    if ($named) {
        $r->name('booking.payment.complete');
    }

    $r = Route::get('/booking/{reference}/confirmation', [BookingController::class, 'confirmation']);
    if ($named) {
        $r->name('booking.confirmation');
    }

    $r = Route::get('/booking/{reference}/itinerary.pdf', [BookingController::class, 'itineraryPdf']);
    if ($named) {
        $r->name('booking.itinerary.pdf');
    }

    // Signed balance payment URL
    $r = Route::get('/booking/{booking}/pay-balance', [BookingPaymentController::class, 'payBalance'])
        ->middleware('signed');
    if ($named) {
        $r->name('booking.balance.pay');
    }

    // Static pages
    $r = Route::get('/about', [PagesController::class, 'about']);
    if ($named) {
        $r->name('about');
    }

    $r = Route::get('/guides', [PagesController::class, 'guides']);
    if ($named) {
        $r->name('guides');
    }

    $r = Route::get('/sustainability', [PagesController::class, 'sustainability']);
    if ($named) {
        $r->name('sustainability');
    }

    $r = Route::get('/careers', [PagesController::class, 'careers']);
    if ($named) {
        $r->name('careers');
    }

    $r = Route::get('/help', [PagesController::class, 'help']);
    if ($named) {
        $r->name('help');
    }

    $r = Route::get('/contact', [PagesController::class, 'contact']);
    if ($named) {
        $r->name('contact');
    }

    $r = Route::post('/contact', [ContactController::class, 'store'])
        ->middleware('throttle:5,10');
    if ($named) {
        $r->name('contact.store');
    }

    $r = Route::get('/cancellation-policy', [PagesController::class, 'cancellationPolicy']);
    if ($named) {
        $r->name('cancellation-policy');
    }

    $r = Route::get('/travel-insurance', [PagesController::class, 'insurance']);
    if ($named) {
        $r->name('insurance');
    }

    $r = Route::get('/privacy', [PagesController::class, 'privacy']);
    if ($named) {
        $r->name('privacy');
    }

    $r = Route::get('/terms', [PagesController::class, 'terms']);
    if ($named) {
        $r->name('terms');
    }

    $r = Route::get('/cookies', [PagesController::class, 'cookies']);
    if ($named) {
        $r->name('cookies');
    }

    $r = Route::get('/faq', [PagesController::class, 'faq']);
    if ($named) {
        $r->name('faq');
    }

    $r = Route::get('/gallery', [PagesController::class, 'gallery']);
    if ($named) {
        $r->name('gallery');
    }

    // Auth account
    Route::middleware('auth')->prefix('account')
        ->name($named ? 'account.' : '')
        ->group(function () use ($named) {
            $r = Route::get('/trips', [TripsController::class, 'index']);
            if ($named) {
                $r->name('trips');
            }

            $r = Route::get('/saved', [SavedController::class, 'index']);
            if ($named) {
                $r->name('saved');
            }

            $r = Route::get('/profile', [ProfileController::class, 'index']);
            if ($named) {
                $r->name('profile');
            }

            $r = Route::put('/profile', [ProfileController::class, 'update']);
            if ($named) {
                $r->name('profile.update');
            }

            $r = Route::post('/trips/{reference}/cancel', [TripsController::class, 'cancel']);
            if ($named) {
                $r->name('trips.cancel');
            }

            $r = Route::get('/referrals', [ReferralsController::class, 'index']);
            if ($named) {
                $r->name('referrals');
            }
        });
};

/*
|--------------------------------------------------------------------------
| 1) With explicit locale prefix  named routes
|--------------------------------------------------------------------------
*/
Route::prefix('{locale}')
    ->where(['locale' => 'en|fr|es'])
    ->middleware(['web', 'setlocale'])
    ->group(fn () => $appRoutes(true));

/*
|--------------------------------------------------------------------------
| 2) Without locale prefix  fallback (unnamed, inherits locale from session)
|--------------------------------------------------------------------------
*/
Route::middleware(['web', 'setlocale'])
    ->group(fn () => $appRoutes(false));

/*
|--------------------------------------------------------------------------
| Auth
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'show'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
    Route::get('/register', [RegisterController::class, 'show'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
    Route::get('/forgot-password', [ForgotPasswordController::class, 'show'])->name('password.request');
    Route::post('/forgot-password', [ForgotPasswordController::class, 'send'])->name('password.email');
    Route::get('/reset-password/{token}', [ResetPasswordController::class, 'show'])->name('password.reset');
    Route::post('/reset-password', [ResetPasswordController::class, 'update'])->name('password.update');
    Route::get('/auth/google', [SocialAuthController::class, 'redirectToGoogle'])->name('auth.google');
    Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
});

/*
|--------------------------------------------------------------------------
| Payments & webhooks
|--------------------------------------------------------------------------
*/
Route::get('/fake-pay/{payment}', [FakePayController::class, 'show'])->name('fake-pay.show');
Route::post('/fake-pay/{payment}', [FakePayController::class, 'process'])->name('fake-pay.process');

/*
|--------------------------------------------------------------------------
| AI chat assistant
|--------------------------------------------------------------------------
*/
Route::post('/chat', [ChatController::class, 'store'])
    ->middleware(['web', 'setlocale', 'throttle:20,1'])
    ->name('chat.store');

Route::post('/webhooks/payment/{provider}', [WebhookController::class, 'handle'])
    ->withoutMiddleware([VerifyCsrfToken::class])
    ->name('webhooks.payment');

/*
|--------------------------------------------------------------------------
| Coming Soon
|--------------------------------------------------------------------------
*/
Route::get('/coming-soon', [ComingSoonController::class, 'show'])->name('coming-soon');
Route::post('/coming-soon/subscribe', [ComingSoonController::class, 'subscribe'])->name('coming-soon.subscribe');
