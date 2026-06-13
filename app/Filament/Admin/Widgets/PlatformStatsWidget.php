<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Booking;
use App\Models\Operator;
use App\Models\Payment;
use App\Models\Tour;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class PlatformStatsWidget extends BaseWidget
{
    protected static ?int $sort = 0;
    protected ?string $pollingInterval = '60s';
    protected int|string|array $columnSpan = 'full';

    protected function getStats(): array
    {
        $totalRevenue = Payment::where('status', 'succeeded')->sum('amount');
        $monthRevenue = Payment::where('status', 'succeeded')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        $activeBookings = Booking::whereNotIn('status', ['expired', 'cancelled'])->count();
        $todayBookings  = Booking::whereDate('created_at', today())->count();

        $totalUsers = User::count();
        $newUsersMonth = User::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $publishedTours = Tour::where('status', 'published')->count();
        $totalTours     = Tour::count();

        $pendingOperators = Operator::where('is_approved', false)->count();

        return [
            Stat::make('Total Revenue', '$' . number_format($totalRevenue / 100, 0))
                ->description('$' . number_format($monthRevenue / 100, 0) . ' this month')
                ->icon('heroicon-o-banknotes')
                ->color('success'),

            Stat::make('Active Bookings', number_format($activeBookings))
                ->description($todayBookings . ' new today')
                ->icon('heroicon-o-calendar-days')
                ->color('primary'),

            Stat::make('Registered Users', number_format($totalUsers))
                ->description('+' . $newUsersMonth . ' this month')
                ->icon('heroicon-o-users')
                ->color('info'),

            Stat::make('Tours Published', $publishedTours . ' / ' . $totalTours)
                ->description($pendingOperators > 0 ? $pendingOperators . ' operator(s) pending approval' : 'All operators approved')
                ->icon('heroicon-o-map')
                ->color($pendingOperators > 0 ? 'warning' : 'success'),
        ];
    }
}
