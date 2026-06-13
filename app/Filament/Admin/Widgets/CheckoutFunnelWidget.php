<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Booking;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class CheckoutFunnelWidget extends BaseWidget
{
    protected static ?int $sort = 2;
    protected ?string $pollingInterval = '60s';

    protected function getStats(): array
    {
        $pending = Booking::where('status', 'pending')->count();
        $depositPaid = Booking::where('status', 'deposit_paid')->count();
        $confirmed = Booking::where('status', 'confirmed')
            ->whereHas('schedule', fn ($q) => $q->where('starts_at', '>=', today()))
            ->count();

        $totalThisMonth = Booking::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $cancelledThisMonth = Booking::where('status', 'cancelled')
            ->whereMonth('updated_at', now()->month)
            ->whereYear('updated_at', now()->year)
            ->count();
        $cancelRate = $totalThisMonth > 0
            ? round(($cancelledThisMonth / $totalThisMonth) * 100)
            : 0;

        return [
            Stat::make('Awaiting Payment', $pending)
                ->description('Unpaid holds')
                ->color($pending > 10 ? 'warning' : 'gray')
                ->icon('heroicon-o-clock'),

            Stat::make('Deposit Received', $depositPaid)
                ->description('Balance remaining to collect')
                ->color($depositPaid > 0 ? 'info' : 'gray')
                ->icon('heroicon-o-currency-dollar'),

            Stat::make('Confirmed Departures (upcoming)', $confirmed)
                ->description('Planned trips')
                ->color('success')
                ->icon('heroicon-o-check-circle'),

            Stat::make('Cancellation Rate (month)', "{$cancelRate}%")
                ->description("{$cancelledThisMonth} cancelled / {$totalThisMonth} created")
                ->color($cancelRate > 15 ? 'danger' : ($cancelRate > 5 ? 'warning' : 'success'))
                ->icon('heroicon-o-x-circle'),
        ];
    }
}
