<?php

use App\Providers\AppServiceProvider;
use App\Providers\Filament\AdminPanelProvider;
use App\Providers\Filament\OperatorPanelProvider;

return [
    AppServiceProvider::class,
    AdminPanelProvider::class,
    OperatorPanelProvider::class,
];
