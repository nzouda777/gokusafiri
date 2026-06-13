<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Review;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class PendingReviewsWidget extends BaseWidget
{
    protected static ?int $sort = 3;
    protected ?string $pollingInterval = '60s';
    protected int|string|array $columnSpan = 'full';

    protected function getStats(): array
    {
        $pending    = Review::where('is_approved', false)->count();
        $thisMonth  = Review::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count();
        $avgRating  = Review::where('is_approved', true)->avg('rating') ?? 0;
        $approved   = Review::where('is_approved', true)->count();

        return [
            Stat::make('Pending Moderation', $pending)
                ->description('Reviews awaiting approval')
                ->icon('heroicon-o-clock')
                ->color($pending > 5 ? 'warning' : 'success')
                ->url(route('filament.admin.resources.reviews.index')),

            Stat::make('Reviews This Month', $thisMonth)
                ->description($approved . ' approved in total')
                ->icon('heroicon-o-chat-bubble-left-right')
                ->color('primary'),

            Stat::make('Average Rating', number_format($avgRating, 1) . ' / 5')
                ->description('Across all approved reviews')
                ->icon('heroicon-o-star')
                ->color($avgRating >= 4.0 ? 'success' : ($avgRating >= 3.0 ? 'warning' : 'danger')),
        ];
    }
}
