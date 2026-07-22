<?php

namespace App\Filament\Admin\Resources\TourResource\RelationManagers;

use App\Models\Review;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class ReviewsRelationManager extends RelationManager
{
    protected static string $relationship = 'reviews';
    protected static ?string $title = 'Traveler Reviews';

    public function form(Schema $schema): Schema
    {
        return $schema->schema([
            Forms\Components\TextInput::make('author_name')
                ->label('Author name')
                ->placeholder('Amara O.')
                ->maxLength(100),
            Forms\Components\TextInput::make('location_label')
                ->label('Location (e.g. Serengeti, 2026)')
                ->maxLength(100),
            Forms\Components\Select::make('rating')
                ->options([1 => '1 ★', 2 => '2 ★★', 3 => '3 ★★★', 4 => '4 ★★★★', 5 => '5 ★★★★★'])
                ->required()
                ->default(5),
            Forms\Components\DatePicker::make('traveled_at')
                ->label('Travel date'),
            Forms\Components\Toggle::make('is_approved')
                ->label('Visible on tour page')
                ->default(true),
            Forms\Components\Textarea::make('body')
                ->label('Review text')
                ->rows(3)
                ->maxLength(2000)
                ->columnSpanFull(),
        ])->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('body')
            ->columns([
                Tables\Columns\TextColumn::make('author_name')
                    ->label('Author')
                    ->getStateUsing(fn (Review $record) => $record->author_name ?? $record->user?->name ?? ''),
                Tables\Columns\TextColumn::make('rating')
                    ->formatStateUsing(fn ($state) => str_repeat('★', $state))
                    ->color('warning'),
                Tables\Columns\TextColumn::make('body')->limit(60)->wrap(),
                Tables\Columns\TextColumn::make('location_label')->label('Location'),
                Tables\Columns\IconColumn::make('is_approved')
                    ->boolean()->label('Visible'),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->after(fn () => Notification::make()->title('Review created')->success()->send()),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('toggle_approve')
                    ->label(fn (Review $record) => $record->is_approved ? 'Hide' : 'Publish')
                    ->icon(fn (Review $record) => $record->is_approved ? 'heroicon-o-eye-slash' : 'heroicon-o-eye')
                    ->color(fn (Review $record) => $record->is_approved ? 'warning' : 'success')
                    ->action(fn (Review $record) => $record->update(['is_approved' => ! $record->is_approved])),
                Tables\Actions\DeleteAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
