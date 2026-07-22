<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\ReviewResource\Pages;
use App\Models\Review;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Schemas;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ReviewResource extends Resource
{
    protected static ?string $model = Review::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-star';
    protected static string|\UnitEnum|null $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 3;
    protected static ?string $label = 'Review';
    protected static ?string $pluralLabel = 'Reviews';

    public static function getNavigationBadge(): ?string
    {
        $pending = static::getModel()::where('is_approved', false)->count();

        return $pending > 0 ? (string) $pending : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Section::make()->schema([
                Forms\Components\Select::make('tour_id')
                    ->relationship('tour', 'slug')
                    ->searchable()
                    ->required()
                    ->label('Tour'),
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->nullable()
                    ->label('Linked user (optional)'),
                Forms\Components\TextInput::make('author_name')
                    ->label('Author name')
                    ->placeholder('Amara O.')
                    ->maxLength(100),
                Forms\Components\Select::make('rating')
                    ->options([1 => '1 ★', 2 => '2 ★★', 3 => '3 ★★★', 4 => '4 ★★★★', 5 => '5 ★★★★★'])
                    ->required()
                    ->default(5)
                    ->label('Rating'),
                Forms\Components\TextInput::make('location_label')
                    ->label('Location (e.g. Serengeti, 2026)')
                    ->maxLength(100),
                Forms\Components\DatePicker::make('traveled_at')
                    ->label('Travel Date'),
                Forms\Components\Toggle::make('is_approved')
                    ->label('Visible on tour page')
                    ->default(true),
                Forms\Components\Textarea::make('body')
                    ->label('Review text')
                    ->maxLength(2000)
                    ->columnSpanFull(),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('tour.title.en')
                    ->label('Tour')->searchable()->sortable()->limit(30),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('User')->searchable(),
                Tables\Columns\TextColumn::make('rating')
                    ->sortable()
                    ->formatStateUsing(fn ($state) => str_repeat('★', $state) . str_repeat('☆', 5 - $state)),
                Tables\Columns\TextColumn::make('body')
                    ->label('Comment')->limit(50)->wrap(),
                Tables\Columns\TextColumn::make('location_label')
                    ->label('Location')->toggleable(),
                Tables\Columns\IconColumn::make('is_approved')
                    ->boolean()->label('Approved'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_approved')->label('Approved'),
                Tables\Filters\SelectFilter::make('rating')
                    ->options([1 => '1★', 2 => '2★', 3 => '3★', 4 => '4★', 5 => '5★'])
                    ->label('Rating'),
            ])
            ->actions([
                \Filament\Actions\EditAction::make(),
                \Filament\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->visible(fn (Review $record) => ! $record->is_approved)
                    ->action(function (Review $record) {
                        $record->update(['is_approved' => true]);
                        Notification::make()->title('Review approved')->success()->send();
                    }),
                \Filament\Actions\Action::make('unapprove')
                    ->label('Hide')
                    ->icon('heroicon-o-eye-slash')
                    ->color('warning')
                    ->visible(fn (Review $record) => $record->is_approved)
                    ->action(function (Review $record) {
                        $record->update(['is_approved' => false]);
                        Notification::make()->title('Review hidden')->warning()->send();
                    }),
                \Filament\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                \Filament\Actions\BulkActionGroup::make([
                    \Filament\Actions\BulkAction::make('approve_all')
                        ->label('Approve Selected')
                        ->icon('heroicon-o-check')
                        ->color('success')
                        ->action(fn ($records) => $records->each->update(['is_approved' => true]))
                        ->deselectRecordsAfterCompletion(),
                    \Filament\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListReviews::route('/'),
            'create' => Pages\CreateReview::route('/create'),
            'edit'   => Pages\EditReview::route('/{record}/edit'),
        ];
    }
}
