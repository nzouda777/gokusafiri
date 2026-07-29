<?php

namespace App\Filament\Admin\Pages;

use App\Settings\GeneralSettings;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form as FormComponent;
use Filament\Schemas\Schema;

class SettingsPage extends Page
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationLabel = 'Settings';

    protected static ?string $title = 'Platform Settings';

    public ?array $data = [];

    public function mount(GeneralSettings $settings): void
    {
        $this->form->fill($settings->toArray());
    }

    public function form(Schema $schema): Schema
    {
        return $schema->schema([
            Schemas\Components\Section::make('Finance')->schema([
                Forms\Components\TextInput::make('tax_fee_percent')
                    ->label('Tax & Fees (%)')
                    ->numeric()->minValue(0)->maxValue(100),
                Forms\Components\TextInput::make('deposit_percent')
                    ->label('Deposit (%)')
                    ->numeric()->minValue(1)->maxValue(100),
                Forms\Components\TextInput::make('tier_discount_percent')
                    ->label('Explorer Tier Discount (%)')
                    ->numeric()->minValue(0)->maxValue(50),
                Forms\Components\TextInput::make('platform_commission_percent')
                    ->label('Platform Commission (%)')
                    ->numeric()->minValue(0)->maxValue(100),
                Forms\Components\TextInput::make('referral_commission_percent')
                    ->label('Referral Commission (%)')
                    ->helperText('Share of each payment credited to the referrer.')
                    ->numeric()->minValue(0)->maxValue(50),
            ])->columns(2),

            Schemas\Components\Section::make('Technical')->schema([
                Forms\Components\Select::make('payment_driver')
                    ->label('Payment Driver')
                    ->options(['fake' => 'Fake (demo)'])
                    ->required(),
                Forms\Components\TextInput::make('google_maps_api_key')
                    ->label('Google Maps API Key')
                    ->password(),
                Forms\Components\CheckboxList::make('active_locales')
                    ->label('Active Languages')
                    ->options(['en' => 'English', 'fr' => 'French', 'es' => 'Spanish']),
            ])->columns(2),

            Schemas\Components\Section::make('Launch')
                ->description('While enabled, all public pages redirect to the Coming Soon page.')
                ->schema([
                    Forms\Components\Toggle::make('coming_soon_enabled')
                        ->label('Coming Soon mode')
                        ->helperText('Turn off to make the full website publicly visible.')
                        ->onColor('danger')
                        ->offColor('success'),
                ])->columns(1),
        ])->statePath('data');
    }

    public function content(Schema $schema): Schema
    {
        return $schema->components([
            FormComponent::make([EmbeddedSchema::make('form')])
                ->id('form')
                ->livewireSubmitHandler('save')
                ->footer([
                    Actions::make($this->getFormActions())
                        ->key('form-actions'),
                ]),
        ]);
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Save')
                ->submit('save'),
        ];
    }

    public function save(GeneralSettings $settings): void
    {
        $data = $this->form->getState();

        // Integer settings must be saved even when 0 (falsy). Filament numeric
        // inputs may return null when the field is cleared — treat that as 0.
        $intKeys = [
            'tax_fee_percent', 'deposit_percent', 'tier_discount_percent',
            'platform_commission_percent', 'referral_commission_percent',
        ];

        foreach ($data as $key => $value) {
            if (in_array($key, $intKeys, true)) {
                $settings->$key = (int) ($value ?? 0);
            } elseif ($value !== null) {
                $settings->$key = $value;
            }
        }

        // When settings rows don't exist in the DB yet, Spatie marks every
        // property as "default-value-loaded" and refuses to save them.
        // Resetting that tracking allows the underlying upsert to create
        // the rows on first save, just like on subsequent saves.
        $settings->settingsConfig()->resetDefaultValueLoadedProperties();

        $settings->save();

        Notification::make()->title('Settings saved')->success()->send();
    }
}
