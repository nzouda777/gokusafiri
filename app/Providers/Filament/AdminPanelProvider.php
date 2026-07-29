<?php

namespace App\Providers\Filament;

use App\Filament\Admin\Pages\Dashboard;
use App\Filament\Admin\Pages\SettingsPage;
use App\Filament\Admin\Resources\BookingResource;
use App\Filament\Admin\Resources\ComingSoonSubscriberResource;
use App\Filament\Admin\Resources\ContactMessageResource;
use App\Filament\Admin\Resources\DestinationResource;
use App\Filament\Admin\Resources\EmailAutomationResource;
use App\Filament\Admin\Resources\EmailFlowResource;
use App\Filament\Admin\Resources\FaqResource;
use App\Filament\Admin\Resources\GalleryResource;
use App\Filament\Admin\Resources\OperatorResource;
use App\Filament\Admin\Resources\PackageResource;
use App\Filament\Admin\Resources\PaymentResource;
use App\Filament\Admin\Resources\ReferralCommissionResource;
use App\Filament\Admin\Resources\ReviewResource;
use App\Filament\Admin\Resources\RoleResource;
use App\Filament\Admin\Resources\TourResource as AdminTourResource;
use App\Filament\Admin\Resources\UserResource;
use App\Filament\Admin\Widgets\BookingsPerDayWidget;
use App\Filament\Admin\Widgets\CheckoutFunnelWidget;
use App\Filament\Admin\Widgets\PendingReviewsWidget;
use App\Filament\Admin\Widgets\PlatformStatsWidget;
use App\Filament\Admin\Widgets\RecentBookingsWidget;
use App\Filament\Admin\Widgets\RevenueChartWidget;
use App\Filament\Admin\Widgets\TopToursWidget;
use App\Filament\Admin\Widgets\UpcomingDeparturesWidget;
use App\Http\Middleware\EnsureAdminRole;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationGroup;
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

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('admin')
            ->path('admin')
            ->login()
            ->colors(['primary' => Color::Emerald])
            ->brandName('GoKuSafiri  Admin')
            ->authGuard('web')
            ->authMiddleware([
                Authenticate::class,
                EnsureAdminRole::class,
            ])
            ->resources([
                BookingResource::class,
                PaymentResource::class,
                AdminTourResource::class,
                PackageResource::class,
                DestinationResource::class,
                ReviewResource::class,
                FaqResource::class,
                GalleryResource::class,
                UserResource::class,
                OperatorResource::class,
                RoleResource::class,
                ComingSoonSubscriberResource::class,
                ContactMessageResource::class,
                ReferralCommissionResource::class,
                EmailFlowResource::class,
                EmailAutomationResource::class,
            ])
            ->pages([
                Dashboard::class,
                SettingsPage::class,
            ])
            ->widgets([
                PlatformStatsWidget::class,
                BookingsPerDayWidget::class,
                CheckoutFunnelWidget::class,
                PendingReviewsWidget::class,
                RevenueChartWidget::class,
                UpcomingDeparturesWidget::class,
                RecentBookingsWidget::class,
                TopToursWidget::class,
            ])
            ->navigationGroups([
                NavigationGroup::make('Bookings')->icon('heroicon-o-calendar-days'),
                NavigationGroup::make('Catalog')->icon('heroicon-o-map'),
                NavigationGroup::make('Users')->icon('heroicon-o-users'),
                NavigationGroup::make('Marketing')->icon('heroicon-o-megaphone'),
            ])
            ->sidebarCollapsibleOnDesktop()
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
            ]);
    }
}
