<?php

namespace Database\Seeders;

use App\Models\Destination;
use App\Models\Operator;
use App\Models\Review;
use App\Models\Tour;
use App\Models\TourAddon;
use App\Models\TourSchedule;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TourSeeder extends Seeder
{
    public function run(): void
    {
        $operator = Operator::first();
        if (! $operator) {
            $this->command->error('No operator found  run DatabaseSeeder first.');
            return;
        }

        $tours = [

            // ── 1. Great Migration Explorer ────────────────────────────────────
            [
                'title'   => ['en' => 'Great Migration Explorer', 'fr' => 'Explorateur de la Grande Migration', 'es' => 'Explorador de la Gran Migración'],
                'excerpt' => [
                    'en' => 'Witness the legendary wildebeest migration across the Serengeti plains  one of nature\'s greatest spectacles.',
                    'fr' => 'Assistez à la légendaire migration des gnous dans les plaines du Serengeti  l\'un des plus grands spectacles de la nature.',
                ],
                'description' => [
                    'en' => '<p>Witness the world\'s greatest wildlife spectacle  over 2 million wildebeest, zebras and gazelles surging across the Serengeti in their annual cycle. This 7-day expedition puts you at the heart of the action: waiting at the Mara River crossings, tracking predators at dawn, and returning to a luxury tented camp as the savanna turns amber at dusk.</p><p>Your private guide is a third-generation Maasai ranger who reads the land like a map. Small groups (12 max) mean you\'re never in a convoy  just you, your safari vehicle, and the wild.</p>',
                    'fr' => '<p>Observez le plus grand spectacle faunique du monde  plus de 2 millions de gnous, zèbres et gazelles déferlant sur le Serengeti. Ce séjour de 7 jours vous place au cœur de l\'action : aux passages de la rivière Mara, à la traque des prédateurs à l\'aube, et retour dans un camp de luxe au coucher du soleil.</p>',
                ],
                'highlights' => [
                    'en' => [
                        ['icon' => 'user',      'title' => 'Private guide',       'subtitle' => 'Dedicated Maasai ranger'],
                        ['icon' => 'tent',      'title' => 'Luxury tented camps', 'subtitle' => '4★ mobile camps'],
                        ['icon' => 'utensils',  'title' => 'All meals included',  'subtitle' => 'Local & international cuisine'],
                        ['icon' => 'balloon',   'title' => 'Balloon option',      'subtitle' => 'Sunrise balloon add-on'],
                    ],
                    'fr' => [
                        ['icon' => 'user',      'title' => 'Guide privé',         'subtitle' => 'Ranger Maasai dédié'],
                        ['icon' => 'tent',      'title' => 'Camps de luxe',       'subtitle' => 'Camps mobiles 4★'],
                        ['icon' => 'utensils',  'title' => 'Tous les repas',      'subtitle' => 'Cuisine locale & internationale'],
                        ['icon' => 'balloon',   'title' => 'Option montgolfière', 'subtitle' => 'Montgolfière au lever du soleil'],
                    ],
                ],
                'itinerary' => [
                    'en' => [
                        ['day' => 1, 'title' => 'Arrival in Arusha',                'location' => 'Arusha, Tanzania',                   'meals' => 'D',     'description' => 'Welcome briefing with your guide. Transfer to Arusha lodge. Equipment check and safari orientation over sunset dinner.'],
                        ['day' => 2, 'title' => 'Serengeti Central  game drives',  'location' => 'Serengeti (Seronera)',                'meals' => 'B/L/D', 'description' => 'Fly to the Serengeti (Seronera). Afternoon game drive through the central plains. First big cat sightings: lions, cheetahs and leopards.'],
                        ['day' => 3, 'title' => 'Northern Serengeti  Mara River',  'location' => 'Northern Serengeti',                 'meals' => 'B/L/D', 'description' => 'Drive north to the Mara River. Wait at the crossing points for the thunderous wildebeest crossing  the most dramatic moment in nature.'],
                        ['day' => 4, 'title' => 'Full day Mara River crossings',    'location' => 'Mara River',                         'meals' => 'B/L/D', 'description' => 'Full day at the river. Optional sunrise balloon flight over the migration (add-on). Sundowner drinks on the savanna at dusk.'],
                        ['day' => 5, 'title' => 'Ngorongoro Crater descent',        'location' => 'Ngorongoro Conservation Area',       'meals' => 'B/L/D', 'description' => 'Drive to Ngorongoro. Descend into the world\'s largest intact volcanic caldera  a natural Noah\'s Ark with all Big Five within sight.'],
                        ['day' => 6, 'title' => 'Crater & Maasai village',          'location' => 'Ngorongoro / Maasai Boma',           'meals' => 'B/L/D', 'description' => 'Morning game drive in the crater. Afternoon visit a traditional Maasai boma  hear stories, share tea, learn about life on the plains.'],
                        ['day' => 7, 'title' => 'Departure',                        'location' => 'Arusha → Home',                      'meals' => 'B',     'description' => 'Final breakfast, farewell, and transfer to Kilimanjaro Airport. Your Africa story is just beginning.'],
                    ],
                    'fr' => [
                        ['day' => 1, 'title' => 'Arrivée à Arusha',                 'location' => 'Arusha, Tanzanie',                   'meals' => 'D',     'description' => 'Briefing d\'accueil avec votre guide. Transfert au lodge d\'Arusha. Vérification de l\'équipement et briefing safari autour d\'un dîner au coucher du soleil.'],
                        ['day' => 2, 'title' => 'Serengeti Central  game drives',  'location' => 'Serengeti (Seronera)',                'meals' => 'B/L/D', 'description' => 'Vol vers le Serengeti (Seronera). Safari de l\'après-midi dans les plaines centrales. Premières observations de grands félins : lions, guépards et léopards.'],
                        ['day' => 3, 'title' => 'Serengeti Nord  Rivière Mara',    'location' => 'Serengeti Nord',                     'meals' => 'B/L/D', 'description' => 'Direction nord vers la rivière Mara. Attente aux points de passage pour la spectaculaire traversée des gnous.'],
                        ['day' => 4, 'title' => 'Journée complète rivière Mara',    'location' => 'Rivière Mara',                       'meals' => 'B/L/D', 'description' => 'Journée entière au bord de la rivière. Vol en montgolfière en option. Sundowner sur la savane au crépuscule.'],
                        ['day' => 5, 'title' => 'Descente dans le cratère du Ngorongoro', 'location' => 'Zone de Conservation du Ngorongoro', 'meals' => 'B/L/D', 'description' => 'Route vers le Ngorongoro. Descente dans la plus grande caldeira volcanique intacte du monde  un refuge naturel avec les Big Five à portée de vue.'],
                        ['day' => 6, 'title' => 'Cratère & Village Maasai',         'location' => 'Ngorongoro / Boma Maasai',           'meals' => 'B/L/D', 'description' => 'Safari matinal dans le cratère. Visite d\'un boma Maasai traditionnel dans l\'après-midi.'],
                        ['day' => 7, 'title' => 'Départ',                           'location' => 'Arusha → Départ',                   'meals' => 'B',     'description' => 'Dernier petit-déjeuner, au revoir et transfert vers l\'aéroport du Kilimandjaro.'],
                    ],
                ],
                'included' => [
                    'en' => [
                        '6 nights accommodation (4★ camps)',
                        'All meals (breakfast, lunch, dinner)',
                        'Private English-speaking guide',
                        '4×4 safari vehicle with pop-up roof',
                        'All national park & conservation fees',
                        'All domestic transfers',
                        'Ngorongoro crater fees',
                        '24/7 on-trip support',
                    ],
                    'fr' => [
                        '6 nuits hébergement (camps 4★)',
                        'Tous les repas (petit-déjeuner, déjeuner, dîner)',
                        'Guide privé anglophone',
                        'Véhicule 4×4 avec toit ouvrant',
                        'Tous les droits nationaux & de conservation',
                        'Tous les transferts locaux',
                        'Droits cratère du Ngorongoro',
                        'Support 24/7 pendant le voyage',
                    ],
                ],
                'excluded' => [
                    'en' => ['International flights', 'Travel insurance', 'Balloon flight (optional add-on)', 'Personal expenses & tips', 'Visas & vaccinations'],
                    'fr' => ['Vols internationaux', 'Assurance voyage', 'Vol en montgolfière (option)', 'Dépenses personnelles & pourboires', 'Visas & vaccinations'],
                ],
                'inclusions' => ['en' => [['type' => 'Luxury Lodges', 'icon' => 'tent'], ['type' => 'All Meals', 'icon' => 'utensils'], ['type' => 'Expert Guide', 'icon' => 'user'], ['type' => 'Park Fees', 'icon' => 'ticket']]],
                'type' => 'tour', 'style' => 'safari', 'duration_days' => 7, 'base_price' => 229000,
                'max_group_size' => 12, 'dest_en' => 'Serengeti', 'badge' => 'bestseller',
                'status' => 'published', 'cancellation_days' => 30, 'lat' => -2.3333, 'lng' => 34.8333,
                'rating_cache' => 4.9, 'reviews_count_cache' => 412,
                'addons' => [
                    ['label' => ['en' => 'Sunrise Balloon Safari', 'fr' => 'Safari en montgolfière'], 'price_per_person' => 45000, 'description' => ['en' => 'Champagne breakfast included.', 'fr' => 'Petit-déjeuner champagne inclus.']],
                    ['label' => ['en' => 'Airport Transfers',     'fr' => 'Transferts aéroport'], 'price_per_person' => 4000],
                    ['label' => ['en' => 'Travel Insurance',      'fr' => 'Assurance voyage'],    'price_per_person' => 8900, 'description' => ['en' => 'Medical, cancellation & evacuation.', 'fr' => 'Médicale, annulation & évacuation.']],
                ],
                'reviews' => [
                    ['author_name' => 'Amara O.',  'rating' => 5, 'location_label' => 'Serengeti, 2025',   'traveled_at' => '2025-09-15', 'body' => '"The Migration crossing left us speechless. Our guide knew exactly where to be, every single day."'],
                    ['author_name' => 'James R.',  'rating' => 5, 'location_label' => 'Zanzibar, 2025',    'traveled_at' => '2025-07-22', 'body' => '"Booked in minutes, paid a deposit, and everything from flights to lodges just worked. Flawless."'],
                    ['author_name' => 'Lena M.',   'rating' => 5, 'location_label' => 'Kilimanjaro, 2024', 'traveled_at' => '2024-11-03', 'body' => '"Summiting Kilimanjaro with Gokusafiri was the trip of a lifetime. The crew made it feel safe."'],
                ],
            ],

            // ── 2. Masai Mara Big Five Safari ─────────────────────────────────
            [
                'title'   => ['en' => 'Masai Mara Big Five Safari', 'fr' => 'Safari des Cinq Grands du Masai Mara', 'es' => 'Safari de los Cinco Grandes del Masai Mara'],
                'excerpt' => ['en' => 'Track the Big Five across Kenya\'s most iconic reserve, with expert guides and exclusive private game drives.', 'fr' => 'Pistez les Big Five dans la réserve la plus emblématique du Kenya avec des guides experts.'],
                'description' => [
                    'en' => '<p>The Masai Mara National Reserve is Kenya\'s crown jewel of wildlife conservation. This 6-day safari takes you deep into lion country where you\'ll track the Big Five  lion, leopard, elephant, buffalo and rhino  across the open savanna grasslands.</p><p>Stay in intimate safari camps on the reserve boundary, with expert Maasai guides who\'ve spent their lives understanding the wildlife movements. Enjoy morning and evening game drives in private 4x4 vehicles, night drives (unique to private concessions), and optional bush walks.</p>',
                    'fr' => '<p>La Réserve Nationale du Masai Mara est le joyau de la faune kenyane. Ce safari de 6 jours vous emmène au cœur du territoire des lions où vous pisterez les Big Five à travers les savanes herbeuses.</p>',
                ],
                'highlights' => [
                    'en' => [
                        ['icon' => 'user',        'title' => 'Expert Maasai guide',   'subtitle' => 'Born & raised in the Mara'],
                        ['icon' => 'binoculars',  'title' => 'Night game drives',     'subtitle' => 'Exclusive in private concession'],
                        ['icon' => 'tent',        'title' => 'Intimate bush camps',   'subtitle' => 'Max 16 guests per camp'],
                        ['icon' => 'utensils',    'title' => 'All meals included',    'subtitle' => 'From bush breakfast to sundowners'],
                    ],
                    'fr' => [
                        ['icon' => 'user',        'title' => 'Guide Maasai expert',   'subtitle' => 'Né et élevé dans le Mara'],
                        ['icon' => 'binoculars',  'title' => 'Safaris nocturnes',     'subtitle' => 'Exclusif en concession privée'],
                        ['icon' => 'tent',        'title' => 'Camps intimes',         'subtitle' => 'Max 16 clients par camp'],
                        ['icon' => 'utensils',    'title' => 'Tous les repas',        'subtitle' => 'Du bush breakfast aux sundowners'],
                    ],
                ],
                'itinerary' => [
                    'en' => [
                        ['day' => 1, 'title' => 'Nairobi Arrival',              'location' => 'Nairobi, Kenya',         'meals' => 'D',     'description' => 'Arrive at Jomo Kenyatta International Airport. Transfer to your Nairobi hotel. Evening briefing dinner with your expedition leader.'],
                        ['day' => 2, 'title' => 'Fly to Masai Mara',           'location' => 'Masai Mara Reserve',     'meals' => 'B/L/D', 'description' => 'Morning flight to Wilson Airport, then a light aircraft to the Mara airstrip. Afternoon game drive into the heart of the reserve.'],
                        ['day' => 3, 'title' => 'Big Five Tracking',           'location' => 'Masai Mara Reserve',     'meals' => 'B/L/D', 'description' => 'Full day game drives with your expert Maasai guide. Focus on tracking lion prides, leopard sightings, and the famous Mara elephant herds.'],
                        ['day' => 4, 'title' => 'Private Concession & Night Drive', 'location' => 'OI Kinyei Conservancy', 'meals' => 'B/L/D', 'description' => 'Explore the private OI Kinyei Conservancy. Fewer tourists, more wildlife encounters. Exclusive night drive for nocturnal predators.'],
                        ['day' => 5, 'title' => 'Rhino Sanctuary & Bush Walk', 'location' => 'Mara North Conservancy', 'meals' => 'B/L/D', 'description' => 'Visit the rhino sanctuary  one of Kenya\'s last black rhino strongholds. Guided bush walk with armed ranger. Sundowner at a scenic hippo pool.'],
                        ['day' => 6, 'title' => 'Final Drive & Departure',     'location' => 'Nairobi',                'meals' => 'B',     'description' => 'Early morning final game drive at sunrise. Fly back to Nairobi for your international connection.'],
                    ],
                    'fr' => [
                        ['day' => 1, 'title' => 'Arrivée à Nairobi',           'location' => 'Nairobi, Kenya',         'meals' => 'D',     'description' => 'Arrivée à l\'aéroport international Jomo Kenyatta. Transfert vers l\'hôtel. Dîner de briefing.'],
                        ['day' => 2, 'title' => 'Vol vers le Masai Mara',      'location' => 'Réserve Masai Mara',     'meals' => 'B/L/D', 'description' => 'Vol matinal vers Wilson Airport, puis avion léger vers le Mara. Safari de l\'après-midi.'],
                        ['day' => 3, 'title' => 'Pistage des Big Five',        'location' => 'Réserve Masai Mara',     'meals' => 'B/L/D', 'description' => 'Safaris toute la journée avec votre guide Maasai expert.'],
                        ['day' => 4, 'title' => 'Concession privée & Safari nocturne', 'location' => 'Conservatoire OI Kinyei', 'meals' => 'B/L/D', 'description' => 'Explorez le conservatoire privé. Safari nocturne exclusif pour les prédateurs nocturnes.'],
                        ['day' => 5, 'title' => 'Sanctuaire des rhinocéros',   'location' => 'Conservatoire Mara North','meals' => 'B/L/D', 'description' => 'Visite du sanctuaire des rhinocéros. Promenade guidée dans la brousse.'],
                        ['day' => 6, 'title' => 'Dernier safari & Départ',     'location' => 'Nairobi',                'meals' => 'B',     'description' => 'Dernier safari matinal au lever du soleil. Vol retour à Nairobi.'],
                    ],
                ],
                'included' => [
                    'en' => ['All safari camp accommodation', 'All meals as per itinerary', 'Expert Maasai guide', 'Private 4x4 game vehicle', 'Internal flights (Nairobi–Mara–Nairobi)', 'Night drives', 'Park & conservancy fees'],
                    'fr' => ['Hébergement en camp safari', 'Tous les repas', 'Guide Maasai expert', 'Véhicule 4x4 privé', 'Vols internes', 'Safaris nocturnes', 'Droits de parc & conservatoire'],
                ],
                'excluded' => [
                    'en' => ['International flights', 'Travel insurance', 'Visa fees', 'Balloon safari', 'Personal expenses', 'Tips'],
                    'fr' => ['Vols internationaux', 'Assurance voyage', 'Frais de visa', 'Safari en montgolfière', 'Dépenses personnelles', 'Pourboires'],
                ],
                'inclusions' => ['en' => []],
                'type' => 'tour', 'style' => 'safari', 'duration_days' => 6, 'base_price' => 259000,
                'max_group_size' => 8, 'dest_en' => 'Masai Mara', 'badge' => null,
                'status' => 'published', 'cancellation_days' => 30, 'lat' => -1.5, 'lng' => 35.1,
                'rating_cache' => 4.8, 'reviews_count_cache' => 98,
                'addons' => [
                    ['label' => ['en' => 'Sunrise Balloon Safari', 'fr' => 'Safari en montgolfière'], 'price_per_person' => 42000, 'description' => ['en' => 'Float over the Mara at dawn.', 'fr' => 'Survolez le Mara à l\'aube.']],
                    ['label' => ['en' => 'Airport Transfers',     'fr' => 'Transferts aéroport'], 'price_per_person' => 4000],
                    ['label' => ['en' => 'Travel Insurance',      'fr' => 'Assurance voyage'],    'price_per_person' => 8900],
                ],
                'reviews' => [
                    ['author_name' => 'Sophie L.',  'rating' => 5, 'location_label' => 'Masai Mara, 2025', 'traveled_at' => '2025-08-10', 'body' => '"Seeing lions at sunrise from our private vehicle was unforgettable. Our guide David was extraordinary  patient, knowledgeable and passionate."'],
                    ['author_name' => 'Marcus T.',  'rating' => 5, 'location_label' => 'Nairobi, 2025',    'traveled_at' => '2025-06-18', 'body' => '"The night drive experience was unlike anything I\'ve ever done. We tracked a leopard for over an hour. Simply magical."'],
                    ['author_name' => 'Claire D.',  'rating' => 4, 'location_label' => 'London, 2024',     'traveled_at' => '2024-10-05', 'body' => '"Excellent organisation from start to finish. The camp was beautiful and food was superb. Would absolutely recommend."'],
                ],
            ],

            // ── 3. Gorilla Trekking Bwindi ─────────────────────────────────────
            [
                'title'   => ['en' => 'Gorilla Trekking Bwindi', 'fr' => 'Trekking des Gorilles à Bwindi', 'es' => 'Trekking de Gorilas en Bwindi'],
                'excerpt' => ['en' => 'A face-to-face encounter with endangered mountain gorillas in Bwindi Impenetrable Forest  the most profound wildlife experience on Earth.', 'fr' => 'Une rencontre face à face avec les gorilles de montagne en danger dans la forêt impénétrable de Bwindi.'],
                'description' => [
                    'en' => '<p>There are fewer than 1,000 mountain gorillas left in the world, and Bwindi Impenetrable Forest in southwest Uganda is home to almost half of them. Trekking through dense jungle to spend a magical hour with a wild gorilla family is one of the most humbling and extraordinary wildlife experiences on the planet.</p><p>Your trained trackers will locate a gorilla family, and you\'ll spend one precious hour observing mothers nursing infants, silverbacks displaying their power, and juveniles playing in the trees. Each permit guarantees your hour  so come prepared to be moved.</p>',
                    'fr' => '<p>Il reste moins de 1 000 gorilles de montagne dans le monde, et la forêt impénétrable de Bwindi en abrite presque la moitié. Progresser à travers la jungle dense pour passer une heure magique avec une famille de gorilles sauvages est l\'une des expériences les plus émouvantes.</p>',
                ],
                'highlights' => [
                    'en' => [
                        ['icon' => 'shield',    'title' => 'Gorilla permits included', 'subtitle' => '1 permit per person'],
                        ['icon' => 'user',      'title' => 'Expert trackers',          'subtitle' => 'UWA-certified team'],
                        ['icon' => 'tent',      'title' => 'Eco-lodge stay',           'subtitle' => 'Forest-edge luxury'],
                        ['icon' => 'camera',    'title' => '1 hr with the gorillas',   'subtitle' => 'Intimate small group'],
                    ],
                    'fr' => [
                        ['icon' => 'shield',    'title' => 'Permis gorilles inclus',   'subtitle' => '1 permis par personne'],
                        ['icon' => 'user',      'title' => 'Pisteurs experts',         'subtitle' => 'Équipe certifiée UWA'],
                        ['icon' => 'tent',      'title' => 'Éco-lodge',               'subtitle' => 'Luxe en lisière de forêt'],
                        ['icon' => 'camera',    'title' => '1h avec les gorilles',     'subtitle' => 'Petit groupe intime'],
                    ],
                ],
                'itinerary' => [
                    'en' => [
                        ['day' => 1, 'title' => 'Fly to Entebbe & Transfer',    'location' => 'Entebbe / Bwindi',           'meals' => 'D',     'description' => 'Arrive at Entebbe International Airport. Transfer to a luxury eco-lodge on the edge of Bwindi Forest. Briefing dinner.'],
                        ['day' => 2, 'title' => 'Gorilla Trekking',             'location' => 'Bwindi Impenetrable Forest', 'meals' => 'B/L/D', 'description' => 'Early start for gorilla trekking. Your expert tracker guides you through the forest. When you find the gorilla family, you\'ll have one magical hour with them.'],
                        ['day' => 3, 'title' => 'Village Walk & Bird Watching', 'location' => 'Buhoma Village',             'meals' => 'B/L/D', 'description' => 'Morning village walk with local Batwa community. Afternoon optional forest bird walk  over 350 species recorded in Bwindi.'],
                        ['day' => 4, 'title' => 'Departure via Entebbe',        'location' => 'Entebbe',                    'meals' => 'B',     'description' => 'Transfer back to Entebbe for your flight home, carrying memories that will last a lifetime.'],
                    ],
                    'fr' => [
                        ['day' => 1, 'title' => 'Vol vers Entebbe & Transfert', 'location' => 'Entebbe / Bwindi',           'meals' => 'D',     'description' => 'Arrivée à Entebbe. Transfert vers un éco-lodge de luxe en bordure de la forêt de Bwindi.'],
                        ['day' => 2, 'title' => 'Trekking des Gorilles',        'location' => 'Forêt Impénétrable de Bwindi','meals' => 'B/L/D', 'description' => 'Départ matinal pour le trekking. Une heure magique avec la famille de gorilles.'],
                        ['day' => 3, 'title' => 'Promenade & Observation des oiseaux', 'location' => 'Village de Buhoma', 'meals' => 'B/L/D', 'description' => 'Promenade matinale avec la communauté Batwa locale. Observation des oiseaux en option.'],
                        ['day' => 4, 'title' => 'Départ via Entebbe',          'location' => 'Entebbe',                    'meals' => 'B',     'description' => 'Transfert vers Entebbe pour votre vol retour.'],
                    ],
                ],
                'included' => [
                    'en' => ['Gorilla trekking permits (1 per person)', 'All accommodation (luxury forest lodges)', 'All meals as per itinerary', 'Expert tracker & guide', 'Airport transfers', 'Batwa community experience'],
                    'fr' => ['Permis de trekking gorilles', 'Hébergement (lodges de luxe en forêt)', 'Tous les repas', 'Pisteur & guide expert', 'Transferts aéroport', 'Expérience communauté Batwa'],
                ],
                'excluded' => [
                    'en' => ['International flights', 'Travel insurance', 'Visa fees', 'Personal expenses', 'Tips', 'Additional gorilla permits'],
                    'fr' => ['Vols internationaux', 'Assurance voyage', 'Frais de visa', 'Dépenses personnelles', 'Pourboires'],
                ],
                'inclusions' => ['en' => []],
                'type' => 'tour', 'style' => 'gorilla', 'duration_days' => 4, 'base_price' => 380000,
                'max_group_size' => 8, 'dest_en' => 'Bwindi Forest', 'badge' => 'bestseller',
                'status' => 'published', 'cancellation_days' => 45, 'lat' => -0.9833, 'lng' => 29.6,
                'rating_cache' => 5.0, 'reviews_count_cache' => 67,
                'addons' => [
                    ['label' => ['en' => 'Second Gorilla Trek', 'fr' => 'Deuxième trek gorilles'], 'price_per_person' => 85000, 'description' => ['en' => 'Additional gorilla permit for a second encounter.', 'fr' => 'Permis supplémentaire pour une deuxième rencontre.']],
                    ['label' => ['en' => 'Travel Insurance',   'fr' => 'Assurance voyage'],       'price_per_person' => 8900],
                    ['label' => ['en' => 'Airport Transfers',  'fr' => 'Transferts aéroport'],    'price_per_person' => 5000],
                ],
                'reviews' => [
                    ['author_name' => 'Nina P.',   'rating' => 5, 'location_label' => 'Bwindi, 2025',     'traveled_at' => '2025-03-20', 'body' => '"Meeting the gorilla family was beyond words. Watching the silverback walk right past us was humbling. An experience I\'ll never forget."'],
                    ['author_name' => 'Thomas K.', 'rating' => 5, 'location_label' => 'Uganda, 2025',     'traveled_at' => '2025-01-14', 'body' => '"Our tracker John was phenomenal  he found the gorillas in 90 minutes. The eco-lodge was beautiful. Worth every penny."'],
                ],
            ],

            // ── 4. Kilimanjaro Summit Trek ─────────────────────────────────────
            [
                'title'   => ['en' => 'Kilimanjaro Summit Trek', 'fr' => 'Ascension du Kilimandjaro', 'es' => 'Trekking a la Cima del Kilimanjaro'],
                'excerpt' => ['en' => 'Reach Uhuru Peak  the Roof of Africa  via the scenic Lemosho Route, with expert guides and full porter support.', 'fr' => 'Atteignez Uhuru Peak  le Toit de l\'Afrique  via la route panoramique Lemosho avec des guides experts.'],
                'description' => [
                    'en' => '<p>Standing at 5,895 metres above sea level, Mount Kilimanjaro is the highest peak in Africa and one of the world\'s Seven Summits. Our Lemosho Route is considered the most scenic and has the highest success rates due to the gradual acclimatisation profile.</p><p>You\'ll trek through five distinct climate zones  from rainforest to alpine desert  guided by our team of highly experienced mountain guides and supported by a full crew of trained porters who carry all equipment, cook your meals and ensure your safety every step of the way.</p>',
                    'fr' => '<p>À 5 895 mètres d\'altitude, le Kilimandjaro est le plus haut sommet d\'Afrique. Notre route Lemosho affiche les meilleurs taux de réussite grâce à un profil d\'acclimatation progressif à travers cinq zones climatiques distinctes.</p>',
                ],
                'highlights' => [
                    'en' => [
                        ['icon' => 'user',      'title' => 'Experienced guides',    'subtitle' => 'KPAP-certified team'],
                        ['icon' => 'shield',    'title' => 'Highest success rate',  'subtitle' => 'Lemosho  95% summit rate'],
                        ['icon' => 'star',      'title' => 'Full porter support',   'subtitle' => '1:1 ratio, fair wages'],
                        ['icon' => 'utensils',  'title' => 'All meals on mountain', 'subtitle' => 'Hot meals at every camp'],
                    ],
                    'fr' => [
                        ['icon' => 'user',      'title' => 'Guides expérimentés',   'subtitle' => 'Équipe certifiée KPAP'],
                        ['icon' => 'shield',    'title' => 'Meilleur taux de succès','subtitle' => 'Lemosho  95% au sommet'],
                        ['icon' => 'star',      'title' => 'Support porteurs complet','subtitle' => 'Ratio 1:1, salaires équitables'],
                        ['icon' => 'utensils',  'title' => 'Tous les repas',        'subtitle' => 'Repas chauds à chaque camp'],
                    ],
                ],
                'itinerary' => [
                    'en' => [
                        ['day' => 1, 'title' => 'Arrival & Briefing',              'location' => 'Arusha / Moshi',     'meals' => 'D',     'description' => 'Arrive in Arusha. Transfer to Moshi. Equipment check and mountain briefing. Early night before the climb.'],
                        ['day' => 2, 'title' => 'Lemosho Glades → Big Tree Camp',  'location' => '2,650m',             'meals' => 'B/L/D', 'description' => 'Enter the forest zone at Londorossi Gate. Trek through pristine montane forest to Big Tree Camp. Buffalo and colobus monkey sightings possible.'],
                        ['day' => 3, 'title' => 'Big Tree Camp → Shira 2',        'location' => '3,840m',             'meals' => 'B/L/D', 'description' => 'Emerge from the forest onto the spectacular Shira Plateau  a vast volcanic plateau with panoramic mountain views.'],
                        ['day' => 4, 'title' => 'Shira 2 → Lava Tower → Baranco', 'location' => '3,976m',            'meals' => 'B/L/D', 'description' => 'Classic acclimatisation day: climb high to Lava Tower (4,630m), then descend to Baranco Camp. Climb high, sleep low.'],
                        ['day' => 5, 'title' => 'Baranco Wall → Karanga Camp',    'location' => '4,035m',             'meals' => 'B/L/D', 'description' => 'Scramble up the famous Baranco Wall  a highlight of the Lemosho route. Stunning views across the Southern Ice Fields.'],
                        ['day' => 6, 'title' => 'Karanga → Barafu Base Camp',     'location' => '4,673m',             'meals' => 'B/L/D', 'description' => 'Short but steep ascent to Barafu. Rest and sleep as much as possible. Wake-up call at midnight for the summit.'],
                        ['day' => 7, 'title' => 'SUMMIT DAY  Uhuru Peak',        'location' => '5,895m → 3,100m',   'meals' => 'B/L/D', 'description' => 'Midnight start. Push through Stella Point to Uhuru Peak (5,895m)  the Roof of Africa. Celebrate, then descend to Millennium Camp.'],
                        ['day' => 8, 'title' => 'Descent & Departure',            'location' => 'Moshi',              'meals' => 'B/L',   'description' => 'Final descent through the forest to Mweka Gate. Receive your summit certificate. Transfer to Moshi for a well-earned celebration.'],
                    ],
                    'fr' => [
                        ['day' => 1, 'title' => 'Arrivée & Briefing',              'location' => 'Arusha / Moshi',     'meals' => 'D',     'description' => 'Arrivée à Arusha. Transfert à Moshi. Vérification de l\'équipement et briefing montagne.'],
                        ['day' => 2, 'title' => 'Lemosho Glades → Big Tree Camp',  'location' => '2 650m',             'meals' => 'B/L/D', 'description' => 'Entrée dans la zone forestière à Londorossi Gate. Trek dans la forêt de montagne.'],
                        ['day' => 3, 'title' => 'Big Tree Camp → Shira 2',        'location' => '3 840m',             'meals' => 'B/L/D', 'description' => 'Sortie de la forêt sur le spectaculaire plateau de Shira avec vues panoramiques.'],
                        ['day' => 4, 'title' => 'Shira 2 → Lava Tower → Baranco', 'location' => '3 976m',            'meals' => 'B/L/D', 'description' => 'Journée d\'acclimatation classique: montée à Lava Tower, descente au Camp Baranco.'],
                        ['day' => 5, 'title' => 'Mur Baranco → Camp Karanga',     'location' => '4 035m',             'meals' => 'B/L/D', 'description' => 'Escalade du célèbre mur Baranco, temps fort de la route Lemosho.'],
                        ['day' => 6, 'title' => 'Karanga → Camp de Base Barafu',  'location' => '4 673m',             'meals' => 'B/L/D', 'description' => 'Montée courte mais raide jusqu\'à Barafu. Repos avant le sommet.'],
                        ['day' => 7, 'title' => 'JOUR SOMMET  Uhuru Peak',       'location' => '5 895m → 3 100m',   'meals' => 'B/L/D', 'description' => 'Départ à minuit pour le sommet. Célébration au Toit de l\'Afrique, puis descente.'],
                        ['day' => 8, 'title' => 'Descente & Départ',              'location' => 'Moshi',              'meals' => 'B/L',   'description' => 'Descente finale jusqu\'à la porte Mweka. Certificat de sommet. Transfert à Moshi.'],
                    ],
                ],
                'included' => [
                    'en' => ['All mountain accommodation (tents & huts)', 'All meals on mountain', 'Experienced mountain guide', 'Trained porter team (1:1 ratio)', 'All park & rescue fees', 'Summit certificate', 'Oxygen & first-aid kit', 'Pre-climb briefing & gear check'],
                    'fr' => ['Hébergement montagne', 'Tous les repas en montagne', 'Guide de montagne expérimenté', 'Équipe de porteurs (ratio 1:1)', 'Droits de parc & secours', 'Certificat de sommet', 'Oxygène & trousse de secours'],
                ],
                'excluded' => [
                    'en' => ['International flights', 'Travel insurance', 'Climbing equipment (rental available)', 'Personal expenses', 'Tips for guide & porters', 'Hotel before/after'],
                    'fr' => ['Vols internationaux', 'Assurance voyage', 'Équipement d\'escalade (location dispo.)', 'Dépenses personnelles', 'Pourboires guide & porteurs'],
                ],
                'inclusions' => ['en' => []],
                'type' => 'tour', 'style' => 'mountain', 'duration_days' => 8, 'base_price' => 320000,
                'max_group_size' => 10, 'dest_en' => 'Kilimanjaro', 'badge' => null,
                'status' => 'published', 'cancellation_days' => 60, 'lat' => -3.0674, 'lng' => 37.3556,
                'rating_cache' => 4.8, 'reviews_count_cache' => 54,
                'addons' => [
                    ['label' => ['en' => 'Gear Rental Package',  'fr' => 'Pack location équipement'],  'price_per_person' => 15000, 'description' => ['en' => 'Sleeping bag, gaiters, trekking poles & headlamp.', 'fr' => 'Sac de couchage, guêtres, bâtons & lampe.']],
                    ['label' => ['en' => 'Travel Insurance',     'fr' => 'Assurance voyage'],          'price_per_person' => 9900, 'description'  => ['en' => 'Mountain-specific with high-altitude rescue.', 'fr' => 'Couverture montagne avec évacuation haute altitude.']],
                    ['label' => ['en' => 'Airport Transfers',    'fr' => 'Transferts aéroport'],       'price_per_person' => 4000],
                ],
                'reviews' => [
                    ['author_name' => 'Ben W.',    'rating' => 5, 'location_label' => 'Kilimanjaro, 2025', 'traveled_at' => '2025-02-18', 'body' => '"Reached the summit at sunrise  tears in my eyes. Our guide Charles was extraordinary, monitoring everyone for altitude sickness constantly."'],
                    ['author_name' => 'Priya S.',  'rating' => 5, 'location_label' => 'Tanzania, 2024',   'traveled_at' => '2024-08-22', 'body' => '"As a first-time high-altitude trekker I was nervous. The team made me feel completely supported. Made it to Uhuru Peak  incredible!"'],
                ],
            ],
        ];

        foreach ($tours as $data) {
            $existing = Tour::whereRaw("JSON_UNQUOTE(JSON_EXTRACT(title, '$.en')) = ?", [$data['title']['en']])->first();

            if ($existing) {
                $this->command->line('Updating: ' . $data['title']['en']);
                $this->updateExistingTour($existing, $data);
                $tour = $existing;
            } else {
                $dest = Destination::whereJsonContains('name->en', $data['dest_en'])->first();
                if (! $dest) {
                    $this->command->warn('Destination not found: ' . $data['dest_en']);
                    continue;
                }

                $tour = Tour::create([
                    'operator_id'        => $operator->id,
                    'destination_id'     => $dest->id,
                    'type'               => $data['type'],
                    'title'              => $data['title'],
                    'excerpt'            => $data['excerpt'],
                    'description'        => $data['description'],
                    'itinerary'          => $data['itinerary'],
                    'included'           => $data['included'],
                    'excluded'           => $data['excluded'],
                    'inclusions'         => $data['inclusions'],
                    'highlights'         => $data['highlights'],
                    'base_price'         => $data['base_price'],
                    'currency'           => 'USD',
                    'duration_days'      => $data['duration_days'],
                    'max_group_size'     => $data['max_group_size'],
                    'style'              => $data['style'],
                    'lat'                => $data['lat'],
                    'lng'                => $data['lng'],
                    'cancellation_days'  => $data['cancellation_days'],
                    'badge'              => $data['badge'],
                    'discount_percent'   => null,
                    'status'             => $data['status'],
                    'rating_cache'       => $data['rating_cache'],
                    'reviews_count_cache'=> $data['reviews_count_cache'],
                ]);

                foreach ($data['addons'] as $i => $addon) {
                    TourAddon::create([
                        'tour_id'          => $tour->id,
                        'label'            => $addon['label'],
                        'price_per_person' => $addon['price_per_person'],
                        'description'      => $addon['description'] ?? null,
                        'position'         => $i + 1,
                    ]);
                }

                for ($i = 1; $i <= 4; $i++) {
                    $start = Carbon::now()->addWeeks($i * 3);
                    TourSchedule::create([
                        'tour_id'    => $tour->id,
                        'starts_at'  => $start->toDateString(),
                        'ends_at'    => $start->copy()->addDays($tour->duration_days - 1)->toDateString(),
                        'capacity'   => $tour->max_group_size,
                        'seats_left' => mt_rand(2, $tour->max_group_size),
                    ]);
                }

                $this->command->info('Created: ' . $data['title']['en']);
            }

            // Seed reviews (skip if already exist)
            if ($tour->reviews()->where('is_approved', true)->count() === 0) {
                foreach ($data['reviews'] as $rev) {
                    Review::create([
                        'tour_id'        => $tour->id,
                        'user_id'        => null,
                        'rating'         => $rev['rating'],
                        'body'           => $rev['body'],
                        'author_name'    => $rev['author_name'],
                        'location_label' => $rev['location_label'],
                        'traveled_at'    => $rev['traveled_at'],
                        'is_approved'    => true,
                    ]);
                }
            }
        }
    }

    private function updateExistingTour(Tour $tour, array $data): void
    {
        $tour->update([
            'description'        => $data['description'],
            'itinerary'          => $data['itinerary'],
            'included'           => $data['included'],
            'excluded'           => $data['excluded'],
            'inclusions'         => $data['inclusions'],
            'highlights'         => $data['highlights'],
            'rating_cache'       => $data['rating_cache'],
            'reviews_count_cache'=> $data['reviews_count_cache'],
        ]);
    }
}
