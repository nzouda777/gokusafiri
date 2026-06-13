<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\DestinationResource\Pages;
use App\Models\Destination;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class DestinationResource extends Resource
{
    protected static ?string $model = Destination::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-globe-alt';
    protected static string|\UnitEnum|null $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 3;
    protected static ?string $label = 'Destination';
    protected static ?string $pluralLabel = 'Destinations';

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Section::make('Geographic Information')->schema([
                Forms\Components\TextInput::make('country')
                    ->label('Country Code (ISO 2)')
                    ->maxLength(2)->required()
                    ->hint('e.g. TZ, KE, ZA, UG, RW'),
                Forms\Components\Select::make('region')
                    ->options([
                        'east'    => 'East Africa',
                        'southern' => 'Southern Africa',
                        'north'   => 'North Africa',
                        'west'    => 'West Africa',
                        'central' => 'Central Africa',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('slug')
                    ->disabled()->dehydrated(false)
                    ->helperText('Auto-generated from English name.')
                    ->visibleOn('edit'),
            ])->columns(3),

            Schemas\Components\Section::make('Name (Translations)')->schema([
                Schemas\Components\Tabs::make()->tabs([
                    Schemas\Components\Tabs\Tab::make('English')->schema([
                        Forms\Components\TextInput::make('name.en')
                            ->label('Name (EN)')->required()->maxLength(100),
                    ]),
                    Schemas\Components\Tabs\Tab::make('Français')->schema([
                        Forms\Components\TextInput::make('name.fr')
                            ->label('Nom (FR)')->maxLength(100),
                    ]),
                    Schemas\Components\Tabs\Tab::make('Español')->schema([
                        Forms\Components\TextInput::make('name.es')
                            ->label('Nombre (ES)')->maxLength(100),
                    ]),
                ])->columnSpanFull(),
            ]),

            Schemas\Components\Section::make('Cover Image')->schema([
                Forms\Components\SpatieMediaLibraryFileUpload::make('image')
                    ->collection('image')
                    ->image()
                    ->imageResizeMode('cover')
                    ->imageCropAspectRatio('16:9')
                    ->maxSize(5120)
                    ->label('Cover Image (16:9 recommended)'),
            ])->collapsed(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\SpatieMediaLibraryImageColumn::make('image')
                    ->collection('image')
                    ->label('')->width(64)->height(44),
                Tables\Columns\TextColumn::make('name')
                    ->label('Name')
                    ->getStateUsing(fn (Destination $record) => $record->getTranslation('name', 'en'))
                    ->searchable(query: fn ($query, string $search) =>
                        $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(name, '$.en')) LIKE ?", ["%{$search}%"]))
                    ->sortable(query: fn ($query, string $direction) =>
                        $query->orderByRaw("JSON_UNQUOTE(JSON_EXTRACT(name, '$.en')) {$direction}"))
                    ->weight(\Filament\Support\Enums\FontWeight::Medium),
                Tables\Columns\TextColumn::make('country')
                    ->sortable()->badge()->color('gray'),
                Tables\Columns\TextColumn::make('region')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'east'    => 'East Africa',
                        'southern' => 'Southern Africa',
                        'north'   => 'North Africa',
                        'west'    => 'West Africa',
                        'central' => 'Central Africa',
                        default   => ucfirst((string) $state),
                    })
                    ->color(fn ($state) => match ($state) {
                        'east'    => 'success',
                        'southern' => 'info',
                        'north'   => 'warning',
                        default   => 'gray',
                    }),
                Tables\Columns\TextColumn::make('tours_count')
                    ->counts('tours')->label('Tours')
                    ->badge()->color('primary'),
                Tables\Columns\TextColumn::make('slug')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('region')
                    ->options([
                        'east'    => 'East Africa',
                        'southern' => 'Southern Africa',
                        'north'   => 'North Africa',
                        'west'    => 'West Africa',
                        'central' => 'Central Africa',
                    ]),
            ])
            ->actions([
                \Filament\Actions\EditAction::make(),
                \Filament\Actions\DeleteAction::make()
                    ->visible(fn (Destination $record) => $record->tours()->count() === 0),
            ])
            ->defaultSort('name');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListDestinations::route('/'),
            'create' => Pages\CreateDestination::route('/create'),
            'edit'   => Pages\EditDestination::route('/{record}/edit'),
        ];
    }
}
