<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class GeneralSettings extends Settings
{
    public int $tax_fee_percent = 0;

    public int $deposit_percent = 20;

    public int $tier_discount_percent = 5;

    public array $active_locales = ['en', 'fr', 'es'];

    public string $payment_driver = 'fake';

    public string $google_maps_api_key = '';

    public int $platform_commission_percent = 0;

    public bool $coming_soon_enabled = false;

    public static function group(): string
    {
        return 'general';
    }
}
