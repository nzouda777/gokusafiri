<?php

namespace Database\Seeders;

use App\Models\Destination;
use App\Models\Faq;
use App\Models\Operator;
use App\Models\Tour;
use App\Models\TourAddon;
use App\Models\TourSchedule;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Permissions and roles (includes creating admin/operator/customer roles)
        $this->call(PermissionsSeeder::class);

        $adminRole    = Role::firstOrCreate(['name' => 'admin']);
        $operatorRole = Role::firstOrCreate(['name' => 'operator']);
        $customerRole = Role::firstOrCreate(['name' => 'customer']);

        // Users démo
        $admin = User::factory()->create([
            'name' => 'Admin GKS', 'first_name' => 'Admin', 'last_name' => 'GKS',
            'email' => 'admin@gokusafiri.com',
            'password' => Hash::make('$RootAppManager2020'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole($adminRole);

        $operatorUser = User::factory()->create([
            'name' => 'Operator Demo', 'first_name' => 'Operator', 'last_name' => 'Demo',
            'email' => 'operator@gokusafiri.test',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $operatorUser->assignRole($operatorRole);

        $customer = User::factory()->create([
            'name' => 'Explorer John', 'first_name' => 'John', 'last_name' => 'Doe',
            'email' => 'customer@gokusafiri.test',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'tier' => 'explorer',
        ]);
        $customer->assignRole($customerRole);

        // Operator
        $operator = Operator::create([
            'name' => 'GoKuSafiri Official',
            'slug' => 'gokusafiri-official',
            'email' => 'operator@gokusafiri.test',
            'is_approved' => true,
        ]);
        $operator->users()->attach($operatorUser, ['role' => 'owner']);

        // Destinations
        $destData = [
            ['name' => ['en' => 'Serengeti', 'fr' => 'Serengeti', 'es' => 'Serengeti'], 'country' => 'TZ', 'region' => 'east'],
            ['name' => ['en' => 'Masai Mara', 'fr' => 'Masai Mara', 'es' => 'Masai Mara'], 'country' => 'KE', 'region' => 'east'],
            ['name' => ['en' => 'Zanzibar', 'fr' => 'Zanzibar', 'es' => 'Zanzíbar'], 'country' => 'TZ', 'region' => 'east'],
            ['name' => ['en' => 'Kilimanjaro', 'fr' => 'Kilimandjaro', 'es' => 'Kilimanjaro'], 'country' => 'TZ', 'region' => 'east'],
            ['name' => ['en' => 'Victoria Falls', 'fr' => 'Chutes Victoria', 'es' => 'Cataratas Victoria'], 'country' => 'ZM', 'region' => 'southern'],
            ['name' => ['en' => 'Cape Town', 'fr' => 'Le Cap', 'es' => 'Ciudad del Cabo'], 'country' => 'ZA', 'region' => 'southern'],
            ['name' => ['en' => 'Sahara & Marrakech', 'fr' => 'Sahara & Marrakech', 'es' => 'Sahara y Marrakech'], 'country' => 'MA', 'region' => 'north'],
            ['name' => ['en' => 'Bwindi Forest', 'fr' => 'Forêt de Bwindi', 'es' => 'Bosque de Bwindi'], 'country' => 'UG', 'region' => 'east'],
        ];
        foreach ($destData as $d) {
            Destination::create($d);
        }

        // Rich tour data with full itinerary
        $this->call(TourSeeder::class);

        // Additional basic tours (from design)
        $tourDefs = [
            [
                'title' => ['en' => 'Great Migration Explorer', 'fr' => 'Explorateur de la Grande Migration', 'es' => 'Explorador de la Gran Migración'],
                'excerpt' => ['en' => '7 days witnessing the legendary wildebeest migration in the Serengeti.', 'fr' => '7 jours pour assister à la légendaire migration des gnous dans le Serengeti.'],
                'type' => 'tour', 'style' => 'safari', 'duration_days' => 7,
                'base_price' => 229000, 'max_group_size' => 12,
                'dest_en' => 'Serengeti', 'badge' => 'bestseller', 'status' => 'published',
                'lat' => -2.3333, 'lng' => 34.8333,
            ],
            [
                'title' => ['en' => 'Spice Island Escape', 'fr' => 'Escapade Île aux Épices', 'es' => 'Escape a la Isla de las Especias'],
                'excerpt' => ['en' => 'Beaches, spices and culture in paradise Zanzibar.', 'fr' => 'Plages, épices et culture dans le paradis Zanzibar.'],
                'type' => 'package', 'style' => 'beach', 'duration_days' => 5,
                'base_price' => 179000, 'max_group_size' => 16,
                'dest_en' => 'Zanzibar', 'badge' => 'new', 'status' => 'published',
                'inclusions' => [['type' => 'Flights'], ['type' => 'Lodges'], ['type' => 'Meals']],
                'discount_percent' => 10, 'lat' => -6.1659, 'lng' => 39.2026,
            ],
            [
                'title' => ['en' => 'Root of Africa Trek', 'fr' => 'Trek aux Racines de l\'Afrique', 'es' => 'Trekking a las Raíces de África'],
                'excerpt' => ['en' => 'Conquer Mount Kilimanjaro via the Lemosho route.', 'fr' => 'Conquérir le Kilimandjaro par la route Lemosho.'],
                'type' => 'tour', 'style' => 'mountain', 'duration_days' => 8,
                'base_price' => 320000, 'max_group_size' => 10,
                'dest_en' => 'Kilimanjaro', 'status' => 'published', 'lat' => -3.0674, 'lng' => 37.3556,
            ],
            [
                'title' => ['en' => 'Masai Mara Big Five', 'fr' => 'Les Cinq Grands du Masai Mara', 'es' => 'Los Cinco Grandes del Masai Mara'],
                'excerpt' => ['en' => 'Game drives in the iconic Masai Mara reserve.', 'fr' => 'Safari dans l\'emblématique réserve du Masai Mara.'],
                'type' => 'tour', 'style' => 'safari', 'duration_days' => 6,
                'base_price' => 259000, 'max_group_size' => 8,
                'dest_en' => 'Masai Mara', 'status' => 'published', 'lat' => -1.5, 'lng' => 35.1,
            ],
            [
                'title' => ['en' => 'Gorilla Trekking Bwindi', 'fr' => 'Trekking des Gorilles à Bwindi', 'es' => 'Trekking de Gorilas en Bwindi'],
                'excerpt' => ['en' => 'Face-to-face encounter with mountain gorillas in Bwindi Forest.', 'fr' => 'Rencontre face à face avec les gorilles de montagne dans la forêt de Bwindi.'],
                'type' => 'tour', 'style' => 'gorilla', 'duration_days' => 4,
                'base_price' => 380000, 'max_group_size' => 8,
                'dest_en' => 'Bwindi Forest', 'badge' => 'bestseller', 'status' => 'published',
                'lat' => -0.9833, 'lng' => 29.6,
            ],
            [
                'title' => ['en' => 'Victoria Falls Adventure', 'fr' => 'Aventure aux Chutes Victoria', 'es' => 'Aventura en las Cataratas Victoria'],
                'excerpt' => ['en' => 'The smoke that thunders  Victoria Falls and wildlife safari.', 'fr' => 'La fumée qui tonne  Chutes Victoria et safari.'],
                'type' => 'tour', 'style' => 'safari', 'duration_days' => 5,
                'base_price' => 195000, 'max_group_size' => 14,
                'dest_en' => 'Victoria Falls', 'status' => 'published', 'lat' => -17.9243, 'lng' => 25.8572,
            ],
            [
                'title' => ['en' => 'Cape Town & Winelands', 'fr' => 'Le Cap & Vignobles', 'es' => 'Ciudad del Cabo y Viñedos'],
                'excerpt' => ['en' => 'City, culture and wine in South Africa\'s Cape Peninsula.', 'fr' => 'Ville, culture et vin dans la péninsule du Cap.'],
                'type' => 'package', 'style' => 'culture', 'duration_days' => 7,
                'base_price' => 210000, 'max_group_size' => 20,
                'dest_en' => 'Cape Town', 'status' => 'published',
                'inclusions' => [['type' => 'Lodges'], ['type' => 'Meals']],
                'lat' => -33.9249, 'lng' => 18.4241,
            ],
            [
                'title' => ['en' => 'Sahara & Marrakech Discovery', 'fr' => 'Découverte Sahara & Marrakech', 'es' => 'Descubrimiento del Sahara y Marrakech'],
                'excerpt' => ['en' => 'Dunes, medinas and riads  the magic of Morocco.', 'fr' => 'Dunes, médinas et riads  la magie du Maroc.'],
                'type' => 'tour', 'style' => 'culture', 'duration_days' => 9,
                'base_price' => 189000, 'max_group_size' => 15,
                'dest_en' => 'Sahara & Marrakech', 'status' => 'published', 'lat' => 31.6295, 'lng' => -7.9811,
            ],
        ];

        foreach ($tourDefs as $data) {
            // Skip tours already created by TourSeeder (avoids duplicate slugs like gorilla-trekking-bwindi-1)
            if (Tour::whereRaw("JSON_UNQUOTE(JSON_EXTRACT(title, '$.en')) = ?", [$data['title']['en']])->exists()) {
                continue;
            }

            $dest = Destination::whereJsonContains('name->en', $data['dest_en'])->first();
            if (! $dest) {
                continue;
            }
            $tour = Tour::create([
                'operator_id' => $operator->id,
                'destination_id' => $dest->id,
                'type' => $data['type'],
                'title' => $data['title'],
                'excerpt' => $data['excerpt'],
                'description' => ['en' => $data['excerpt']['en'] . ' Full description coming soon.', 'fr' => $data['excerpt']['fr'] . ' Description complète à venir.'],
                'base_price' => $data['base_price'],
                'currency' => 'USD',
                'duration_days' => $data['duration_days'],
                'max_group_size' => $data['max_group_size'],
                'style' => $data['style'],
                'lat' => $data['lat'] ?? null,
                'lng' => $data['lng'] ?? null,
                'cancellation_days' => 30,
                'badge' => $data['badge'] ?? null,
                'discount_percent' => $data['discount_percent'] ?? null,
                'inclusions' => $data['inclusions'] ?? null,
                'status' => $data['status'],
                'rating_cache' => round(mt_rand(42, 50) / 10, 1),
                'reviews_count_cache' => mt_rand(15, 80),
            ]);

            // Add-ons standard
            TourAddon::create(['tour_id' => $tour->id, 'label' => ['en' => 'Airport Transfers', 'fr' => 'Transferts aéroport', 'es' => 'Traslados aeropuerto'], 'price_per_person' => 4000, 'position' => 1]);
            TourAddon::create(['tour_id' => $tour->id, 'label' => ['en' => 'Travel Insurance', 'fr' => 'Assurance voyage', 'es' => 'Seguro de viaje'], 'price_per_person' => 8900, 'position' => 2]);
            if ($tour->style === 'safari') {
                TourAddon::create(['tour_id' => $tour->id, 'label' => ['en' => 'Sunrise Balloon Flight', 'fr' => 'Vol en montgolfière au lever du soleil', 'es' => 'Vuelo en globo al amanecer'], 'price_per_person' => 45000, 'position' => 3]);
            }

            // Schedules sur 6 mois
            for ($i = 1; $i <= 4; $i++) {
                $start = Carbon::now()->addWeeks($i * 3);
                TourSchedule::create([
                    'tour_id' => $tour->id,
                    'starts_at' => $start->toDateString(),
                    'ends_at' => $start->copy()->addDays($tour->duration_days - 1)->toDateString(),
                    'capacity' => $tour->max_group_size,
                    'seats_left' => mt_rand(2, $tour->max_group_size),
                ]);
            }
        }

        // FAQs
        $faqData = [
            ['q' => ['en' => 'What is included in the tour price?', 'fr' => 'Qu\'est-ce qui est inclus dans le prix ?'], 'a' => ['en' => 'All accommodations, guided game drives, park fees and most meals as specified in the itinerary.', 'fr' => 'Tous les hébergements, safaris guidés, droits de parc et la plupart des repas.']],
            ['q' => ['en' => 'What is your cancellation policy?', 'fr' => 'Quelle est votre politique d\'annulation ?'], 'a' => ['en' => 'Free cancellation up to 30 days before departure. After that, the deposit is non-refundable.', 'fr' => 'Annulation gratuite jusqu\'à 30 jours avant le départ. Après, l\'acompte n\'est pas remboursable.']],
            ['q' => ['en' => 'Can I book as a guest?', 'fr' => 'Puis-je réserver sans compte ?'], 'a' => ['en' => 'Yes! Book with just your email. We\'ll offer account creation after confirmation.', 'fr' => 'Oui ! Réservez avec votre email. Nous proposerons la création de compte après confirmation.']],
            ['q' => ['en' => 'What payment options are available?', 'fr' => 'Quelles options de paiement sont disponibles ?'], 'a' => ['en' => 'Pay in full or reserve with a 20% deposit, balance due 30 days before departure.', 'fr' => 'Paiement intégral ou acompte de 20%, solde dû 30 jours avant le départ.']],
            ['q' => ['en' => 'Do I need travel insurance?', 'fr' => 'Ai-je besoin d\'une assurance voyage ?'], 'a' => ['en' => 'We strongly recommend it  add it as an optional add-on during checkout.', 'fr' => 'Nous vous le recommandons  ajoutez-la comme option lors de la réservation.']],
        ];
        foreach ($faqData as $i => $faq) {
            Faq::create(['question' => $faq['q'], 'answer' => $faq['a'], 'position' => $i + 1, 'is_active' => true]);
        }
    }
}
