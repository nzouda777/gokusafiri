# GokuSafiri — Project Deep-Dive

> Ce fichier est une référence complète du projet. Il explique chaque couche de l'architecture, comment les fichiers se parlent entre eux, le flux de paiement en plusieurs fois, les emails de notification, et comment mettre en place le service mail + les workers en production. Lis-le de haut en bas une fois, puis sers-t'en comme référence.

---

## Table des matières

1. [Vue d'ensemble du projet](#1-vue-densemble)
2. [Base de données — schéma](#2-base-de-données--schéma)
3. [Contrôleurs — ce que chacun fait](#3-contrôleurs)
4. [Pages frontend — ce que chacune affiche](#4-pages-frontend)
5. [Composants React réutilisables](#5-composants-react)
6. [Services & couche métier](#6-services--couche-métier)
7. [State machine — cycle de vie d'une réservation](#7-state-machine--cycle-de-vie-dune-réservation)
8. [Jobs & tâches planifiées](#8-jobs--tâches-planifiées)
9. [Flux de réservation complet (étape par étape)](#9-flux-de-réservation-complet)
10. [Paiement en plusieurs fois — comment ça marche](#10-paiement-en-plusieurs-fois)
11. [Emails de notification — quand et quoi envoyer](#11-emails-de-notification)
12. [Configuration du service mail en production](#12-configuration-du-service-mail-en-production)
13. [Queue workers — mise en place complète](#13-queue-workers--mise-en-place-complète)
14. [Guide pour prendre la main rapidement](#14-guide-pour-prendre-la-main-rapidement)

---

## 1. Vue d'ensemble

**GokuSafiri** est une plateforme de réservation de safaris en Afrique, multi-langues (EN/FR/ES), avec :

- Un **site public** (Next.js-style SPA via Inertia.js + React) pour les clients
- Un **backoffice Filament** pour les admins (`/admin`) et opérateurs (`/operator`)
- Un **système de paiement Stripe** supportant le paiement intégral et le paiement par acompte (20% maintenant + solde avant départ)
- Un **système de notifications email** par queue Laravel Horizon (Redis)

### Stack technologique

| Couche | Technologie |
|--------|-------------|
| Backend | Laravel 13 (PHP 8.4) |
| Frontend SPA | Inertia.js v2 + React 19 |
| Styles | Tailwind CSS v4 |
| Backoffice | Filament v5 |
| Base de données | MySQL 8 |
| Cache + Queue | Redis + Laravel Horizon |
| Paiement | Stripe (PaymentIntents) |
| Stockage médias | Spatie MediaLibrary |
| Traductions modèles | Spatie Translatable |
| Permissions | Spatie Permission |
| Envoi emails | Laravel Mailer (SMTP/SES/Mailgun) |

### Arborescence principale

```
app/
  Http/Controllers/     ← Contrôleurs web (public + auth + account + booking + payment)
  Models/               ← Modèles Eloquent
  Services/             ← Logique métier (prix, transitions de réservation)
  Jobs/                 ← Tâches asynchrones (expiration, rappels de solde)
  States/Booking/       ← Machine à états de la réservation (Spatie ModelStates)
  Observers/            ← ReviewObserver (mise à jour rating_cache)
  Mail/                 ← Classes Mailable (à créer — voir section 11)
  Notifications/        ← Notifications Laravel (à créer — voir section 11)

resources/js/
  Pages/                ← Pages React rendues par Inertia
  Components/           ← Composants React réutilisables
  types/index.d.ts      ← Types TypeScript partagés

routes/
  web.php               ← Toutes les routes (locale prefix + auth + payment webhooks)

lang/
  en.json               ← Traductions EN
  fr.json               ← Traductions FR
  es.json               ← Traductions ES

database/
  migrations/           ← 21 fichiers de migration
```

---

## 2. Base de données — schéma

Toutes les **montants sont en centimes** (integer). Les champs multi-langues sont en **JSON** (Spatie Translatable).

### Tables et colonnes clés

#### `users`
```
id, first_name, last_name, email, password (nullable), google_id
locale (en|fr|es), country (2 chars), phone, tier (explorer)
newsletter_opt_in (bool), passport_number (encrypted), passport_expiry (date)
nationality, email_verified_at
```

#### `tours`
```
id, operator_id → operators, destination_id → destinations
type (tour|package), title (JSON), slug (unique), excerpt (JSON)
description (JSON), itinerary (JSON), included (JSON), excluded (JSON)
inclusions (JSON), highlights (JSON)
base_price (cents), currency, duration_days, max_group_size
style (safari|beach|mountain|culture|gorilla|honeymoon)
cancellation_days (default 30), badge (bestseller|new), discount_percent
status (draft|in_review|published)
rating_cache (decimal), reviews_count_cache
```

#### `tour_schedules`
```
id, tour_id, starts_at (date), ends_at (date)
capacity, seats_left, price_override (cents, nullable)
```

#### `bookings` ← table centrale
```
id, reference (GKS-XXXXX, unique)
user_id (nullable — guest checkout), tour_schedule_id
lead_first_name, lead_last_name, lead_email, lead_phone
adults, children, infants
subtotal (cents), member_discount (cents), taxes_fees (cents)
total (cents), currency, payment_plan (full|deposit)
deposit_amount (cents), balance_due_at (timestamp, nullable)
status (machine à états: Pending → Confirmed → Completed | Cancelled → Refunded)
expires_at (timestamp, 20 min depuis création)
confirmed_at (timestamp)
stripe_customer_id, stripe_payment_method_id
special_request (text)
```

#### `payments`
```
id, booking_id, type (full|deposit|balance|refund)
provider (stripe|fake), provider_reference (Stripe PI id)
amount (cents), currency, status (initiated|processing|succeeded|failed|refunded)
idempotency_key (unique), payload (JSON raw Stripe data), paid_at
```

#### `booking_travelers`
```
id, booking_id, type (adult|child|infant|lead)
first_name, last_name, date_of_birth, country, passport_number (encrypted)
```

#### `booking_addons`
```
id, booking_id, tour_addon_id, quantity, unit_price (cents, snapshot au moment de la réservation)
```

#### `wishlists`
```
id, user_id, tour_id   [UNIQUE (user_id, tour_id)]
```

#### `reviews`
```
id, tour_id, user_id, booking_id, rating (1-5), body
author_name, is_approved (bool, default false), traveled_at (date)
```

---

## 3. Contrôleurs

### Contrôleurs publics

#### `HomeController` — `app/Http/Controllers/HomeController.php`
**Route** : `GET /`

Charge les 3 meilleures packages publiées, les destinations, témoignages, FAQs (depuis la DB avec fallback locale). Depuis la mise à jour récente, charge aussi les IDs de la wishlist de l'utilisateur connecté en une seule requête pour injecter `is_wishlisted` sur chaque tour.

```php
// Pattern de chargement de la wishlist
$wishlistedIds = $request->user()
    ? $request->user()->wishlists()->pluck('tour_id')->flip()->all()
    : [];
// → flip() transforme [12, 45] en [12 => 0, 45 => 1] pour lookup O(1)
// Ensuite dans formatTour():
'is_wishlisted' => isset($wishlistedIds[$tour->id]),
```

#### `TourIndexController` — `app/Http/Controllers/TourIndexController.php`
**Routes** : `GET /tours` et `GET /packages`

Filtre + pagination (12 par page). Filtres disponibles : `q` (texte libre), `destination` (slug), `region`, `style`, `duration` (tranches), `max_price`, `rating`, `quick` (deals/free_cancel/small_group/best_value). Même logique de wishlist que HomeController.

#### `TourShowController` — `app/Http/Controllers/TourShowController.php`
**Route** : `GET /tours/{slug}`

Charge le tour complet : galerie, schedules futurs, addons, reviews approuvées, `is_wishlisted` (1 requête). Passe tout à la page `Tours/Show`.

#### `SearchController` — `app/Http/Controllers/SearchController.php`
**Route** : `GET /search`

Reçoit les params du SearchBar (destination, dates, travelers, experience) et redirige vers `/tours` avec les filtres appropriés.

#### `WishlistController` — `app/Http/Controllers/WishlistController.php`
**Route** : `POST /wishlist/{tour}` (auth requise)

Toggle : si le tour est déjà dans la wishlist → supprime et retourne `{"wishlisted": false}`. Sinon → crée et retourne `{"wishlisted": true}`. L'UI React fait une mise à jour optimiste (le cœur change immédiatement, se revert en cas d'erreur réseau).

#### `ReviewController` — `app/Http/Controllers/ReviewController.php`
**Route** : `POST /tours/{slug}/reviews` (auth requise)

Crée un review (rating 1-5, body 20-2000 chars) avec `is_approved=false`. Le `ReviewObserver` se déclenche après création pour mettre à jour `rating_cache` et `reviews_count_cache` sur le Tour dès que le review est approuvé.

---

### Contrôleurs de réservation (`Booking/`)

Le flux de checkout est une suite de 4 étapes. Chaque étape a un contrôleur dédié avec `show()` (GET) et `update()` (POST).

#### `BookingController` — `Booking/BookingController.php`
- **`start(POST)`** : Point d'entrée du checkout. Reçoit `tour_id`, `schedule_id`, `adults`, `children`, `infants`, `pay_full`. Crée une réservation `Pending` avec référence `GKS-XXXXX`, calcule le prix via `BookingPriceCalculator`, pose un hold de 20 min (`expires_at`), décrémente `seats_left`. Redirige vers `/booking/{ref}/dates`.
- **`confirmation(GET)`** : Page de succès post-paiement. Charge la réservation confirmée et passe les données à `Booking/Confirmation`.
- **`itineraryPdf(GET)`** : Stub PDF (à implémenter avec Spatie/Browsershot ou DomPDF).

#### `BookingDatesController` — `Booking/BookingDatesController.php`
- **`show(GET)`** : Étape 1 — affiche les dates disponibles, compteurs de voyageurs, addons.
- **`update(POST)`** : Sauvegarde le schedule choisi, recalcule le prix, crée le BookingTraveler "lead".

#### `BookingTravelersController` — `Booking/BookingTravelersController.php`
- **`show(GET)`** : Étape 2 — formulaire pour le contact principal + voyageurs supplémentaires.
- **`update(POST)`** : Sauvegarde `lead_first_name`, `lead_last_name`, `lead_email`, `lead_phone`, `special_request`. Crée/met à jour les enregistrements `BookingTraveler`.

#### `BookingPaymentController` — `Booking/BookingPaymentController.php`
- **`show(GET)`** : Étape 3 — crée un Stripe PaymentIntent, passe le `client_secret` à React. L'UI React utilise Stripe Elements pour collecter la carte.
- **`updatePlan(POST)`** : Change le plan (full → deposit ou inverse). Annule le PaymentIntent en cours, en crée un nouveau avec le nouveau montant.
- **`complete(GET)`** : Appelé après redirection Stripe (3DS/banque). Vérifie le statut du PI via l'API Stripe, met à jour le Payment en DB, appelle `BookingTransitionService::onPaymentSucceeded()`.
- **`payBalance(GET, signed URL)`** : Charge automatiquement la carte sauvegardée pour le solde restant. L'URL est signée (Laravel signed URL) pour sécurité — impossible à falsifier.

---

### Contrôleurs de paiement (`Payment/`)

#### `WebhookController` — `Payment/WebhookController.php`
**Route** : `POST /webhooks/payment/stripe` (exclue du CSRF)

**C'est le point de vérité pour tout paiement.** Stripe envoie un événement signé → le contrôleur vérifie la signature HMAC avec `STRIPE_WEBHOOK_SECRET` → extrait le PaymentIntent → met à jour le Payment en DB → appelle `BookingTransitionService`.

Ne jamais se fier uniquement à la réponse du frontend pour confirmer un paiement — toujours attendre le webhook.

#### `FakePayController` — `Payment/FakePayController.php`
Uniquement en dev (`PAYMENT_DRIVER=fake`). Affiche un formulaire avec boutons "Approve" / "Decline" qui simule un webhook.

---

### Contrôleurs de compte (`Account/`)

#### `TripsController` — `Account/TripsController.php`
Liste les réservations de l'utilisateur par onglet (upcoming/past/cancelled). Calcule les stats (nb pays visités, tier). Permet d'annuler une réservation.

#### `SavedController` — `Account/SavedController.php`
Liste les tours en wishlist de l'utilisateur. Tous marqués `is_wishlisted: true`.

#### `ProfileController` — `Account/ProfileController.php`
Affiche et met à jour le profil (first_name, last_name, email, phone, country).

---

### Contrôleurs d'authentification (`Auth/`)

| Contrôleur | Ce qu'il fait |
|------------|---------------|
| `LoginController` | Formulaire connexion + authentification |
| `RegisterController` | Formulaire inscription + création compte |
| `SocialAuthController` | Redirection Google + callback (crée user si nouveau) |
| `ForgotPasswordController` | Envoi lien de réinitialisation |
| `ResetPasswordController` | Validation token + nouveau mot de passe |

---

## 4. Pages frontend

Chaque page React reçoit ses données via les props Inertia passées par le contrôleur.

### Pages publiques

#### `Pages/Home.tsx`
**Props** : `featured` (3 tours), `destinations`, `testimonials`, `faqs`, `stats`

Sections : Hero (gradient + image + titre serif/italic), SearchBar dockée en bas du hero (cachée sur mobile), Trust bar, "Most booked" (3 TourCards), Explore (style chips + bento grid de destinations), "Why Gokusafiri" (4 features), Stats banner, Témoignages, FAQ accordéons, CTA final.

#### `Pages/Tours/Index.tsx`
**Props** : `tours` (paginated), `filters`, `totalCount`, `isPackages`

Barre de recherche sticky (devient statique sur mobile), breadcrumb, titre, sort pills, quick-filter chips, sidebar filtres (drawer fixe sur mobile), grille 2 colonnes de TourCards, pagination.

**Pattern de filtre** : chaque changement de filtre appelle `router.get(basePath, cleanFilters, { preserveState: true })` — Inertia fait une requête partielle, ne rechargera que les props `tours`.

#### `Pages/Tours/Show.tsx`
**Props** : `tour` (complet avec schedules, addons, reviews)

Galerie, onglets (Overview / Inclusions / Reviews), widget de réservation sticky à droite (schedule selector, compteurs voyageurs, addons, récap prix, bouton Reserve → `POST /booking/start`).

### Pages de checkout

Toutes wrappées dans `CheckoutLayout` (stepper 4 étapes, BookingSummary à droite).

#### `Pages/Booking/Dates.tsx`
Étape 1 : sélection départ (radio cards avec date + dispo), compteurs voyageurs, addons optionnels.

#### `Pages/Booking/Travelers.tsx`
Étape 2 : formulaire contact principal + info voyageurs (toggle "Same as lead contact?").

#### `Pages/Booking/Payment.tsx`
Étape 3 : radio "Pay in full" / "Reserve with deposit", formulaire Stripe Elements (CardElement), checkbox "Save card for balance payment", Terms checkbox.

#### `Pages/Booking/Confirmation.tsx`
Étape 4 : ✅ succès, numéro de réservation, "What happens next" (3 étapes : check email, upload docs, pack your bags), liens vers trip dashboard et PDF itinéraire.

### Pages compte

#### `Pages/Account/Trips.tsx`
Banner de bienvenue, 4 stat-cards (Upcoming/Completed/Countries/Tier), banner "Next departure" avec compte à rebours, onglets Upcoming/Past/Cancelled, booking cards.

#### `Pages/Account/Saved.tsx`
Grille de TourCards toutes avec cœur plein.

#### `Pages/Account/Profile.tsx`
Avatar upload, champs profil, section "Travel documents" (passeport masqué), section "Security" (changer mot de passe).

### Pages auth

`Auth/Login.tsx`, `Auth/Register.tsx`, `Auth/ForgotPassword.tsx` — layout split-screen avec visuel gauche + formulaire droit, bouton Google OAuth.

---

## 5. Composants React

#### `AppLayout.tsx`
Wrapper global pour toutes les pages publiques. Header sticky (logo, nav, langue switcher, auth actions, menu mobile), Footer 4 colonnes.

**Comment la langue switcher fonctionne** : clique sur un flag → `router.visit('/{locale}/...')` avec le même chemin mais locale différente → middleware `SetLocale` change `app()->getLocale()` → `HandleInertiaRequests` renvoie la nouvelle locale dans les shared props → `I18nLocaleSync` appelle `setLocale()` côté React.

#### `TourCard.tsx`
Carte tour pour les listes. Image avec hover scale, badge (remise % ou NEW), bouton cœur wishlist (haut droite), titre, localisation, durée, rating, tags inclusions, prix, urgence (seats_left ≤ 5 ou booked_this_week), bouton Reserve.

**Wishlist** : `useState(tour.is_wishlisted ?? false)` pour l'état local. Clic → toggle local immédiat (optimiste) + `fetch('/wishlist/{id}', { method: 'POST' })`. Revert si erreur.

#### `SearchBar.tsx`
4 champs dans un pill (destination, dates, travelers, experience). Sur mobile (`< md`) : empilés verticalement + chaque popover devient un **bottom sheet** (position fixed en bas de l'écran, avec backdrop sombre et drag handle). Sur desktop : layout horizontal + popovers absolus. Calendrier : 1 mois sur mobile, 2 sur desktop (via `useState isMobile` + listener resize).

#### `CheckoutLayout.tsx`
Wrapper étapes checkout. Stepper 4 étapes à gauche, `BookingSummary` sticky à droite.

#### `BookingSummary.tsx`
Sidebar récap de commande : image tour, titre, dates, voyageurs, breakdown prix (subtotal, addons, remise membre en orange, taxes, **total** en vert), acompte ou solde restant, badge "Free cancellation until [date]".

#### `AccountLayout.tsx`
Layout pages compte. Sidebar gauche (avatar, nom, tier, navigation), contenu principal à droite.

#### `CounterInput.tsx`
Sélecteur numérique (−/+) avec min/max. Utilisé pour adultes/enfants/bébés.

---

## 6. Services & couche métier

#### `BookingPriceCalculator` — `app/Services/BookingPriceCalculator.php`
Calcule le prix complet d'une réservation :
- **Subtotal** = `schedule.effectivePrice()` × nombre_voyageurs + addons
- **Member discount** = 5% si tier = 'explorer', sinon 0%
- **Taxes/fees** = 0.8% de (subtotal + addons - remise)
- **Total** = subtotal - remise + taxes
- **Deposit (20%)** = total × 0.20

#### `BookingTransitionService` — `app/Services/BookingTransitionService.php`
Logique de transition d'état après un paiement réussi :

```
Paiement acompte (deposit) :
  Pending → DepositPaid → Confirmed

Paiement intégral depuis Pending :
  Pending → Paid → Confirmed

Paiement du solde depuis DepositPaid :
  DepositPaid → Confirmed

Dans tous les cas : confirmed_at = now()
```

#### `PaymentManager` — `app/Services/Payment/PaymentManager.php`
Driver factory pour les prestataires de paiement. Actuellement : `fake` (dev) et `stripe` (prod). L'interface `PaymentProviderInterface` définit : `initiate()`, `verify()`, `refund()`, `handleWebhook()`.

---

## 7. State machine — cycle de vie d'une réservation

```
                    ┌──────────────────────────────────────────────────┐
                    │                                                  │
         ┌──────────▼──────────┐                                      │
         │       Pending        │  ← Créé au départ (20 min pour payer)│
         └──┬───────┬─────┬────┘                                      │
            │       │     │                                            │
      timeout│  acompte│ full│                                         │
            │       │     │                                            │
            ▼       ▼     ▼                                            │
        Expired  DepositPaid  Paid                                     │
                    │            │                                     │
                auto-confirm     auto-confirm                          │
                    │            │                                     │
                    └─────┬──────┘                                     │
                          │                                            │
                          ▼                                            │
                     Confirmed  ←─────────────────────────────────────┘
                          │
               ┌──────────┴──────────┐
               │                     │
         (après voyage)          (annulation)
               │                     │
               ▼                     ▼
           Completed            Cancelled
                                     │
                                 (remboursement)
                                     │
                                     ▼
                                  Refunded
```

Les états sont dans `app/States/Booking/` (Spatie ModelStates). Les transitions sont déclarées dans chaque classe d'état.

---

## 8. Jobs & tâches planifiées

Définis dans `app/Console/Kernel.php` (ou `routes/console.php` selon la version Laravel).

#### `ReleaseExpiredBookings` — toutes les 5 minutes
- Trouve les réservations `Pending` dont `expires_at ≤ now()`
- Transitions `Pending → Expired`
- Rend les places (re-incrémente `seats_left` sur le schedule)
- Transaction DB + `lockForUpdate()` pour éviter les races conditions

#### `SendBalanceReminders` — chaque jour
- Trouve les réservations `DepositPaid` dont `balance_due_at` est dans les 7 prochains jours
- Envoie un email avec un lien signé vers `/booking/{booking}/pay-balance`
- Le lien signé est valide pour une durée limitée (ex: 48h) et auto-charge la carte sauvegardée

#### `CancelUnpaidBalances` — chaque jour
- Trouve les réservations `DepositPaid` dont `balance_due_at ≤ aujourd'hui`
- Annule la réservation (`Confirmed → Cancelled`)
- Lance un remboursement partiel ou intégral selon la politique d'annulation
- Envoie un email d'annulation au client

---

## 9. Flux de réservation complet

Voici exactement ce qui se passe de A à Z quand un client réserve :

### 1. Le client choisit un tour
Page `/tours/{slug}` → widget sticky à droite → sélectionne schedule, voyageurs, addons → clic "Reserve".

### 2. `POST /booking/start`
`BookingController::start()` :
- Valide les données
- Calcule le prix (`BookingPriceCalculator`)
- Crée `Booking` (status = `Pending`, `expires_at` = now + 20 min, référence `GKS-XXXXX`)
- Décrémente `seats_left` sur le schedule
- Redirige vers `/booking/{ref}/dates`

### 3. Étape Dates (GET + POST `/booking/{ref}/dates`)
Client confirme ou change la date + voyageurs + addons. `BookingDatesController::update()` recalcule le prix, sauvegarde.

### 4. Étape Travelers (GET + POST `/booking/{ref}/travelers`)
Client entre ses infos + celles des voyageurs. `BookingTravelersController::update()` sauvegarde `lead_*` sur le booking + crée les `BookingTraveler`.

### 5. Étape Payment (GET `/booking/{ref}/payment`)
`BookingPaymentController::show()` :
- Récupère ou crée le `Stripe Customer` par email
- Crée un `PaymentIntent` Stripe (montant = total ou deposit selon plan choisi)
- Passe `client_secret` au frontend React

### 6. Saisie carte + confirmation Stripe (côté React)
React (Stripe Elements) soumet la carte → Stripe retourne `payment_intent.succeeded` ou redirige pour 3DS.

### 7. Webhook Stripe → `POST /webhooks/payment/stripe`
`WebhookController::handleStripe()` :
- Vérifie signature HMAC
- Trouve le `Payment` par `provider_reference` (Stripe PI id)
- Met à jour `Payment.status = 'succeeded'`, `Payment.paid_at = now()`
- Sauvegarde `stripe_payment_method_id` sur le booking (pour le solde auto-charge)
- Appelle `BookingTransitionService::onPaymentSucceeded()`
- → Transitions d'état (voir section 7)
- → **C'est ici qu'on doit envoyer les emails de confirmation** (voir section 11)

### 8. Confirmation (GET `/booking/{ref}/confirmation`)
`BookingController::confirmation()` : charge la réservation confirmée, affiche la page de succès avec numéro de réservation + "Check your email".

---

## 10. Paiement en plusieurs fois

GokuSafiri supporte deux plans de paiement :

### Plan A — Paiement intégral
- Le client paie 100% maintenant
- `Payment.type = 'full'`, `Payment.amount = booking.total`
- Stripe sauvegarde quand même la méthode de paiement (`setup_future_usage: 'off_session'`) pour pouvoir débiter ultérieurement si besoin
- Booking → `Pending → Paid → Confirmed`

### Plan B — Acompte (deposit) + solde
- Le client paie **20%** maintenant
- `Payment.type = 'deposit'`, `Payment.amount = booking.deposit_amount`
- `Booking.balance_due_at` = calculé (ex: 60 jours avant départ)
- Booking → `Pending → DepositPaid → Confirmed`
- La carte est sauvegardée pour le débit automatique du solde

#### Comment le solde est débité

**Option 1 — Auto-charge (recommandé)**
Le job `SendBalanceReminders` envoie un email avec un lien signé :
```
/booking/{booking_id}/pay-balance?signature=...
```
Quand le client clique (ou que le lien est appelé automatiquement via cron), `BookingPaymentController::payBalance()` :
1. Récupère `booking.stripe_payment_method_id`
2. Crée un nouveau `PaymentIntent` avec `confirm: true` et `payment_method: {saved_id}` (charge hors session)
3. Si succès → webhook reçu → `DepositPaid → Confirmed`
4. Si échec → email d'avertissement + retry possible

**Option 2 — Lien de paiement manuel**
L'email envoie un lien vers la page de paiement normale `/booking/{ref}/payment` pour que le client entre une nouvelle carte.

#### Chronologie du paiement en 2 fois

```
Jour 0     → Client paie l'acompte (20%)
             Booking: DepositPaid + Confirmed
             Email: "Votre réservation GKS-XXXXX est confirmée (acompte reçu)"

Jour J-67  → Job SendBalanceReminders : email "Il reste 7 jours pour payer le solde"
Jour J-60  → balance_due_at — Job CancelUnpaidBalances vérifie
             Si solde non payé → annulation + remboursement partiel
             Si solde payé → Confirmed reste confirmé

Jour départ → Le guide vous attend à Nairobi 🦒
```

#### Configurer la date limite du solde

Dans `BookingDatesController::update()` ou `BookingController::start()`, ajoute :
```php
$schedule = TourSchedule::find($data['tour_schedule_id']);
$daysBeforeDeparture = 60; // ex: 60 jours avant départ
$booking->balance_due_at = $schedule->starts_at->subDays($daysBeforeDeparture);
$booking->save();
```

---

## 11. Emails de notification

### Ce qui doit être envoyé (et quand)

| Événement | Email | À qui | Classe Mailable à créer |
|-----------|-------|-------|------------------------|
| Booking confirmé (full) | "Votre safari est confirmé ✅" | Client | `BookingConfirmedMail` |
| Booking confirmé (deposit) | "Réservation en cours (acompte reçu)" | Client | `BookingDepositPaidMail` |
| Solde dû dans 7 jours | "Rappel : votre solde est dû" | Client | `BalanceDueReminderMail` |
| Solde payé | "Votre voyage est entièrement payé 🎉" | Client | `BalancePaidMail` |
| Annulation avant départ | "Votre réservation a été annulée" | Client | `BookingCancelledMail` |
| Remboursement émis | "Votre remboursement est en cours" | Client | `RefundIssuedMail` |
| Nouvelle réservation | "Nouvelle réservation GKS-XXXXX" | Opérateur | `NewBookingOperatorMail` |

### Comment créer un Mailable

```bash
php artisan make:mail BookingConfirmedMail --markdown=emails.booking.confirmed
```

Cela crée :
- `app/Mail/BookingConfirmedMail.php` — classe Mailable
- `resources/views/emails/booking/confirmed.blade.php` — template Markdown

#### Exemple de Mailable

```php
// app/Mail/BookingConfirmedMail.php
namespace App\Mail;

use App\Models\Booking;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class BookingConfirmedMail extends Mailable
{
    public function __construct(public Booking $booking) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your safari is confirmed! #{$this->booking->reference}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.booking.confirmed',
            with: [
                'booking'  => $this->booking,
                'tour'     => $this->booking->tour,
                'schedule' => $this->booking->tourSchedule,
            ],
        );
    }
}
```

#### Exemple de template email Markdown

```blade
{{-- resources/views/emails/booking/confirmed.blade.php --}}
@component('mail::message')
# Your safari is confirmed! 🎉

Hello {{ $booking->lead_first_name }},

Your booking **#{{ $booking->reference }}** for **{{ $tour->title }}** is confirmed.

**Departure:** {{ $schedule->starts_at->format('F j, Y') }}
**Travelers:** {{ $booking->totalPax() }} people
**Total paid:** ${{ number_format($booking->total / 100, 2) }}

@component('mail::button', ['url' => route('en.account.trips')])
View My Trip
@endcomponent

See you in Africa! 🦁

Thanks,
**The GokuSafiri Team**
@endcomponent
```

### Où déclencher les emails

L'endroit le plus propre est dans `BookingTransitionService::onPaymentSucceeded()` **après** la transition d'état :

```php
// app/Services/BookingTransitionService.php

use App\Mail\BookingConfirmedMail;
use App\Mail\BookingDepositPaidMail;
use Illuminate\Support\Facades\Mail;

public function onPaymentSucceeded(Payment $payment): void
{
    $booking = $payment->booking;

    if ($payment->type === 'deposit') {
        $booking->status->transitionTo(DepositPaid::class);
        $booking->status->transitionTo(Confirmed::class);
        $booking->update(['confirmed_at' => now()]);

        // Email acompte reçu
        Mail::to($booking->lead_email)
            ->queue(new BookingDepositPaidMail($booking));

    } elseif ($payment->type === 'full' || $payment->type === 'balance') {
        // ... transitions ...

        // Email confirmation complète
        Mail::to($booking->lead_email)
            ->queue(new BookingConfirmedMail($booking));
    }
}
```

Le `::queue()` envoie via la queue (Redis + Horizon) → pas de blocage de la requête web.

### Emails de réservation "partiellement valide" vs "valide"

- **Valide (fully confirmed)** : paiement intégral reçu → `BookingConfirmedMail` → "Your safari is confirmed ✅"
- **Partiellement valide (deposit paid)** : acompte reçu → `BookingDepositPaidMail` → "Your reservation is secured! Balance due on [date]"

La différence dans l'email :
```blade
@if($booking->payment_plan === 'deposit')
## ⚠️ Balance Payment Due

You've paid the deposit of **${{ number_format($booking->deposit_amount / 100, 2) }}**.

Your **balance of ${{ number_format($booking->balance_amount / 100, 2) }}** is due by **{{ $booking->balance_due_at->format('F j, Y') }}**.

@component('mail::button', ['url' => $balanceUrl])
Pay Balance Now
@endcomponent
@else
## ✅ Fully Paid

Your trip is fully paid. See you in Africa!
@endif
```

---

## 12. Configuration du service mail en production

### Option 1 — SMTP Gmail (simple, petits volumes)

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your_app_password   # Mot de passe d'application Google (pas ton mot de passe Gmail)
MAIL_FROM_ADDRESS=noreply@gokusafiri.com
MAIL_FROM_NAME="GokuSafiri"
```

Pour le mot de passe d'application Gmail : Google Account → Sécurité → Mots de passe des applications.

**Limite** : ~500 emails/jour. Pas adapté si tu as plus de 100 réservations/jour.

### Option 2 — Mailgun (recommandé, fiable)

1. Crée un compte sur [mailgun.com](https://mailgun.com)
2. Ajoute ton domaine (ex: `mail.gokusafiri.com`), vérifie les DNS
3. Récupère les credentials API

```dotenv
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=mail.gokusafiri.com
MAILGUN_SECRET=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM_ADDRESS=hello@gokusafiri.com
MAIL_FROM_NAME="GokuSafiri"
```

Ajoute le package :
```bash
composer require symfony/mailgun-mailer symfony/http-client
```

### Option 3 — Amazon SES (le moins cher à grande échelle)

```dotenv
MAIL_MAILER=ses
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1
MAIL_FROM_ADDRESS=hello@gokusafiri.com
```

Ajoute le package :
```bash
composer require aws/aws-sdk-php
```

### Option 4 — Resend (moderne, excellent DX)

```dotenv
MAIL_MAILER=resend
RESEND_KEY=re_...
MAIL_FROM_ADDRESS=hello@gokusafiri.com
```

Ajoute le package :
```bash
composer require resend/resend-laravel
```

### Tester les emails en développement

En dev, **Mailpit** attrape tous les emails sans les envoyer réellement :
```dotenv
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
```
Interface web : http://localhost:8025

### Vérifier la config mail
```bash
php artisan tinker
Mail::raw('Test GokuSafiri', fn($m) => $m->to('test@example.com')->subject('Test'));
```

---

## 13. Queue workers — mise en place complète

Les emails sont envoyés **de manière asynchrone** via la queue. Sans worker actif, les emails ne partent pas.

### Architecture queue

```
Laravel App (web request)
    │
    └── Mail::queue(new BookingConfirmedMail($booking))
              │
              ▼
         Redis (liste de jobs)
              │
         Horizon (worker)
              │
              ▼
         Email envoyé via SMTP/Mailgun/SES
```

### En développement (local sans Docker)

```bash
# Terminal 1 : serveur web
php artisan serve

# Terminal 2 : worker de queue
php artisan horizon
# OU si tu n'as pas Horizon :
php artisan queue:work --tries=3 --timeout=60

# Terminal 3 : Vite
npm run dev
```

### En développement (Docker)

Le `docker-compose.yml` inclut déjà un service `horizon` :
```yaml
horizon:
  build: docker/php
  command: php artisan horizon
  volumes:
    - .:/var/www/html
  depends_on:
    - redis
    - db
```

Il démarre automatiquement avec `docker compose up -d`.

### En production avec Supervisor (VPS classique)

Supervisor est un gestionnaire de processus qui s'assure que Horizon reste toujours actif (relance automatique si crash).

#### 1. Installer Supervisor
```bash
# Ubuntu/Debian
sudo apt-get install supervisor -y

# CentOS/RHEL
sudo yum install supervisor -y
```

#### 2. Créer la config Supervisor pour Horizon

```bash
sudo nano /etc/supervisor/conf.d/gokusafiri-horizon.conf
```

```ini
[program:gokusafiri-horizon]
process_name=%(program_name)s
command=php /var/www/gokusafiri/artisan horizon
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/gokusafiri/horizon.log
stdout_logfile_maxbytes=10MB
stopwaitsecs=3600
```

#### 3. Créer la config Supervisor pour le scheduler

```bash
sudo nano /etc/supervisor/conf.d/gokusafiri-scheduler.conf
```

```ini
[program:gokusafiri-scheduler]
process_name=%(program_name)s
command=php /var/www/gokusafiri/artisan schedule:work
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/gokusafiri/scheduler.log
```

#### 4. Créer le dossier de logs
```bash
sudo mkdir -p /var/log/gokusafiri
sudo chown www-data:www-data /var/log/gokusafiri
```

#### 5. Activer et démarrer
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start gokusafiri-horizon
sudo supervisorctl start gokusafiri-scheduler

# Vérifier le statut
sudo supervisorctl status
```

#### 6. Redémarrer Horizon après un déploiement
```bash
# Dans ton script de déploiement (après git pull + composer install + migrate)
php artisan horizon:terminate
# Supervisor le relancera automatiquement avec le nouveau code
```

### En production avec Docker (stack complète)

Si tu utilises Docker en prod, le service `horizon` est déjà dans `compose.prod.yaml`. Ajoute simplement un `restart: unless-stopped` :

```yaml
# compose.prod.yaml
horizon:
  image: gokusafiri-app
  command: php artisan horizon
  restart: unless-stopped
  depends_on:
    - redis
    - db
  environment:
    - APP_ENV=production

scheduler:
  image: gokusafiri-app
  command: php artisan schedule:work
  restart: unless-stopped
  depends_on:
    - redis
    - db
```

### Monitorer Horizon

Laravel Horizon fournit un dashboard à `/horizon` (accès restreint aux admins). Il affiche :
- Jobs en attente, en cours, terminés, échoués
- Throughput (emails/minute)
- Statistiques par queue

```php
// app/Providers/HorizonServiceProvider.php
Horizon::auth(function ($request) {
    return $request->user()?->hasRole('super_admin');
});
```

### Gérer les jobs échoués

Si un email échoue (ex: SMTP down) :
```bash
# Voir les jobs échoués
php artisan queue:failed

# Relancer tous les jobs échoués
php artisan queue:retry all

# Relancer un job spécifique
php artisan queue:retry {id}

# Vider la table des échecs
php artisan queue:flush
```

Les jobs échoués après N tentatives (`--tries=3`) sont stockés dans la table `failed_jobs`.

### Variables .env importantes pour la queue

```dotenv
QUEUE_CONNECTION=redis     # driver de queue (redis en prod, sync en test)
REDIS_HOST=redis           # hostname Redis (docker: "redis", local: "127.0.0.1")
REDIS_PORT=6379
REDIS_PASSWORD=null        # à sécuriser en prod

HORIZON_BALANCE=auto       # Horizon gère automatiquement le nombre de workers
```

---

## 14. Guide pour prendre la main rapidement

### Les 5 fichiers à lire en priorité

1. `routes/web.php` — toutes les routes et leur middleware
2. `app/Models/Booking.php` — la table centrale + la machine à états
3. `app/Http/Controllers/Booking/BookingPaymentController.php` — toute la logique paiement
4. `app/Services/BookingTransitionService.php` — les transitions d'état après paiement
5. `resources/js/Pages/Tours/Show.tsx` — le point d'entrée du checkout côté client

### Trouver quelque chose rapidement

| Question | Où chercher |
|----------|-------------|
| "Comment le prix est calculé ?" | `app/Services/BookingPriceCalculator.php` |
| "Qu'est-ce qui se passe après un paiement Stripe ?" | `app/Http/Controllers/Payment/WebhookController.php` → `BookingTransitionService` |
| "Pourquoi ce tour n'a pas de places dispo ?" | `TourSchedule.seats_left` + `ReleaseExpiredBookings` |
| "Pourquoi le cœur n'est pas rempli ?" | `HomeController::formatTour()` ou `TourIndexController::formatTour()` → `is_wishlisted` |
| "Comment ajouter une clé de traduction ?" | `lang/en.json`, `lang/fr.json`, `lang/es.json` |
| "Où est le backoffice ?" | `/admin` (Filament) + `app/Filament/` |
| "Quelle est la structure d'un email ?" | `app/Mail/` + `resources/views/emails/` |
| "Pourquoi les emails ne partent pas ?" | Horizon actif ? `php artisan horizon:status` |

### Commandes utiles au quotidien

```bash
# Dev
php artisan serve                          # Serveur web
php artisan horizon                        # Queue worker
npm run dev                                # Vite (HMR)
php artisan migrate:fresh --seed           # Reset DB + seeds

# Inspection
php artisan tinker                         # REPL interactif
php artisan route:list                     # Toutes les routes
php artisan queue:monitor                  # Surveiller la queue

# Débogage
php artisan queue:failed                   # Jobs échoués
php artisan horizon:status                 # Statut Horizon

# Cache (production)
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize                       # Tout en une commande
```

### Ajouter une nouvelle fonctionnalité — checklist

1. **Modèle + migration** : `php artisan make:model NomModele -m`
2. **Contrôleur** : `php artisan make:controller NomController`
3. **Route** dans `routes/web.php` (avec le bon middleware)
4. **Page React** dans `resources/js/Pages/`
5. **Types TypeScript** dans `resources/js/types/index.d.ts`
6. **Traductions** dans `lang/en.json`, `lang/fr.json`, `lang/es.json`
7. **Email** si la feature envoie des notifications : `php artisan make:mail NomMail --markdown=emails.nom.template`

### Points d'attention

- **Toujours stocker les montants en centimes** (pas de float pour l'argent)
- **Le webhook Stripe est la source de vérité** pour les paiements — ne jamais confirmer une réservation uniquement depuis le frontend
- **Mail::queue()** pas `Mail::send()` — ne jamais bloquer la requête web avec l'envoi d'email
- **Les champs translatable** (`title`, `excerpt`, etc.) retournent `''` pas `null` pour les locales manquantes — toujours utiliser `Tour::arr()` pour les champs array
- **`expires_at`** : une réservation Pending expire après 20 minutes → le job `ReleaseExpiredBookings` la passe `Expired` et rend les places
- **`is_wishlisted`** doit être injecté dans `formatTour()` de chaque contrôleur qui affiche des TourCards (Home, TourIndex) — sinon les cœurs sont toujours vides au chargement
