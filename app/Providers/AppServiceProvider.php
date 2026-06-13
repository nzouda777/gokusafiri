<?php

namespace App\Providers;

use App\Models\Review;
use App\Observers\ReviewObserver;
use App\Services\BookingPriceCalculator;
use App\Services\BookingTransitionService;
use App\Services\Payment\PaymentManager;
use App\Settings\GeneralSettings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PaymentManager::class, function ($app) {
            return new PaymentManager($app);
        });

        $this->app->singleton(BookingTransitionService::class);

        $this->app->singleton(BookingPriceCalculator::class, function ($app) {
            $settings = $app->make(GeneralSettings::class);

            return new BookingPriceCalculator(
                taxFeePercent: $settings->tax_fee_percent,
                depositPercent: $settings->deposit_percent,
            );
        });
    }

    public function boot(): void
    {
        Model::shouldBeStrict(! app()->isProduction());

        Review::observe(ReviewObserver::class);
    }
}
