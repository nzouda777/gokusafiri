<?php

namespace App\Providers\Filament;

use App\Filament\Operator\Pages\Dashboard;
use App\Filament\Operator\Resources\BookingResource;
use App\Filament\Operator\Resources\TourResource;
use App\Filament\Operator\Resources\TourScheduleResource;
use App\Filament\Operator\Widgets\OperatorRecentBookingsWidget;
use App\Filament\Operator\Widgets\OperatorRevenueWidget;
use App\Filament\Operator\Widgets\OperatorStatsWidget;
use App\Filament\Operator\Widgets\OperatorUpcomingDeparturesWidget;
use App\Http\Middleware\EnsureOperatorRole;
use App\Models\Operator;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\AuthenticateSession;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class OperatorPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('operator')
            ->path('operator')
            ->login()
            ->colors(['primary' => Color::Teal])
            ->brandName('GoKuSafiri Operator')
            ->authGuard('web')
            ->tenant(Operator::class, slugAttribute: 'slug')
            ->tenantMenuItems([])
            ->pages([
                Dashboard::class,
            ])
            ->resources([
                TourResource::class,
                TourScheduleResource::class,
                BookingResource::class,
            ])
            ->widgets([
                OperatorStatsWidget::class,
                OperatorRevenueWidget::class,
                OperatorUpcomingDeparturesWidget::class,
                OperatorRecentBookingsWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
                EnsureOperatorRole::class,
            ]);
    }
}
