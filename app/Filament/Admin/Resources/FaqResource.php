<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\FaqResource\Pages;
use App\Models\Faq;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Schemas;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class FaqResource extends Resource
{
    protected static ?string $model = Faq::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-question-mark-circle';
    protected static string|\UnitEnum|null $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 4;
    protected static ?string $label = 'FAQ';
    protected static ?string $pluralLabel = 'FAQs';

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Tabs::make()->tabs([
                Schemas\Components\Tabs\Tab::make('🇬🇧 EN')->schema([
                    Forms\Components\TextInput::make('question.en')->label('Question (EN)')->required(),
                    Forms\Components\Textarea::make('answer.en')->label('Answer (EN)')->required(),
                ]),
                Schemas\Components\Tabs\Tab::make('🇫🇷 FR')->schema([
                    Forms\Components\TextInput::make('question.fr')->label('Question (FR)')->required(),
                    Forms\Components\Textarea::make('answer.fr')->label('Answer (FR)')->required(),
                ]),
                Schemas\Components\Tabs\Tab::make('🇪🇸 ES')->schema([
                    Forms\Components\TextInput::make('question.es')->label('Question (ES)')->required(),
                    Forms\Components\Textarea::make('answer.es')->label('Answer (ES)')->required(),
                ]),
            ]),
            Forms\Components\TextInput::make('position')->numeric()->default(0),
            Forms\Components\Toggle::make('is_active')->label('Active')->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('question.en')
                    ->label('Question')->limit(60)->searchable(),
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
            'index'  => Pages\ListFaqs::route('/'),
            'create' => Pages\CreateFaq::route('/create'),
            'edit'   => Pages\EditFaq::route('/{record}/edit'),
        ];
    }
}
