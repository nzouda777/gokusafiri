<?php

namespace App\Filament\Operator\Resources;

use App\Filament\Operator\Resources\TourScheduleResource\Pages;
use App\Models\TourSchedule;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TourScheduleResource extends Resource
{
    protected static ?string $model = TourSchedule::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-calendar';
    protected static ?string $label = 'Departure';
    protected static ?string $pluralLabel = 'Departures';

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([
            Forms\Components\Select::make('tour_id')
                ->relationship('tour', 'slug')
                ->searchable()
                ->required()
                ->label('Tour'),
            Forms\Components\DatePicker::make('starts_at')
                ->label('Start Date')->required(),
            Forms\Components\DatePicker::make('ends_at')
                ->label('End Date')->required(),
            Forms\Components\TextInput::make('capacity')
                ->label('Capacity')->numeric()->required(),
            Forms\Components\TextInput::make('seats_left')
                ->label('Seats Available')->numeric()->required(),
            Forms\Components\TextInput::make('price_override')
                ->label('Price Override (cents)')
                ->numeric()->nullable(),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('tour.title.en')
                    ->label('Tour')->searchable(),
                Tables\Columns\TextColumn::make('starts_at')
                    ->label('Start Date')->date()->sortable(),
                Tables\Columns\TextColumn::make('ends_at')
                    ->label('End Date')->date(),
                Tables\Columns\TextColumn::make('capacity')
                    ->label('Capacity'),
                Tables\Columns\TextColumn::make('seats_left')
                    ->label('Seats Available')
                    ->color(fn ($state) => $state <= 5 ? 'danger' : 'success'),
                Tables\Columns\TextColumn::make('price_override')
                    ->label('Price Override')
                    ->formatStateUsing(fn ($state) => $state ? '$' . number_format($state / 100, 2) : ''),
            ])
            ->filters([
                Tables\Filters\Filter::make('upcoming')
                    ->label('Upcoming')
                    ->query(fn ($query) => $query->where('starts_at', '>=', now())),
            ])
            ->actions([
                \Filament\Actions\EditAction::make(),
                \Filament\Actions\DeleteAction::make(),
            ])
            ->defaultSort('starts_at');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListTourSchedules::route('/'),
            'create' => Pages\CreateTourSchedule::route('/create'),
            'edit'   => Pages\EditTourSchedule::route('/{record}/edit'),
        ];
    }
}
