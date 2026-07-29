<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\EmailAutomationResource\Pages;
use App\Models\EmailAutomation;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class EmailAutomationResource extends Resource
{
    protected static ?string $model = EmailAutomation::class;
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-bolt';
    protected static string|\UnitEnum|null $navigationGroup = 'Marketing';
    protected static ?int $navigationSort = 5;
    protected static ?string $label = 'Email Automation';
    protected static ?string $pluralLabel = 'Email Automations';

    private const DAY_BASED_TRIGGERS = ['newsletter_signup', 'booking_confirmed', 'before_departure', 'after_trip_end'];
    private const BOOKING_TRIGGERS = ['booking_confirmed', 'before_departure', 'departure_day', 'after_trip_end'];
    private const AUDIENCE_TRIGGERS = ['newsletter_signup', 'recurring_monthly'];

    public static function form(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Section::make('Trigger')->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Internal name')
                    ->required()->maxLength(150),
                Forms\Components\Select::make('category')
                    ->options(EmailAutomation::CATEGORIES)
                    ->required()->default('booking_journey'),
                Forms\Components\Select::make('trigger_event')
                    ->label('Fires...')
                    ->options(EmailAutomation::TRIGGER_EVENTS)
                    ->required()->live()->default('before_departure'),

                Forms\Components\TextInput::make('offset_days')
                    ->label(fn (Get $get) => $get('trigger_event') === 'after_trip_end' ? 'Days after the trip ends' : 'Days before/after the trigger event')
                    ->numeric()->minValue(0)->maxValue(365)->default(0)
                    ->visible(fn (Get $get) => in_array($get('trigger_event'), self::DAY_BASED_TRIGGERS, true)),

                // Virtual field: not a real column. The model only stores the day
                // number (1–31); Create/Edit pages translate to/from this date
                // picker in mutateFormDataBeforeFill/Save/Create. Keeping it
                // separate from the real attribute avoids Filament's DatePicker
                // trying to parse the raw stored integer as a date on load.
                Forms\Components\DatePicker::make('recurring_day_picker')
                    ->label('Day of month')
                    ->native(false)
                    ->displayFormat('jS')
                    ->closeOnDateSelection()
                    ->default(now()->startOfMonth())
                    ->helperText('Pick any date  only the day number is kept. Picking the 31st fires every month that has one (skips shorter months).')
                    ->visible(fn (Get $get) => $get('trigger_event') === 'recurring_monthly'),

                Forms\Components\TimePicker::make('send_time')
                    ->label('Send at (time of day)')
                    ->seconds(false)
                    ->default('09:00')
                    ->required(),

                Forms\Components\Select::make('audience')
                    ->options(EmailAutomation::AUDIENCES)
                    ->default('all_subscribers')
                    ->visible(fn (Get $get) => in_array($get('trigger_event'), self::AUDIENCE_TRIGGERS, true)),

                Forms\Components\Toggle::make('is_active')
                    ->label('Active')
                    ->default(true)
                    ->helperText('Pause without deleting.'),
            ])->columns(3),

            Schemas\Components\Section::make('Content (Translations)')->schema([
                Schemas\Components\Tabs::make()->tabs([
                    Schemas\Components\Tabs\Tab::make('🇬🇧 EN')->schema([
                        Forms\Components\TextInput::make('subject.en')->label('Subject (EN)')->required()->maxLength(150),
                        Forms\Components\RichEditor::make('body.en')->label('Body (EN)')->required(),
                    ]),
                    Schemas\Components\Tabs\Tab::make('🇫🇷 FR')->schema([
                        Forms\Components\TextInput::make('subject.fr')->label('Sujet (FR)')->maxLength(150),
                        Forms\Components\RichEditor::make('body.fr')->label('Corps (FR)'),
                    ]),
                    Schemas\Components\Tabs\Tab::make('🇪🇸 ES')->schema([
                        Forms\Components\TextInput::make('subject.es')->label('Asunto (ES)')->maxLength(150),
                        Forms\Components\RichEditor::make('body.es')->label('Cuerpo (ES)'),
                    ]),
                ])->columnSpanFull(),
            ]),

            Schemas\Components\Section::make('Dynamic Blocks')
                ->description('Auto-inserted below your message, using real booking/trip data when available (e.g. guide & hotel info is filled in per departure date on the tour).')
                ->schema([
                    Forms\Components\CheckboxList::make('include_blocks')
                        ->label('')
                        ->options(EmailAutomation::BLOCKS)
                        ->columns(2),
                ])->collapsed(fn (Get $get) => ! in_array($get('trigger_event'), self::BOOKING_TRIGGERS, true)),

            Schemas\Components\Section::make('Call to Action (optional)')->schema([
                Forms\Components\TextInput::make('discount_code')->label('Discount code')->maxLength(50),
                Forms\Components\TextInput::make('cta_label')->label('Button label')->maxLength(60),
                Forms\Components\TextInput::make('cta_url')->label('Button URL')->url()->placeholder(config('app.url')),
            ])->columns(3)->collapsed(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()->weight(\Filament\Support\Enums\FontWeight::Medium),
                Tables\Columns\TextColumn::make('category')
                    ->formatStateUsing(fn (string $state) => EmailAutomation::CATEGORIES[$state] ?? $state)
                    ->badge()->color('gray'),
                Tables\Columns\TextColumn::make('trigger_event')
                    ->label('Trigger')
                    ->formatStateUsing(fn (string $state) => EmailAutomation::TRIGGER_EVENTS[$state] ?? $state)
                    ->badge()->color('info'),
                Tables\Columns\TextColumn::make('offset_days')
                    ->label('Offset')
                    ->formatStateUsing(fn ($state, EmailAutomation $record) => in_array($record->trigger_event, self::DAY_BASED_TRIGGERS, true) ? "{$state}d" : ''),
                Tables\Columns\TextColumn::make('send_time')
                    ->label('Time')
                    ->formatStateUsing(fn ($state) => substr((string) $state, 0, 5)),
                Tables\Columns\IconColumn::make('is_active')->boolean()->label('Active'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('category')->options(EmailAutomation::CATEGORIES),
                Tables\Filters\SelectFilter::make('trigger_event')->options(EmailAutomation::TRIGGER_EVENTS),
                Tables\Filters\TernaryFilter::make('is_active'),
            ])
            ->defaultSort('category')
            ->actions([
                \Filament\Actions\EditAction::make(),
                \Filament\Actions\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListEmailAutomations::route('/'),
            'create' => Pages\CreateEmailAutomation::route('/create'),
            'edit'   => Pages\EditEmailAutomation::route('/{record}/edit'),
        ];
    }
}
