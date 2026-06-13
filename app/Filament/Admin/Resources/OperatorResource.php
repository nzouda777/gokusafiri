<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\OperatorResource\Pages;
use App\Models\Operator;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Schemas;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OperatorResource extends Resource
{
    protected static ?string $model = Operator::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-building-office-2';
    protected static string|\UnitEnum|null $navigationGroup = 'Users';
    protected static ?int $navigationSort = 2;
    protected static ?string $label = 'Operator';
    protected static ?string $pluralLabel = 'Operators';

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
            Schemas\Components\Section::make('Information')->schema([
                Forms\Components\TextInput::make('name')
                    ->required()->maxLength(255),
                Forms\Components\TextInput::make('slug')
                    ->disabled()->dehydrated(false)
                    ->helperText('Auto-generated from name.'),
                Forms\Components\TextInput::make('email')
                    ->email()->required()->unique(ignoreRecord: true),
                Forms\Components\TextInput::make('phone')->tel(),
                Forms\Components\Toggle::make('is_approved')
                    ->label('Approved')
                    ->helperText('Unapproved operators cannot publish tours.'),
            ])->columns(2),

            Schemas\Components\Section::make('Logo')->schema([
                Forms\Components\SpatieMediaLibraryFileUpload::make('logo')
                    ->collection('logo')
                    ->image()
                    ->imageResizeMode('cover')
                    ->imageCropAspectRatio('1:1')
                    ->maxSize(2048)
                    ->label('Logo (square recommended)'),
            ])->collapsed(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\SpatieMediaLibraryImageColumn::make('logo')
                    ->collection('logo')
                    ->circular()
                    ->label(''),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable()->copyable(),
                Tables\Columns\TextColumn::make('slug')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\IconColumn::make('is_approved')
                    ->boolean()
                    ->label('Approved')
                    ->trueColor('success')
                    ->falseColor('danger'),
                Tables\Columns\TextColumn::make('tours_count')
                    ->counts('tours')
                    ->label('Tours')
                    ->badge()->color('primary'),
                Tables\Columns\TextColumn::make('users_count')
                    ->counts('users')
                    ->label('Members')
                    ->badge()->color('gray'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_approved')->label('Approved'),
            ])
            ->actions([
                \Filament\Actions\EditAction::make(),
                \Filament\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (Operator $record) => ! $record->is_approved)
                    ->requiresConfirmation()
                    ->action(function (Operator $record) {
                        $record->update(['is_approved' => true]);
                        Notification::make()->title("Operator \"{$record->name}\" approved")->success()->send();
                    }),
                \Filament\Actions\Action::make('suspend')
                    ->label('Suspend')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->visible(fn (Operator $record) => $record->is_approved)
                    ->requiresConfirmation()
                    ->modalHeading('Suspend Operator')
                    ->modalDescription('Their tours will no longer be visible to the public.')
                    ->action(function (Operator $record) {
                        $record->update(['is_approved' => false]);
                        Notification::make()->title("Operator \"{$record->name}\" suspended")->warning()->send();
                    }),
                \Filament\Actions\DeleteAction::make()
                    ->visible(fn (Operator $record) => $record->tours()->count() === 0),
            ])
            ->bulkActions([
                \Filament\Actions\BulkActionGroup::make([
                    \Filament\Actions\BulkAction::make('approve_all')
                        ->label('Approve Selected')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->action(fn ($records) => $records->each->update(['is_approved' => true]))
                        ->deselectRecordsAfterCompletion(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListOperators::route('/'),
            'create' => Pages\CreateOperator::route('/create'),
            'edit'   => Pages\EditOperator::route('/{record}/edit'),
        ];
    }
}
