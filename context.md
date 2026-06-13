# GoKusafiri — Brief d'implémentation pour Claude Code

> **Objectif** : construire une plateforme de réservation de tours/safaris africains.
> **Stack imposée** : Laravel 13 (PHP 8.3+) · Inertia.js v2 + React 18 + Tailwind · Filament v5 (2 panels : operator + admin) · Docker.
> **Méthode** : suivre les phases dans l'ordre. À la fin de chaque phase, exécuter les vérifications listées avant de passer à la suivante. Committer par phase.

---

## 0. Contexte produit (résumé du design Figma + cahier des charges)

GoKusafiri vend des **tours** (circuits guidés avec départs datés) et des **packages** (tours enrichis : vols/lodges/repas inclus, prix bundlé, badge promo). Le site public est multilingue (EN/FR/ES), prix affichés en USD. Trois espaces :

1. **Portail client** (Inertia React) : accueil, listing avec filtres, détail tour, checkout 4 étapes, espace compte (My trips / Saved safaris / Profile), auth (email + Google + invité).
2. **Dashboard opérateur** (Filament, multi-tenant) : gestion de ses tours, départs, réservations, clients.
3. **Admin** (Filament) : modération, users, analytics, settings.

Particularités issues du design à implémenter obligatoirement :
- Réservation **invité possible** ("Continue as guest").
- Paiement **intégral ou acompte** (deposit ~20 %, solde dû à J-30).
- **Add-ons** par tour (ex : Airport transfers +$40/pers, Travel insurance +$89/pers, Sunrise balloon flight +$450/pers).
- Voyageurs détaillés par réservation (nom, date de naissance, pays, **passeport chiffré**).
- **Wishlist** ("Saved safaris", cœur sur les cartes).
- **Tier de membre** (ex : "Explorer") donnant une remise de 5 %.
- Badges et urgence sur les cartes : `BESTSELLER`, `NEW`, `20% OFF`, "Only 4 slots left this season", "Booked 20 times this week".
- Référence de réservation format `GKS-XXXXX`, PDF d'itinéraire téléchargeable, emails de cycle de vie.
- Annulation gratuite jusqu'à J-30 (paramétrable par tour).

**Paiement : aucun prestataire n'est encore choisi.** Construire toute la tuyauterie derrière une abstraction + un driver `fake` fonctionnel. Ne PAS intégrer de SDK Stripe/PayPal/Mobile Money. Voir §Phase 5.

---

## Phase 1 — Dockerisation & squelette du projet

### 1.1 Arborescence Docker

Créer à la racine :

```
docker/
  php/Dockerfile          # base php:8.3-fpm, extensions: pdo_mysql, redis, gd, intl, zip, opcache, bcmath, exif
  php/php.ini
  nginx/default.conf      # proxy vers app:9000, racine /var/www/public
compose.yaml              # dev
compose.prod.yaml         # prod (multi-stage, sans vite/mailpit)
Makefile                  # raccourcis: make up, make sh, make artisan cmd=..., make test
```

### 1.2 Services `compose.yaml` (dev)

| Service | Image / build | Rôle |
|---|---|---|
| `app` | build `docker/php` | PHP-FPM + code monté en volume |
| `nginx` | nginx:alpine, port 80 | Serveur web |
| `db` | mysql:8 (ou postgres:16) | Base, volume persistant |
| `redis` | redis:alpine | cache + queue + sessions |
| `horizon` | même image que app, cmd `php artisan horizon` | Workers |
| `scheduler` | même image, cmd `php artisan schedule:work` | Tâches planifiées |
| `node` | node:22-alpine, cmd `npm run dev -- --host` | Vite HMR (dev only) |
| `mailpit` | axllent/mailpit, ports 8025/1025 | Emails en dev |

`.env` : `DB_HOST=db`, `REDIS_HOST=redis`, `QUEUE_CONNECTION=redis`, `SESSION_DRIVER=redis`, `CACHE_STORE=redis`, `MAIL_HOST=mailpit`, `MAIL_PORT=1025`.

### 1.3 Création du projet

```bash
composer create-project laravel/laravel . "^13.0"
```

✅ **Vérifications** : `docker compose up -d` puis `curl localhost` retourne la page Laravel ; `make artisan cmd=about` montre Redis pour cache/queue/session ; Horizon accessible.

---

## Phase 2 — Dépendances & fondations

### 2.1 Composer

```bash
composer require inertiajs/inertia-laravel laravel/sanctum laravel/socialite \
  filament/filament:"^5.0" \
  spatie/laravel-permission spatie/laravel-translatable spatie/laravel-medialibrary \
  spatie/laravel-settings spatie/laravel-sluggable spatie/laravel-query-builder \
  spatie/laravel-activitylog spatie/laravel-sitemap spatie/laravel-model-states \
  spatie/laravel-backup barryvdh/laravel-dompdf laravel/horizon
composer require pestphp/pest pestphp/pest-plugin-laravel laravel/pint --dev
```

> Si un conflit de versions apparaît entre `filament/*` et `laravel/framework:^13.0`, installer la dernière 5.x (`composer require filament/filament:"^5.0" -W`) — les premières 5.x ne supportaient pas Laravel 13, les récentes oui. Ne JAMAIS redescendre sur Filament 3/4.

### 2.2 NPM

```bash
npm i react react-dom @inertiajs/react @vitejs/plugin-react
npm i tailwindcss @tailwindcss/vite laravel-vite-plugin
npm i laravel-react-i18n lucide-react clsx date-fns
npm i @react-google-maps/api
npm i -D vite typescript @types/react @types/react-dom
```

Configurer Inertia (middleware `HandleInertiaRequests`, `app.tsx` avec resolver de pages, **SSR activé** : `resources/js/ssr.tsx` + `php artisan inertia:start-ssr` dans le conteneur prod).

### 2.3 Auth & rôles

- Auth Inertia : login/register/forgot password (style Breeze mais pages custom, voir Phase 6) + **Socialite Google** (`/auth/google/redirect`, `/auth/google/callback`).
- `spatie/laravel-permission` : rôles `customer`, `operator`, `admin`. Seeder de rôles.
- Filament : deux panels via providers :
  - `php artisan make:filament-panel operator` → path `/operator`, `->tenant(Operator::class)`, accès rôle `operator`.
  - panel `admin` → path `/admin`, accès rôle `admin`, 2FA activée.

✅ **Vérifications** : `/login` rend une page Inertia React ; `/admin` et `/operator` affichent le login Filament ; un seeder crée admin@gokusafiri.test / operator / customer de démo.

---

## Phase 3 — Modèle de données (migrations + modèles + factories + seeders)

> Conventions : montants en **centimes (unsignedBigInteger)** + champ `currency` (default `USD`). Champs traduits = colonnes `json` avec `spatie/laravel-translatable` (`{en, fr, es}`). Tous les modèles ont factory + seeder réaliste (utiliser les contenus du design : Great Migration Explorer $2,290/7j Serengeti, Spice Island Escape Zanzibar, Root of Africa Trek Kilimanjaro, destinations Masai Mara/Victoria Falls/Cape Town/Sahara & Marrakech/Bwindi Forest).

### 3.1 Tables

```
users            : name, first/last, email, password nullable (OAuth), google_id, avatar,
                   locale (en|fr|es), country, phone, tier (enum: explorer|... default explorer),
                   newsletter_opt_in, passport_number (encrypted), passport_expiry, nationality
operators        : name, slug, email, phone, logo, is_approved
operator_user    : pivot (un user operator appartient à un operator) — tenant Filament
destinations     : name(json), slug, country, region(enum: east|southern|north|west|central),
                   image via medialibrary
tours            : operator_id, destination_id, type (enum: tour|package),
                   title(json), slug, excerpt(json), description(json),
                   itinerary(json: [{day, title{...}, body{...}}]),
                   included(json[]), excluded(json[]), inclusions(json: tags type Flights/Lodges/Meals),
                   base_price, currency, duration_days, max_group_size,
                   style(enum: safari|beach|mountain|culture|gorilla|honeymoon),
                   lat, lng, cancellation_days (default 30),
                   badge (enum nullable: bestseller|new), discount_percent nullable,
                   status (enum: draft|in_review|published), rating_cache, reviews_count_cache
tour_schedules   : tour_id, starts_at, ends_at, capacity, seats_left, price_override nullable
tour_addons      : tour_id, label(json), description(json), price_per_person, position
bookings         : reference (GKS-XXXXX unique), user_id nullable, tour_schedule_id,
                   lead_first/last_name, lead_email, lead_phone,
                   adults, children, infants,
                   subtotal, member_discount, taxes_fees, total, currency,
                   payment_plan (enum: full|deposit), deposit_amount, balance_due_at nullable,
                   status (state machine, voir 3.2), locale, expires_at (hold), confirmed_at
booking_travelers: booking_id, type(adult|child|infant), first/last_name, date_of_birth,
                   country, passport_number (encrypted cast), passport_file (medialibrary)
booking_addons   : booking_id, tour_addon_id, quantity, unit_price (figé)
payments         : booking_id, type (full|deposit|balance|refund), provider, provider_reference,
                   amount, currency, status (initiated|processing|succeeded|failed|refunded),
                   idempotency_key unique, payload(json), paid_at
reviews          : tour_id, user_id, booking_id, rating (1-5), body, location_label,
                   is_approved, traveled_at
wishlists        : user_id, tour_id (unique ensemble)
faqs             : question(json), answer(json), position, is_active
```

### 3.2 Machine à états Booking (`spatie/laravel-model-states`)

`Pending → DepositPaid | Paid → Confirmed → Completed` ; branches `Cancelled`, `Refunded`, `Expired`.
Transitions déclenchées uniquement par le domaine (paiement réussi, job d'expiration, action admin) — jamais directement par un contrôleur HTTP public.

### 3.3 Règles métier critiques

- **Anti-surbooking** : décrément de `seats_left` dans une transaction avec `lockForUpdate()` ; refus si insuffisant. Test de concurrence obligatoire.
- **Hold** : à la création d'un booking `Pending`, `expires_at = now + 20 min`, places décrémentées. Job `ReleaseExpiredBookings` (toutes les 5 min) repasse en `Expired` et ré-incrémente.
- **Prix** : service `BookingPriceCalculator` (testé unitairement) : (prix schedule × adultes) + (× enfants, plein tarif sauf règle contraire) + infants gratuits + add-ons − remise tier (5 % si user `explorer`) − discount_percent du tour + taxes/fees (paramètre settings, défaut fixe). Acompte = 20 % arrondi, `balance_due_at = starts_at − 30 jours`.
- **Référence** : `GKS-` + 5 chiffres/lettres, unique, générée à la création.
- **Rating cache** : observer sur Review approuvée → met à jour `rating_cache`/`reviews_count_cache` du tour.

✅ **Vérifications** : `php artisan migrate:fresh --seed` peuple ~15 tours/packages publiés, schedules sur 6 mois, reviews, faqs ; `php artisan test` vert sur les tests du calculateur et de l'anti-surbooking.

---

## Phase 4 — API/Contrôleurs du portail & logique backend

Routes web Inertia (groupe avec préfixe de locale optionnel `{locale?}` validé `en|fr|es`, middleware `SetLocale` : URL > session > Accept-Language ; persiste sur le user connecté).

```
GET  /                       HomeController            (sections accueil, cache Redis 10 min)
GET  /tours                  TourIndexController       (scope type=tour)
GET  /packages               TourIndexController       (scope type=package)
GET  /tours/{slug}           TourShowController
GET  /search                 SearchController          (destination, dates, voyageurs, style)
POST /wishlist/{tour}        toggle (auth) 
# Checkout
POST /booking/start          → crée booking Pending + hold, redirige étape 1
GET/POST /booking/{ref}/dates      étape 1 (départ, compteurs, add-ons)
GET/POST /booking/{ref}/travelers  étape 2 (lead + voyageurs)
GET/POST /booking/{ref}/payment    étape 3 (plan full/deposit, choix provider)
GET  /booking/{ref}/confirmation   étape 4
GET  /booking/{ref}/itinerary.pdf  PDF (dompdf, généré en queue puis stocké)
# Compte
GET  /account/trips | /account/saved | /account/profile  (+ updates)
POST /account/trips/{ref}/cancel   (respecte cancellation_days → refund via PaymentManager)
# Webhooks
POST /webhooks/payment/{provider}  (sans CSRF, signature vérifiée, traité en queue)
```

Détails d'implémentation :
- **Filtres listing** via `spatie/laravel-query-builder` : `filter[price_min|price_max|duration|region|style|deals|free_cancel|small_group]`, tris `recommended|price|rating|duration`. Compteurs de facettes cachés (Redis, clé par combinaison locale+filtres, TTL 10 min).
- **Urgence** : "Only X slots left" si `seats_left ≤ 5` sur le prochain départ ; "Booked N times this week" = count bookings confirmés 7 jours, caché.
- **Checkout invité** : `user_id` null autorisé ; après confirmation proposer la création de compte (lien signé rattachant le booking).
- **FormRequests** partout ; Policies (un client ne voit que ses bookings ; un invité accède via URL signée envoyée par email).

✅ **Vérifications** : tests Feature Pest couvrant le parcours complet invité et connecté (avec driver de paiement fake), l'expiration du hold, l'annulation avec remboursement.

---

## Phase 5 — Service de paiement (provider-agnostique, AUCUN SDK)

Le client choisira son agrégateur plus tard. Construire :

```
app/Services/Payment/
  Contracts/PaymentProviderInterface.php
  PaymentManager.php            # extends Illuminate\Support\Manager
  DTO/PaymentSession.php        # redirect_url | client_token, expires_at
  DTO/WebhookEvent.php          # provider_reference, status, raw payload
  Providers/FakeProvider.php    # driver par défaut
config/payment.php              # default => env('PAYMENT_DRIVER', 'fake')
```

```php
interface PaymentProviderInterface {
    public function initiate(Payment $payment): PaymentSession;   // crée la session côté prestataire
    public function verify(Payment $payment): PaymentStatus;      // vérité serveur-à-serveur
    public function refund(Payment $payment, ?int $amountCents = null): RefundResult;
    public function handleWebhook(Request $request): WebhookEvent; // vérifie la signature
}
```

**FakeProvider** : `initiate()` redirige vers une page interne `/fake-pay/{payment}` (3 boutons : Succeed / Fail / Stay processing) qui poste sur le webhook interne — le flux complet est ainsi démontrable en démo et testable.

Règles non négociables :
1. **Le webhook est la seule source de vérité.** Le retour navigateur affiche "processing" tant que le webhook n'a pas transitionné le paiement. (Indispensable pour le futur Mobile Money, asynchrone.)
2. **Idempotence** : `idempotency_key` unique sur payments ; rejouer un webhook ne change rien.
3. Paiement `succeeded` → events `PaymentSucceeded` → listener transitionne le booking (`Paid`→`Confirmed`, ou `DepositPaid` + planification du solde) → emails.
4. **Solde d'acompte** : commande planifiée quotidienne → bookings `DepositPaid` avec `balance_due_at ≤ J+7` → email avec **lien signé** de paiement du solde (réutilise initiate() avec un Payment type `balance`). Si impayé à la date : annulation auto + email.
5. Remboursement uniquement via `PaymentManager::refund()` (appelé par l'annulation client dans la fenêtre gratuite, ou par l'admin).
6. Brancher un vrai agrégateur plus tard = créer `Providers/XxxProvider.php` + entrée config + variables d'env. **Rien d'autre ne doit changer** — c'est un critère d'acceptation.

✅ **Vérifications** : suite Pest dédiée (full, deposit+balance, échec, webhook rejoué, refund) tournant 100 % sur FakeProvider.

---

## Phase 6 — Frontend React : réalisation du design Figma

### 6.1 Design system (Tailwind)

Tokens (extraits du Figma) dans le thème Tailwind :

```
colors: forest #2C4A3B (fonds sombres, boutons primaires sauge #7A9B8A en hover),
        cream #F7F5F0 (fond), terracotta #E07A3F (accents, badges, étoiles),
        ink #1F2937 (texte)
fonts:  display = "Playfair Display" ou "DM Serif Display" (titres serif du design),
        sans = "Inter" (corps, labels uppercase letter-spacing large)
radius: cartes 16px, boutons pill (full), inputs 10px
```

Composants partagés (`resources/js/Components/`) : `TourCard` (image, badge, cœur wishlist, lieu·durée, note ★, tags, "from $X", bouton Reserve, ligne d'urgence orange), `SearchBar` (Destination/Dates/Travelers/Experience, pill blanche avec ombre, sticky sous le header au scroll), `Stepper` (4 étapes numérotées), `BookingSummary` (carte sticky : image, dates, voyageurs, breakdown, total, encart vert "Free cancellation until…"), `RatingStars`, `FilterSidebar`, `Accordion`, `CounterInput` (− n +), `Badge`, `LanguageSwitcher` (**absent du design : l'ajouter au header et au footer**), `BottomNav` mobile (Explore/Saved/Login).

### 6.2 Pages (`resources/js/Pages/`)

| Page | Contenu fidèle au Figma |
|---|---|
| `Home` | Hero plein écran image safari, eyebrow "CURATED JOURNEYS · 14 AFRICAN COUNTRIES", titre serif "Into the heart of *wild Africa*" (italique terracotta), CTA "Explore safaris"/"How it works" ; SearchBar chevauchant le bas du hero ; barre de confiance (avatars, "25 travelers booked today", ★4.9 · 12k+ reviews, Free cancellation, Local expert guides) ; section "MOST BOOKED / Popular packages" (3 TourCards) ; section verte "EXPLORE / Find your kind of Africa" (chips de styles + mosaïque destinations avec compteurs) ; "WHY GOKUSAFIRI / Travel deeper, worry less" (4 features icônes) ; bandeau stats (120k+ / 14 / 4.9★) ; section verte témoignages "Loved by explorers" ; FAQ accordéon "Questions, answered" ; bandeau CTA dégradé "Your African story starts here" ; footer vert 4 colonnes |
| `Tours/Index` | Breadcrumb, titre, "{n} Tours · Free Cancellation on most", tris en pills, chips rapides (⚡Deals, Best value, Free cancel, Small group), sidebar filtres (prix min-max, durée par tranches avec compteurs, région, style), grille 2 col de TourCards, pagination. Même page scopée pour `/packages` |
| `Tours/Show` | Breadcrumb, galerie 1 grande + 2 petites, badge + ★4.9 · n reviews, titre serif, lieu, 4 quick-facts (Days/Max group/Camps/Meals), onglets Overview·Itinerary·What's included·Reviews (Itinerary inclut la **carte Google Maps** du tracé), colonne droite : widget réservation sticky (en-tête vert prix "from $X /person" + urgence, select départ avec slots, select voyageurs, breakdown avec Member discount orange, total, encart annulation, bouton Reserve) |
| `Booking/Dates` | Stepper (1 actif), header épuré "🔒 Secure checkout", cartes de départs radio (date + dispo + urgence), "Who's travelling?" avec 3 CounterInputs (Adults 13+/Children 2-12/Infants free), "Enhance your trip · optional" (add-ons checkbox avec prix /person), BookingSummary à droite, Continue |
| `Booking/Travelers` | Lead contact (prénom/nom/email/téléphone indicatif pays), cartes "Traveler n (Adult)" avec toggle "Same as lead contact", DOB, pays, passeport |
| `Booking/Payment` | "How would you like to pay?" : radio **Pay in full** ($X today · Save $Y vs deposit) / **Reserve with deposit** ($X today · remaining $Y due {date}) ; choix du moyen de paiement (rendu par le provider — avec FakeProvider : bouton "Continue to payment" vers la fake page) ; checkbox CGV ; Back / Continue |
| `Booking/Confirmation` | Check vert, "You're booked ! 🎉", "Confirmation #GKS-XXXXX sent to your email", carte "What happens next" (1 Check your email · 2 Upload travel documents · 3 Get ready to go), boutons "View my trip dashboard" / "Download Itinerary (PDF)" |
| `Auth/Login`, `Auth/Register`, `Auth/ForgotPassword` | Split-screen : gauche visuel girafe + citation + stats 120k+/14/4.9★, droite formulaire avec onglets Sign in/Create account, bouton "Continue with Google", force du mot de passe (register), "Keep me signed in", encart "Booking without an account ? → **Continue as guest**" |
| `Account/Trips` | Bandeau "Welcome back, {prénom} · Member since {année} · {Tier} tier" avec illustration gorille aviateur, sidebar (My trips/Saved safaris/Profile/Settings/Help/Sign out), 4 stat-cards (Upcoming/Completed/Countries/Tier), bannière verte "Next departure" (countdown "X days to go", Contact Guide, View Itinerary), onglets Upcoming/Past/Cancelled, cartes booking (View details / Modify) |
| `Account/Saved` | Grille des tours wishlistés (cœur plein) |
| `Account/Profile` | Personal information (photo "Change photo · JPG or PNG, max 5MB", noms, email, téléphone, pays), cartes Travel documents (passeport masqué `••••• 4821`, expiry, nationalité) et Security |

### 6.3 Responsive & i18n front

- Breakpoints mobiles designés : header burger + avatar, BottomNav fixe, cartes empilées, SearchBar compactée. Tester chaque page à 380 px.
- `laravel-react-i18n` : AUCUNE chaîne en dur dans les composants ; fichiers `lang/en|fr|es/*.json` complets dès le départ.
- Wishlist invité : état local (mémoire + cookie) fusionné côté serveur au login.

✅ **Vérifications** : parité visuelle avec les 16 écrans, navigation complète au clavier sur le checkout, SSR fonctionnel (`view-source` montre le contenu), Lighthouse mobile ≥ 90 sur Home et Tours/Show.

---

## Phase 7 — Panels Filament

### 7.1 Operator (`/operator`, multi-tenant sur Operator)

- `TourResource` : formulaire à onglets de langue (EN/FR/ES) pour les champs traduits ; sections : Général (type tour/package — si package, afficher inclusions + discount), Médias (medialibrary, collection gallery), Itinéraire (repeater day/title/body), Inclus/Exclus, Add-ons (relation repeater), Localisation (lat/lng + carte), Politique (cancellation_days), Publication (statut : l'opérateur ne peut passer qu'en `in_review`).
- `TourScheduleResource` (ou relation manager) : départs, capacité, prix override ; vue calendrier si plugin disponible, sinon table triée.
- `BookingResource` (lecture/gestion) : filtres statut/départ, page détail (voyageurs, add-ons, paiements, documents), actions : marquer check-in, demander remboursement (passe par PaymentManager), export CSV.
- Page Clients (users ayant réservé chez l'opérateur) + widgets dashboard : revenus du mois, taux de remplissage des prochains départs, prochaines échéances de solde.

### 7.2 Admin (`/admin`)

- Users (rôles, impersonate), Operators (approbation `is_approved`), Tours (modération `in_review → published` avec note de refus), Reviews (approbation), Destinations, FAQs, Pages.
- Settings (`spatie/laravel-settings`) : taxes/fees, % acompte, % remise tier, langues actives, driver de paiement, clé Google Maps, commission plateforme.
- Widgets analytics : réservations/jour (30 j), GMV, top 5 tours, répartition par plan de paiement, par locale ; funnel checkout (bookings créés vs confirmés).
- Activity log (spatie) sur Tours, Bookings, Settings.

✅ **Vérifications** : un opérateur ne voit QUE ses données (test multi-tenant) ; le workflow draft→in_review→published fonctionne de bout en bout.

---

## Phase 8 — Emails, jobs & PDF

Tous les Mailables sont traduits (locale du booking) et envoyés en queue. Templates aux couleurs du design (vert/crème/terracotta, logo).

| Déclencheur | Action |
|---|---|
| `BookingConfirmed` | Email confirmation + PDF itinéraire en PJ (dompdf : couverture image, récap, itinéraire jour/jour, contacts) |
| Acompte payé | Email avec échéancier + date du solde |
| Quotidien | `SendBalanceReminders` (J-37 → lien signé de paiement du solde), `CancelUnpaidBalances` (à `balance_due_at`), `SendDocumentReminders` (J-30 si passeports manquants), `SendPackingList` (J-14), `SendReviewInvites` (J+2 après `ends_at`), alerte passeport expirant avant un départ |
| Toutes les 5 min | `ReleaseExpiredBookings` |

✅ **Vérifications** : chaque mail visible dans Mailpit via un test Feature ; le PDF se génère en < 5 s et se télécharge depuis la confirmation et My trips.

---

## Phase 9 — SEO, sécurité, performance, qualité

- **SEO** : SSR ; `<title>`/meta/OG par page (composant Head) ; `hreflang` en/fr/es ; sitemap multilingue (spatie, régénéré nightly) ; JSON-LD `TouristTrip` + `Offer` + `AggregateRating` sur Tours/Show ; slugs propres.
- **Sécurité** : rate limiting (login 5/min, checkout, webhooks), 2FA Filament admin, headers CSP, validation signature webhook (même fake), casts `encrypted` vérifiés, policies testées, `spatie/laravel-backup` (DB nightly), pas de données carte côté serveur, RGPD : export + suppression de compte (anonymisation des bookings).
- **Performance** : cache Redis (home, facettes, compteurs), eager loading (vérifier N+1 avec `Model::shouldBeStrict()` en dev), conversions d'images WebP (thumb/card/hero) via medialibrary, code splitting par page Inertia.
- **Qualité** : Pint (CI), Pest avec couverture du domaine (calculateur, états, anti-surbooking, paiements fake, policies, parcours E2E invité/connecté), GitHub Actions : lint + tests sur chaque push.

---

## Phase 10 — Livraison

- `compose.prod.yaml` : image multi-stage (composer install --no-dev, npm build, opcache), conteneurs app/nginx/horizon/scheduler/ssr, healthchecks.
- `README.md` : installation en 5 commandes, comptes de démo, comment écrire un driver de paiement réel (exemple de squelette), comment ajouter une langue.
- Seeders de démo complets pour la recette client.

---

## Annexe — Décisions déjà arbitrées (ne pas re-discuter)

1. **Tour vs Package** : un seul modèle `Tour` avec `type` enum. Toute la logique de réservation passe par des méthodes du modèle (`price()`, `cancellationDeadline()`…) pour permettre un futur passage à un Bookable polymorphe sans refonte.
2. **Paiement** : abstraction + FakeProvider uniquement. Critère d'acceptation : ajouter un provider réel ne modifie que `app/Services/Payment/Providers/` + config + env.
3. **Montants** : centimes/integer, jamais de float.
4. **Webhook = source de vérité**, retour navigateur jamais suffisant.
5. **Multilingue** : EN par défaut, FR/ES complets dès la v1 (UI + contenus seedés + emails + PDF).
6. **Le design ne montre pas** : language switcher, option Mobile Money à l'étape paiement, carte Maps — les ajouter aux emplacements indiqués dans ce document.