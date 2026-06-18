<?php

namespace App\Filament\Operator\Resources;

use App\Filament\Operator\Resources\TourResource\Pages;
use App\Models\Destination;
use App\Models\Tour;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Schemas;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class TourResource extends Resource
{
    protected static ?string $model = Tour::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-map';
    protected static ?string $label = 'Tour';
    protected static ?string $pluralLabel = 'Tours';

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Tabs::make()->columnSpanFull()->tabs([

                // ---- General ----
                Schemas\Components\Tabs\Tab::make('General')->schema([
                    Forms\Components\Select::make('type')
                        ->options(['tour' => 'Tour', 'package' => 'Package'])
                        ->required()
                        ->reactive(),
                    Forms\Components\Select::make('destination_id')
                        ->label('Destination')
                        ->options(Destination::pluck('slug', 'id'))
                        ->searchable()
                        ->required(),
                    Forms\Components\Select::make('style')
                        ->options([
                            'safari'    => 'Safari',
                            'beach'     => 'Beach',
                            'mountain'  => 'Mountain',
                            'culture'   => 'Culture',
                            'gorilla'   => 'Gorilla',
                            'honeymoon' => 'Honeymoon',
                        ])
                        ->required(),
                    Forms\Components\TextInput::make('duration_days')
                        ->label('Duration (days)')->numeric()->required(),
                    Forms\Components\TextInput::make('max_group_size')
                        ->label('Max Group Size')->numeric()->default(20),
                    Forms\Components\TextInput::make('base_price')
                        ->label('Adult Price (cents USD)')
                        ->numeric()->required(),
                    Forms\Components\TextInput::make('child_price')
                        ->label('Child Price under 12 (cents USD)')
                        ->numeric()->nullable()
                        ->helperText('Leave blank to use adult price. Infants are free.'),
                    Forms\Components\TextInput::make('cancellation_days')
                        ->label('Free Cancellation (days)')->numeric()->default(30),
                    // Package-only
                    Forms\Components\TextInput::make('discount_percent')
                        ->label('Discount (%)')
                        ->numeric()->nullable()
                        ->visible(fn (Forms\Get $get) => $get('type') === 'package'),
                    Forms\Components\Select::make('badge')
                        ->options(['bestseller' => 'Bestseller', 'new' => 'New'])
                        ->nullable(),
                ])->columns(2),

                // ---- Title & Description ----
                Schemas\Components\Tabs\Tab::make('Title & Description')->schema([
                    Forms\Components\TextInput::make('title.en')->label('Title (EN)')->required(),
                    Forms\Components\TextInput::make('title.fr')->label('Title (FR)'),
                    Forms\Components\TextInput::make('title.es')->label('Title (ES)'),
                    Forms\Components\Textarea::make('excerpt.en')->label('Excerpt (EN)'),
                    Forms\Components\Textarea::make('excerpt.fr')->label('Excerpt (FR)'),
                    Forms\Components\Textarea::make('excerpt.es')->label('Excerpt (ES)'),
                    Forms\Components\RichEditor::make('description.en')
                        ->label('Description (EN)')->columnSpanFull(),
                    Forms\Components\RichEditor::make('description.fr')
                        ->label('Description (FR)')->columnSpanFull(),
                    Forms\Components\RichEditor::make('description.es')
                        ->label('Description (ES)')->columnSpanFull(),
                ])->columns(3),

                // ---- Itinerary ----
                Schemas\Components\Tabs\Tab::make('Itinerary')->schema([
                    Forms\Components\Repeater::make('itinerary')
                        ->label('Days')
                        ->schema([
                            Forms\Components\TextInput::make('day')->numeric()->label('Day')->required(),
                            Forms\Components\TextInput::make('title.en')->label('Title (EN)')->required(),
                            Forms\Components\TextInput::make('title.fr')->label('Title (FR)'),
                            Forms\Components\Textarea::make('body.en')->label('Body (EN)'),
                            Forms\Components\Textarea::make('body.fr')->label('Body (FR)'),
                        ])
                        ->orderColumn('day')
                        ->columnSpanFull(),
                ]),

                // ---- Included / Excluded ----
                Schemas\Components\Tabs\Tab::make('Included / Excluded')->schema([
                    Forms\Components\Repeater::make('included')
                        ->label('Included')
                        ->schema([
                            Forms\Components\TextInput::make('en')->label('EN'),
                            Forms\Components\TextInput::make('fr')->label('FR'),
                        ]),
                    Forms\Components\Repeater::make('excluded')
                        ->label('Excluded')
                        ->schema([
                            Forms\Components\TextInput::make('en')->label('EN'),
                            Forms\Components\TextInput::make('fr')->label('FR'),
                        ]),
                ])->columns(2),

                // ---- Add-ons ----
                Schemas\Components\Tabs\Tab::make('Add-ons')->schema([
                    Forms\Components\Repeater::make('addons')
                        ->relationship()
                        ->label('Options')
                        ->schema([
                            Forms\Components\TextInput::make('label.en')->label('Label (EN)')->required(),
                            Forms\Components\TextInput::make('label.fr')->label('Label (FR)'),
                            Forms\Components\TextInput::make('price_per_person')
                                ->label('Price per person (cents)')
                                ->numeric()->required(),
                            Forms\Components\TextInput::make('position')->numeric()->default(0),
                        ])
                        ->orderColumn('position')
                        ->columnSpanFull(),
                ]),

                // ---- Location ----
                Schemas\Components\Tabs\Tab::make('Location')->schema([
                    Forms\Components\TextInput::make('lat')->label('Latitude')->numeric(),
                    Forms\Components\TextInput::make('lng')->label('Longitude')->numeric(),
                ])->columns(2),

                // ---- Publication ----
                Schemas\Components\Tabs\Tab::make('Publication')->schema([
                    Forms\Components\Select::make('status')
                        ->options([
                            'draft'     => 'Draft',
                            'in_review' => 'Submit for Review',
                        ])
                        ->required()
                        ->helperText('Operators can only submit for review. Publishing is reserved for admin.'),
                ]),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title.en')->label('Title')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('type')->badge()
                    ->color(fn ($state) => $state === 'package' ? 'info' : 'gray'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'published' => 'success',
                        'in_review' => 'warning',
                        default     => 'gray',
                    }),
                Tables\Columns\TextColumn::make('duration_days')->label('Duration'),
                Tables\Columns\TextColumn::make('base_price')
                    ->label('Price')
                    ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 2)),
                Tables\Columns\TextColumn::make('schedules_count')
                    ->counts('schedules')->label('Departures'),
            ])
            ->actions([
                \Filament\Actions\EditAction::make(),
                \Filament\Actions\DeleteAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery();
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListTours::route('/'),
            'create' => Pages\CreateTour::route('/create'),
            'edit'   => Pages\EditTour::route('/{record}/edit'),
        ];
    }
}
