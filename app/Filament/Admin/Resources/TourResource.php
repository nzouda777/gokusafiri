<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\TourResource\Pages;
use App\Filament\Admin\Resources\TourResource\RelationManagers\ReviewsRelationManager;
use App\Models\Tour;
use Filament\Forms;
use Filament\Infolists;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class TourResource extends Resource
{
    protected static ?string $model = Tour::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-map';
    protected static string|\UnitEnum|null $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 1;
    protected static ?string $label = 'Tour';
    protected static ?string $pluralLabel = 'Tours';

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with('destination');
    }

    public static function getNavigationBadge(): ?string
    {
        $inReview = static::getModel()::where('status', 'in_review')->count();

        return $inReview > 0 ? (string) $inReview : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function buildForm(Schema $schema, string $defaultType = 'tour'): Schema
    {
        return $schema->schema([

            Schemas\Components\Section::make('Basic Information')->schema([
                Schemas\Components\Tabs::make('Translations')->tabs([
                    Schemas\Components\Tabs\Tab::make('English')->schema([
                        Forms\Components\TextInput::make('title.en')
                            ->label('Title (EN)')->required()->maxLength(200),
                        Forms\Components\Textarea::make('excerpt.en')
                            ->label('Short Excerpt (EN)')->required()->rows(2)->maxLength(15000),
                    ]),
                    Schemas\Components\Tabs\Tab::make('Français')->schema([
                        Forms\Components\TextInput::make('title.fr')
                            ->label('Titre (FR)')->required()->maxLength(200),
                        Forms\Components\Textarea::make('excerpt.fr')
                            ->label('Extrait (FR)')->required()->rows(2)->maxLength(15000),
                    ]),
                    Schemas\Components\Tabs\Tab::make('Español')->schema([
                        Forms\Components\TextInput::make('title.es')
                            ->label('Título (ES)')->required()->maxLength(200),
                        Forms\Components\Textarea::make('excerpt.es')
                            ->label('Extracto (ES)')->required()->rows(2)->maxLength(15000),
                    ]),
                ])->columnSpanFull(),

                Forms\Components\Select::make('type')
                    ->options(['tour' => 'Tour', 'package' => 'Package'])
                    ->required()->default($defaultType)->live(),
                Forms\Components\Select::make('style')
                    ->options([
                        'safari'       => 'Safari',
                        'mountain'     => 'Mountain',
                        'beach'        => 'Beach',
                        'culture'      => 'Culture',
                        'gorilla'      => 'Gorilla Trekking',
                        'adventure'    => 'Adventure',
                        'migration'    => 'Migration',
                        'birdwatching' => 'Birdwatching',
                        'wildlife'     => 'Wildlife',
                        'luxury'       => 'Luxury',
                    ])
                    ->required(),
                Forms\Components\Select::make('destination_id')
                    ->label('Destination')
                    ->relationship('destination', 'name')
                    ->getOptionLabelFromRecordUsing(fn ($record) => $record->getTranslation('name', 'en'))
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('operator_id')
                    ->label('Operator')
                    ->relationship('operator', 'name')
                    ->searchable()->preload()->required(),
                Forms\Components\Select::make('status')
                    ->options(['draft' => 'Draft', 'in_review' => 'In Review', 'published' => 'Published'])
                    ->required()->default('draft'),
                Forms\Components\TextInput::make('slug')
                    ->label('Slug (auto-generated)')
                    ->disabled()->dehydrated(false)
                    ->visibleOn('edit'),
            ])->columns(3),

            Schemas\Components\Section::make('Pricing & Logistics')->schema([
                Forms\Components\TextInput::make('base_price')
                    ->label('Adult Price')->numeric()->required()->minValue(100)
                    ->suffix('cents')
                    ->helperText('In cents  e.g. 229000 = $2,290.00'),
                Forms\Components\TextInput::make('child_price')
                    ->label('Child Price (under 12)')->numeric()->nullable()->minValue(0)
                    ->suffix('cents')
                    ->helperText('Leave blank to charge the adult price. Infants (under 2) are always free.'),
                Forms\Components\TextInput::make('currency')
                    ->label('Currency')->default('USD')->maxLength(3)->required(),
                Forms\Components\TextInput::make('duration_days')
                    ->label('Duration (days)')->numeric()->required()->minValue(1)->maxValue(365),
                Forms\Components\TextInput::make('max_group_size')
                    ->label('Max Group Size')->numeric()->required()->minValue(1)->maxValue(200),
                Forms\Components\TextInput::make('cancellation_days')
                    ->label('Free Cancel (days before dept.)')->numeric()->default(30)->minValue(0),
                Forms\Components\TextInput::make('deposit_percent')
                    ->label('Deposit (%)')->numeric()->default(20)->minValue(1)->maxValue(100)
                    ->helperText('% of total charged as deposit'),
                Forms\Components\TextInput::make('discount_percent')
                    ->label('Discount (%)')->numeric()->default(0)->minValue(0)->maxValue(100),
                Forms\Components\Select::make('badge')
                    ->options(['bestseller' => 'Bestseller', 'new' => 'New', 'limited' => 'Limited'])
                    ->nullable()->placeholder(' No badge '),
            ])->columns(4),

            Schemas\Components\Section::make('Tour Details')->schema([
                Forms\Components\Select::make('difficulty')
                    ->options([
                        'easy'        => 'Easy  suitable for all fitness levels',
                        'moderate'    => 'Moderate  some walking / light activity',
                        'challenging' => 'Challenging  good fitness required',
                        'extreme'     => 'Extreme  high fitness / experience required',
                    ])
                    ->nullable()->placeholder(' Not specified '),
                Forms\Components\TextInput::make('min_age')
                    ->label('Minimum Age')->numeric()->nullable()->minValue(0)->maxValue(99)
                    ->helperText('Leave blank for no restriction'),
                Forms\Components\TagsInput::make('languages')
                    ->label('Guide Languages')
                    ->placeholder('Type a language, press Enter')
                    ->helperText('e.g. English, French, Swahili')
                    ->reorderable(),
            ])->columns(3),

            Schemas\Components\Section::make('Full Description')->schema([
                Schemas\Components\Tabs::make('Description Translations')->tabs([
                    Schemas\Components\Tabs\Tab::make('English')->schema([
                        Forms\Components\RichEditor::make('description.en')
                            ->label('Description (EN)')
                            ->required()
                            ->toolbarButtons(['bold', 'italic', 'link', 'bulletList', 'orderedList', 'h2', 'h3', 'blockquote'])
                            ->columnSpanFull(),
                    ]),
                    Schemas\Components\Tabs\Tab::make('Français')->schema([
                        Forms\Components\RichEditor::make('description.fr')
                            ->label('Description (FR)')
                            ->required()
                            ->toolbarButtons(['bold', 'italic', 'link', 'bulletList', 'orderedList', 'h2', 'h3', 'blockquote'])
                            ->columnSpanFull(),
                    ]),
                    Schemas\Components\Tabs\Tab::make('Español')->schema([
                        Forms\Components\RichEditor::make('description.es')
                            ->label('Description (ES)')
                            ->required()
                            ->toolbarButtons(['bold', 'italic', 'link', 'bulletList', 'orderedList', 'h2', 'h3', 'blockquote'])
                            ->columnSpanFull(),
                    ]),
                ])->columnSpanFull(),

                Schemas\Components\Tabs::make('Practical Info Translations')->tabs([
                    Schemas\Components\Tabs\Tab::make('English')->schema([
                        Forms\Components\RichEditor::make('practical_info.en')
                            ->label('Practical Info (EN)  Important Notes')
                            ->toolbarButtons(['bold', 'italic', 'link', 'bulletList', 'orderedList'])
                            ->helperText('Vehicle type, what to bring, payment tips, flexibility notes...')
                            ->columnSpanFull(),
                    ]),
                    Schemas\Components\Tabs\Tab::make('Français')->schema([
                        Forms\Components\RichEditor::make('practical_info.fr')
                            ->label('Informations Pratiques (FR)')
                            ->required()
                            ->toolbarButtons(['bold', 'italic', 'link', 'bulletList', 'orderedList'])
                            ->columnSpanFull(),
                    ]),
                    Schemas\Components\Tabs\Tab::make('Español')->schema([
                        Forms\Components\RichEditor::make('practical_info.es')
                            ->label('Información Práctica (ES)')
                            ->required()
                            ->toolbarButtons(['bold', 'italic', 'link', 'bulletList', 'orderedList'])
                            ->columnSpanFull(),
                    ]),
                ])->columnSpanFull(),
            ]),

            Schemas\Components\Section::make('Inclusions & Exclusions')->schema([
                Schemas\Components\Tabs::make('Inclusions Translations')->tabs([
                    Schemas\Components\Tabs\Tab::make('English')->schema([
                        Forms\Components\TagsInput::make('included.en')
                            ->label('Included (EN)')
                            ->placeholder('Type item then press Enter')
                            ->reorderable(),
                        Forms\Components\TagsInput::make('excluded.en')
                            ->label('Excluded (EN)')
                            ->placeholder('Type item then press Enter')
                            ->reorderable(),
                    ])->columns(2),
                    Schemas\Components\Tabs\Tab::make('Français')->schema([
                        Forms\Components\TagsInput::make('included.fr')
                            ->label('Inclus (FR)')
                            ->placeholder('Saisir un élément puis Entrée')
                            ->reorderable(),
                        Forms\Components\TagsInput::make('excluded.fr')
                            ->label('Non inclus (FR)')
                            ->placeholder('Saisir un élément puis Entrée')
                            ->reorderable(),
                    ])->columns(2),
                    Schemas\Components\Tabs\Tab::make('Español')->schema([
                        Forms\Components\TagsInput::make('included.es')
                            ->label('Incluido (ES)')
                            ->placeholder('Escriba un elemento y presione Enter')
                            ->reorderable(),
                        Forms\Components\TagsInput::make('excluded.es')
                            ->label('No incluido (ES)')
                            ->placeholder('Escriba un elemento y presione Enter')
                            ->reorderable(),
                    ])->columns(2),
                ])->columnSpanFull(),
            ]),

            Schemas\Components\Section::make('Day-by-Day Itinerary')->schema([
                Schemas\Components\Tabs::make('Itinerary Translations')->tabs([
                    Schemas\Components\Tabs\Tab::make('English')->schema([
                        Forms\Components\Repeater::make('itinerary.en')
                            ->label('Itinerary (EN)')
                            ->schema([
                                Forms\Components\TextInput::make('day')
                                    ->label('Day #')->numeric()->required()->minValue(1)->default(1),
                                Forms\Components\TextInput::make('title')
                                    ->label('Title')->required()->maxLength(150),
                                Forms\Components\TextInput::make('location')
                                    ->label('Location / Stay')->maxLength(200),
                                Forms\Components\TextInput::make('meals')
                                    ->label('Meals (B/L/D)')->maxLength(20),
                                Forms\Components\Textarea::make('description')
                                    ->label('Description')->rows(3)->columnSpanFull(),
                            ])
                            ->columns(4)
                            ->addActionLabel('Add Day')
                            ->cloneable()
                            ->defaultItems(1),
                    ]),
                    Schemas\Components\Tabs\Tab::make('Français')->schema([
                        Forms\Components\Repeater::make('itinerary.fr')
                            ->label('Itinéraire (FR)')
                            ->schema([
                                Forms\Components\TextInput::make('day')
                                    ->label('Jour #')->numeric()->required()->minValue(1)->default(1),
                                Forms\Components\TextInput::make('title')
                                    ->label('Titre')->required()->maxLength(150),
                                Forms\Components\TextInput::make('location')
                                    ->label('Lieu / Hébergement')->maxLength(200),
                                Forms\Components\TextInput::make('meals')
                                    ->label('Repas (P/D/S)')->maxLength(20),
                                Forms\Components\Textarea::make('description')
                                    ->label('Description')->rows(3)->columnSpanFull(),
                            ])
                            ->columns(4)
                            ->addActionLabel('Ajouter un jour')
                            ->cloneable()
                            ->defaultItems(1),
                    ]),
                    Schemas\Components\Tabs\Tab::make('Español')->schema([
                        Forms\Components\Repeater::make('itinerary.es')
                            ->label('Itinerario (ES)')
                            ->schema([
                                Forms\Components\TextInput::make('day')
                                    ->label('Día #')->numeric()->required()->minValue(1)->default(1),
                                Forms\Components\TextInput::make('title')
                                    ->label('Título')->required()->maxLength(150),
                                Forms\Components\TextInput::make('location')
                                    ->label('Lugar / Alojamiento')->maxLength(200),
                                Forms\Components\TextInput::make('meals')
                                    ->label('Comidas (D/A/C)')->maxLength(20),
                                Forms\Components\Textarea::make('description')
                                    ->label('Descripción')->rows(3)->columnSpanFull(),
                            ])
                            ->columns(4)
                            ->addActionLabel('Agregar día')
                            ->cloneable()
                            ->defaultItems(1),
                    ]),
                ])->columnSpanFull(),
            ])->collapsed(),

            Schemas\Components\Section::make('Package Inclusions')
                ->schema([
                    Schemas\Components\Tabs::make('Inclusions Translations')->tabs([
                        Schemas\Components\Tabs\Tab::make('English')->schema([
                            Forms\Components\Repeater::make('inclusions.en')
                                ->label('Included Experiences (EN)')
                                ->schema([
                                    Forms\Components\TextInput::make('type')
                                        ->label('Title / Type')->required()->maxLength(200),
                                    Forms\Components\TextInput::make('icon')
                                        ->label('Icon key (optional)')->maxLength(50),
                                ])
                                ->columns(2)
                                ->addActionLabel('Add Inclusion')
                                ->defaultItems(0),
                        ]),
                        Schemas\Components\Tabs\Tab::make('Français')->schema([
                            Forms\Components\Repeater::make('inclusions.fr')
                                ->label('Expériences incluses (FR)')
                                ->schema([
                                    Forms\Components\TextInput::make('type')
                                        ->label('Titre / Type')->required()->maxLength(200),
                                    Forms\Components\TextInput::make('icon')
                                        ->label('Clé icône (optionnel)')->maxLength(50),
                                ])
                                ->columns(2)
                                ->addActionLabel('Ajouter')
                                ->defaultItems(0),
                        ]),
                        Schemas\Components\Tabs\Tab::make('Español')->schema([
                            Forms\Components\Repeater::make('inclusions.es')
                                ->label('Experiencias incluidas (ES)')
                                ->schema([
                                    Forms\Components\TextInput::make('type')
                                        ->label('Título / Tipo')->required()->maxLength(200),
                                    Forms\Components\TextInput::make('icon')
                                        ->label('Clave de icono (opcional)')->maxLength(50),
                                ])
                                ->columns(2)
                                ->addActionLabel('Agregar')
                                ->defaultItems(0),
                        ]),
                    ])->columnSpanFull(),
                ])
                ->collapsed()
                ->hidden(fn (\Filament\Schemas\Components\Utilities\Get $get) => $get('type') !== 'package'),

            Schemas\Components\Section::make('GPS Coordinates')->schema([
                Forms\Components\TextInput::make('lat')
                    ->label('Latitude')->numeric()->step(0.0000001),
                Forms\Components\TextInput::make('lng')
                    ->label('Longitude')->numeric()->step(0.0000001),
            ])->columns(2)->collapsed(),

            Schemas\Components\Section::make('Feature Highlights')->schema([
                Schemas\Components\Tabs::make('Highlights Translations')->tabs([
                    Schemas\Components\Tabs\Tab::make('English')->schema([
                        Forms\Components\Repeater::make('highlights.en')
                            ->label('Highlights (EN)')
                            ->schema([
                                Forms\Components\Select::make('icon')
                                    ->label('Icon')
                                    ->options([
                                        'user'      => '👤 Guide / Person',
                                        'tent'      => '⛺ Accommodation',
                                        'utensils'  => '🍽 Meals',
                                        'balloon'   => '🎈 Balloon / Activity',
                                        'binoculars'=> '🔭 Game drives',
                                        'camera'    => '📷 Photography',
                                        'shield'    => '🛡 Safety',
                                        'star'      => '⭐ Premium',
                                    ])
                                    ->required(),
                                Forms\Components\TextInput::make('title')
                                    ->label('Title')->required()->maxLength(80),
                                Forms\Components\TextInput::make('subtitle')
                                    ->label('Subtitle')->maxLength(120),
                            ])
                            ->columns(3)
                            ->addActionLabel('Add Highlight')
                            ->maxItems(6)
                            ->defaultItems(0)
                            ->reorderable(),
                    ]),
                    Schemas\Components\Tabs\Tab::make('Français')->schema([
                        Forms\Components\Repeater::make('highlights.fr')
                            ->label('Highlights (FR)')
                            ->schema([
                                Forms\Components\Select::make('icon')
                                    ->label('Icon')
                                    ->options([
                                        'user'      => '👤 Guide / Person',
                                        'tent'      => '⛺ Accommodation',
                                        'utensils'  => '🍽 Meals',
                                        'balloon'   => '🎈 Balloon / Activity',
                                        'binoculars'=> '🔭 Game drives',
                                        'camera'    => '📷 Photography',
                                        'shield'    => '🛡 Safety',
                                        'star'      => '⭐ Premium',
                                    ])
                                    ->required(),
                                Forms\Components\TextInput::make('title')->label('Titre')->required()->maxLength(80),
                                Forms\Components\TextInput::make('subtitle')->label('Sous-titre')->maxLength(120),
                            ])
                            ->columns(3)
                            ->addActionLabel('Ajouter')
                            ->maxItems(6)
                            ->defaultItems(0),
                    ]),
                    Schemas\Components\Tabs\Tab::make('Español')->schema([
                        Forms\Components\Repeater::make('highlights.es')
                            ->label('Highlights (ES)')
                            ->schema([
                                Forms\Components\Select::make('icon')
                                    ->label('Icon')
                                    ->options([
                                        'user'      => '👤 Guide / Person',
                                        'tent'      => '⛺ Accommodation',
                                        'utensils'  => '🍽 Meals',
                                        'balloon'   => '🎈 Balloon / Activity',
                                        'binoculars'=> '🔭 Game drives',
                                        'camera'    => '📷 Photography',
                                        'shield'    => '🛡 Safety',
                                        'star'      => '⭐ Premium',
                                    ])
                                    ->required(),
                                Forms\Components\TextInput::make('title')->label('Título')->required()->maxLength(80),
                                Forms\Components\TextInput::make('subtitle')->label('Subtítulo')->maxLength(120),
                            ])
                            ->columns(3)
                            ->addActionLabel('Agregar')
                            ->maxItems(6)
                            ->defaultItems(0),
                    ]),
                ])->columnSpanFull(),
            ])->collapsed(),

            Schemas\Components\Section::make('Optional Add-ons')->schema([
                Forms\Components\Repeater::make('addons')
                    ->relationship('addons')
                    ->schema([
                        Schemas\Components\Tabs::make('Add-on Translations')->tabs([
                            Schemas\Components\Tabs\Tab::make('English')->schema([
                                Forms\Components\TextInput::make('label.en')
                                    ->label('Label (EN)')->required()->maxLength(150),
                                Forms\Components\Textarea::make('description.en')
                                    ->label('Description (EN)')->rows(2)->columnSpanFull(),
                            ]),
                            Schemas\Components\Tabs\Tab::make('Français')->schema([
                                Forms\Components\TextInput::make('label.fr')
                                    ->label('Libellé (FR)')->required()->maxLength(150),
                                Forms\Components\Textarea::make('description.fr')
                                    ->label('Description (FR)')->rows(2)->columnSpanFull(),
                            ]),
                            Schemas\Components\Tabs\Tab::make('Español')->schema([
                                Forms\Components\TextInput::make('label.es')
                                    ->label('Etiqueta (ES)')->required()->maxLength(150),
                                Forms\Components\Textarea::make('description.es')
                                    ->label('Descripción (ES)')->rows(2)->columnSpanFull(),
                            ]),
                        ])->columnSpanFull(),
                        Forms\Components\TextInput::make('price_per_person')
                            ->label('Price / Person (cents)')->numeric()->required()->minValue(0)->suffix('cts'),
                        Forms\Components\Hidden::make('position')->default(0),
                    ])
                    ->columns(2)
                    ->addActionLabel('Add Add-on')
                    ->defaultItems(0),
            ])->collapsed(),

            Schemas\Components\Section::make('Departure Schedules')->schema([
                Forms\Components\Repeater::make('schedules')
                    ->relationship('schedules')
                    ->schema([
                        Forms\Components\DatePicker::make('starts_at')
                            ->label('Departure')->required()->native(false),
                        Forms\Components\DatePicker::make('ends_at')
                            ->label('Return')->required()->native(false),
                        Forms\Components\TextInput::make('capacity')
                            ->label('Capacity')->numeric()->required()->default(12)->minValue(1),
                        Forms\Components\TextInput::make('seats_left')
                            ->label('Seats Left')->numeric()->required()->default(12)->minValue(0),
                        Forms\Components\TextInput::make('price_override')
                            ->label('Price Override (cents)')->numeric()->nullable()
                            ->helperText('Leave empty to use base price'),
                    ])
                    ->columns(5)
                    ->addActionLabel('Add Departure Date')
                    ->defaultItems(1),
            ])->collapsed(),

            Schemas\Components\Section::make('Photo Gallery')->schema([
                Forms\Components\SpatieMediaLibraryFileUpload::make('gallery')
                    ->collection('gallery')
                    ->multiple()
                    ->reorderable()
                    ->image()
                    ->maxFiles(20)
                    ->maxSize(8192)
                    ->label('Tour Photos')
                    ->helperText('Up to 20 photos  JPG, PNG, WebP. Max 8MB each.'),
            ])->collapsed(),
        ]);
    }

    public static function form(Schema $schema): Schema
    {
        return static::buildForm($schema, 'tour');
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Section::make('Information')->schema([
                Infolists\Components\TextEntry::make('title.en')->label('Title (EN)'),
                Infolists\Components\TextEntry::make('operator.name')->label('Operator'),
                Infolists\Components\TextEntry::make('destination.name')
                    ->label('Destination')
                    ->formatStateUsing(fn ($state, $record) => $record->destination?->getTranslation('name', 'en')),
                Infolists\Components\TextEntry::make('type')->badge()
                    ->color(fn ($state) => $state === 'package' ? 'info' : 'primary'),
                Infolists\Components\TextEntry::make('style')->badge()->color('gray'),
                Infolists\Components\TextEntry::make('status')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'published' => 'success',
                        'in_review' => 'warning',
                        default     => 'gray',
                    }),
                Infolists\Components\TextEntry::make('duration_days')->label('Duration (days)'),
                Infolists\Components\TextEntry::make('max_group_size')->label('Max Group'),
                Infolists\Components\TextEntry::make('base_price')
                    ->label('Base Price')
                    ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 2)),
                Infolists\Components\TextEntry::make('cancellation_days')->label('Free Cancel (days)'),
                Infolists\Components\TextEntry::make('discount_percent')->label('Discount %'),
                Infolists\Components\TextEntry::make('badge')->badge()->color('warning'),
                Infolists\Components\TextEntry::make('rating_cache')->label('Rating')->numeric(2),
                Infolists\Components\TextEntry::make('reviews_count_cache')->label('Reviews'),
            ])->columns(4),

            Schemas\Components\Section::make('Excerpt')->schema([
                Infolists\Components\TextEntry::make('excerpt.en')->label('Excerpt (EN)')->columnSpanFull(),
            ])->collapsed(),
        ]);
    }

    public static function buildTable(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label('Title')
                    ->getStateUsing(fn (Tour $record) => $record->getTranslation('title', 'en'))
                    ->searchable(query: fn ($query, string $search) =>
                        $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(title, '$.en')) LIKE ?", ["%{$search}%"]))
                    ->sortable(query: fn ($query, string $direction) =>
                        $query->orderByRaw("JSON_UNQUOTE(JSON_EXTRACT(title, '$.en')) {$direction}"))
                    ->limit(38)->weight(\Filament\Support\Enums\FontWeight::Medium),
                Tables\Columns\TextColumn::make('operator.name')->label('Operator')->sortable(),
                Tables\Columns\TextColumn::make('destination_name')
                    ->label('Destination')
                    ->getStateUsing(fn (Tour $record) => $record->destination?->getTranslation('name', 'en')),
                Tables\Columns\TextColumn::make('type')->badge()
                    ->color(fn ($state) => $state === 'package' ? 'info' : 'gray'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'published' => 'success',
                        'in_review' => 'warning',
                        default     => 'gray',
                    }),
                Tables\Columns\TextColumn::make('base_price')
                    ->label('Price')
                    ->formatStateUsing(fn ($state) => '$' . number_format($state / 100, 0))
                    ->sortable(),
                Tables\Columns\TextColumn::make('schedules_count')
                    ->counts('schedules')->label('Departures')
                    ->badge()->color('gray'),
                Tables\Columns\TextColumn::make('rating_cache')
                    ->label('Rating')->numeric(1)->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['draft' => 'Draft', 'in_review' => 'In Review', 'published' => 'Published']),
                Tables\Filters\SelectFilter::make('type')
                    ->options(['tour' => 'Tour', 'package' => 'Package']),
                Tables\Filters\SelectFilter::make('operator')
                    ->relationship('operator', 'name')
                    ->searchable()->preload(),
            ])
            ->actions([
                \Filament\Actions\ViewAction::make(),
                \Filament\Actions\EditAction::make(),
                \Filament\Actions\Action::make('publish')
                    ->label('Publish')->icon('heroicon-o-check-circle')->color('success')
                    ->visible(fn (Tour $record) => $record->status === 'in_review')
                    ->requiresConfirmation()
                    ->action(function (Tour $record) {
                        $record->update(['status' => 'published']);
                        Notification::make()
                            ->title('"' . $record->getTranslation('title', 'en') . '" published')
                            ->success()->send();
                    }),
                \Filament\Actions\Action::make('reject')
                    ->label('Reject')->icon('heroicon-o-x-circle')->color('danger')
                    ->visible(fn (Tour $record) => $record->status === 'in_review')
                    ->form([
                        Forms\Components\Textarea::make('reason')
                            ->label('Rejection reason')->required(),
                    ])
                    ->action(function (Tour $record, array $data) {
                        $record->update(['status' => 'draft']);
                        Notification::make()
                            ->title('Tour rejected: ' . $record->getTranslation('title', 'en'))
                            ->body('Reason: ' . $data['reason'])
                            ->warning()->send();
                    }),
                \Filament\Actions\Action::make('unpublish')
                    ->label('Unpublish')->icon('heroicon-o-eye-slash')->color('warning')
                    ->visible(fn (Tour $record) => $record->status === 'published')
                    ->requiresConfirmation()
                    ->action(function (Tour $record) {
                        $record->update(['status' => 'draft']);
                        Notification::make()->title('Tour unpublished')->warning()->send();
                    }),
            ])
            ->bulkActions([
                \Filament\Actions\BulkActionGroup::make([
                    \Filament\Actions\BulkAction::make('publish_all')
                        ->label('Publish Selected')->icon('heroicon-o-check-circle')->color('success')
                        ->action(fn ($records) => $records->each->update(['status' => 'published']))
                        ->deselectRecordsAfterCompletion(),
                    \Filament\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function table(Table $table): Table
    {
        return static::buildTable($table);
    }

    public static function getRelationManagers(): array
    {
        return [
            ReviewsRelationManager::class,
        ];
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
