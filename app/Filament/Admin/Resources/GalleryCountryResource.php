<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\GalleryCountryResource\Pages;
use App\Models\GalleryCountry;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class GalleryCountryResource extends Resource
{
    protected static ?string $model = GalleryCountry::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-globe-europe-africa';
    protected static string|\UnitEnum|null $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 6;
    protected static ?string $label = 'Gallery Country';
    protected static ?string $pluralLabel = 'Gallery Countries';

    /**
     * Translated name fields, shared with the inline "create country" form of the gallery item select.
     */
    public static function nameFields(): array
    {
        return [
            Schemas\Components\Tabs::make()->tabs([
                Schemas\Components\Tabs\Tab::make('🇬🇧 EN')->schema([
                    Forms\Components\TextInput::make('name.en')->label('Name (EN)')->required()->maxLength(80),
                ]),
                Schemas\Components\Tabs\Tab::make('🇫🇷 FR')->schema([
                    Forms\Components\TextInput::make('name.fr')->label('Nom (FR)')->maxLength(80),
                ]),
                Schemas\Components\Tabs\Tab::make('🇪🇸 ES')->schema([
                    Forms\Components\TextInput::make('name.es')->label('Nombre (ES)')->maxLength(80),
                ]),
            ])->columnSpanFull(),
        ];
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Section::make('Country name (Translations)')
                ->description('Shown as a tab on the public gallery page. If FR or ES is left empty, the English name is used.')
                ->schema(self::nameFields()),

            Forms\Components\TextInput::make('slug')
                ->label('URL slug')
                ->disabled()
                ->dehydrated(false)
                ->helperText('Generated from the English name. Used in links like /gallery?country=uganda.')
                ->visible(fn (string $operation): bool => $operation === 'edit'),

            Forms\Components\Toggle::make('is_active')
                ->label('Active')
                ->default(true)
                ->helperText('When disabled, this country\'s tab and all its media are hidden from the public gallery.'),

            Forms\Components\Hidden::make('position')
                ->default(fn () => ((int) GalleryCountry::max('position')) + 1),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Country')
                    ->getStateUsing(fn (GalleryCountry $record) => $record->getTranslation('name', 'en')),
                Tables\Columns\TextColumn::make('slug')->color('gray'),
                Tables\Columns\TextColumn::make('items_count')
                    ->counts('items')
                    ->label('Media')
                    ->badge(),
                Tables\Columns\IconColumn::make('is_active')->boolean()->label('Active'),
            ])
            ->reorderable('position')
            ->defaultSort('position')
            ->actions([
                \Filament\Actions\EditAction::make(),
                // Media must be moved to another country (or deleted) first.
                \Filament\Actions\DeleteAction::make()
                    ->hidden(fn (GalleryCountry $record) => $record->items()->exists()),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListGalleryCountries::route('/'),
            'create' => Pages\CreateGalleryCountry::route('/create'),
            'edit'   => Pages\EditGalleryCountry::route('/{record}/edit'),
        ];
    }
}
