<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\GalleryResource\Pages;
use App\Models\GalleryItem;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class GalleryResource extends Resource
{
    protected static ?string $model = GalleryItem::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-photo';
    protected static string|\UnitEnum|null $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 5;
    protected static ?string $label = 'Gallery Item';
    protected static ?string $pluralLabel = 'Gallery';

    protected const ACCEPTED_MIME_TYPES = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'video/quicktime',
    ];

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Section::make('Media')->schema([
                // Create: bulk import  one gallery item is created per file, in order.
                Forms\Components\FileUpload::make('files')
                    ->label('Media Files')
                    ->disk('public')
                    ->directory('gallery-imports')
                    ->multiple()
                    ->reorderable()
                    ->acceptedFileTypes(self::ACCEPTED_MIME_TYPES)
                    ->maxSize(51200)
                    ->maxFiles(50)
                    ->required()
                    ->visible(fn (string $operation): bool => $operation === 'create')
                    ->dehydrated(fn (string $operation): bool => $operation === 'create')
                    ->helperText('Select one or more images/videos. Each becomes its own gallery item, appended after your existing items in the order shown here. JPG, PNG, WebP, GIF, MP4, WebM, MOV  max 50MB each.'),

                // Edit: replace this item's single file.
                Forms\Components\SpatieMediaLibraryFileUpload::make('file')
                    ->collection('file')
                    ->acceptedFileTypes(self::ACCEPTED_MIME_TYPES)
                    ->maxSize(51200)
                    ->required()
                    ->visible(fn (string $operation): bool => $operation === 'edit')
                    ->helperText('Image (JPG, PNG, WebP, GIF) or video (MP4, WebM, MOV). Max 50MB.'),
            ]),

            Schemas\Components\Section::make('Caption (Translations)')->schema([
                Schemas\Components\Tabs::make()->tabs([
                    Schemas\Components\Tabs\Tab::make('🇬🇧 EN')->schema([
                        Forms\Components\TextInput::make('caption.en')->label('Caption (EN)')->maxLength(150),
                    ]),
                    Schemas\Components\Tabs\Tab::make('🇫🇷 FR')->schema([
                        Forms\Components\TextInput::make('caption.fr')->label('Légende (FR)')->maxLength(150),
                    ]),
                    Schemas\Components\Tabs\Tab::make('🇪🇸 ES')->schema([
                        Forms\Components\TextInput::make('caption.es')->label('Leyenda (ES)')->maxLength(150),
                    ]),
                ])->columnSpanFull(),
            ])->collapsed()->visible(fn (string $operation): bool => $operation === 'edit'),

            Forms\Components\TextInput::make('position')
                ->numeric()
                ->default(fn () => ((int) GalleryItem::max('position')) + 1)
                ->helperText('Display order  new items are placed after existing ones automatically. Change this only if you want to reorder manually (you can also drag rows in the list).')
                ->visible(fn (string $operation): bool => $operation === 'edit'),

            Forms\Components\Toggle::make('is_active')
                ->label('Active')
                ->default(true)
                ->visible(fn (string $operation): bool => $operation === 'edit'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\SpatieMediaLibraryImageColumn::make('file')
                    ->collection('file')
                    ->conversion('thumb')
                    ->label('')->width(64)->height(44),
                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->getStateUsing(fn (GalleryItem $record) => str_starts_with($record->getFirstMedia('file')?->mime_type ?? '', 'video/') ? 'Video' : 'Image')
                    ->badge()
                    ->color(fn (string $state) => $state === 'Video' ? 'warning' : 'gray'),
                Tables\Columns\TextColumn::make('caption.en')
                    ->label('Caption')->limit(50),
                Tables\Columns\TextColumn::make('position')->sortable(),
                Tables\Columns\IconColumn::make('is_active')->boolean()->label('Active'),
            ])
            ->reorderable('position')
            ->defaultSort('position')
            ->actions([
                \Filament\Actions\EditAction::make(),
                \Filament\Actions\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListGalleryItems::route('/'),
            'create' => Pages\CreateGalleryItem::route('/create'),
            'edit'   => Pages\EditGalleryItem::route('/{record}/edit'),
        ];
    }
}
