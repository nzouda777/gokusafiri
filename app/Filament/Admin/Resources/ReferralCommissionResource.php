<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\ReferralCommissionResource\Pages;
use App\Models\ReferralCommission;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

class ReferralCommissionResource extends Resource
{
    protected static ?string $model = ReferralCommission::class;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-gift';

    protected static string|\UnitEnum|null $navigationGroup = 'Marketing';

    protected static ?string $label = 'Referral Commission';

    protected static ?string $pluralLabel = 'Referral Commissions';

    protected static ?int $navigationSort = 3;

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::earned()->count() ?: null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('referrer.name')
                    ->label('Referrer')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('referrer.email')
                    ->label('Referrer email')
                    ->searchable()
                    ->copyable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('referredUser.name')
                    ->label('Referred client')
                    ->searchable(),
                Tables\Columns\TextColumn::make('booking.reference')
                    ->label('Booking')
                    ->searchable(),
                Tables\Columns\TextColumn::make('amount')
                    ->label('Commission')
                    ->money('USD', divideBy: 100)
                    ->sortable(),
                Tables\Columns\TextColumn::make('rate_percent')
                    ->label('Rate')
                    ->suffix('%')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'earned' => 'warning',
                        'paid' => 'success',
                        'cancelled' => 'gray',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Earned on')
                    ->dateTime('d M Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('paid_at')
                    ->label('Paid on')
                    ->dateTime('d M Y')
                    ->toggleable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'earned' => 'Earned (pending payout)',
                        'paid' => 'Paid',
                        'cancelled' => 'Cancelled',
                    ]),
            ])
            ->actions([
                Action::make('mark_paid')
                    ->label('Mark paid')
                    ->icon('heroicon-o-banknotes')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (ReferralCommission $record): bool => $record->status === 'earned')
                    ->action(function (ReferralCommission $record): void {
                        $record->update(['status' => 'paid', 'paid_at' => now()]);

                        Notification::make()
                            ->title('Commission marked as paid')
                            ->success()
                            ->send();
                    }),

                Action::make('cancel')
                    ->label('Cancel')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn (ReferralCommission $record): bool => $record->status === 'earned')
                    ->action(function (ReferralCommission $record): void {
                        $record->update(['status' => 'cancelled']);

                        Notification::make()
                            ->title('Commission cancelled')
                            ->success()
                            ->send();
                    }),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    BulkAction::make('mark_paid_bulk')
                        ->label('Mark selected as paid')
                        ->icon('heroicon-o-banknotes')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function (Collection $records): void {
                            $count = $records->where('status', 'earned')->each(
                                fn (ReferralCommission $record) => $record->update(['status' => 'paid', 'paid_at' => now()])
                            )->count();

                            Notification::make()
                                ->title("{$count} commissions marked as paid")
                                ->success()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListReferralCommissions::route('/'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
