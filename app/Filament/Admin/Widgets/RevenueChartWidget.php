<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Booking;
use App\Models\Payment;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class RevenueChartWidget extends ChartWidget
{
    protected ?string $heading = 'Monthly Revenue — Last 12 Months';
    protected ?string $description = 'Total succeeded payments per calendar month (USD)';
    protected static ?int $sort = 4;
    protected int|string|array $columnSpan = 'full';
    protected ?string $maxHeight = '280px';

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $months = collect(range(11, 0))->map(fn (int $i) => now()->startOfMonth()->subMonths($i));

        $revenue = $months->map(fn (Carbon $m) => round(
            Payment::where('status', 'succeeded')
                ->whereYear('paid_at', $m->year)
                ->whereMonth('paid_at', $m->month)
                ->sum('amount') / 100,
            2
        ));

        $bookings = $months->map(fn (Carbon $m) => Booking::whereYear('created_at', $m->year)
            ->whereMonth('created_at', $m->month)
            ->count()
        );

        return [
            'datasets' => [
                [
                    'label'           => 'Revenue ($)',
                    'data'            => $revenue->values()->toArray(),
                    'backgroundColor' => '#10b981',
                    'borderColor'     => '#059669',
                    'borderWidth'     => 1,
                    'yAxisID'         => 'y',
                ],
                [
                    'label'           => 'Bookings',
                    'data'            => $bookings->values()->toArray(),
                    'backgroundColor' => '#6366f1',
                    'borderColor'     => '#4f46e5',
                    'borderWidth'     => 1,
                    'type'            => 'line',
                    'yAxisID'         => 'y1',
                    'tension'         => 0.4,
                    'fill'            => false,
                ],
            ],
            'labels' => $months->map(fn (Carbon $m) => $m->format('M Y'))->toArray(),
        ];
    }

    protected function getOptions(): array
    {
        return [
            'scales' => [
                'y'  => ['position' => 'left',  'title' => ['display' => true, 'text' => 'Revenue ($)']],
                'y1' => ['position' => 'right', 'title' => ['display' => true, 'text' => 'Bookings'], 'grid' => ['drawOnChartArea' => false]],
            ],
        ];
    }
}
