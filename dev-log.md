# GoKuSafiri — Journal de développement (Backend / Docker / Filament)

> Scope : Phase 1 (Docker), Phase 2 (dépendances backend), Phase 3 (modèle de données),
> Phase 4 (controllers + routes), Phase 5 (paiement), Phase 7 (Filament), Phase 8 (jobs/emails).
> Le frontend React (Phase 6) est volontairement exclu de ce suivi.

---

## État de départ (2026-06-10)

- Laravel 13.8 installé à nu (`laravel/tinker`, `laravel/pint`, `phpunit`)
- Aucun Docker, aucun package domaine, aucune migration domaine
- Aucun panel Filament, aucune structure de service

---

## Phases & tâches

### Phase 1 — Dockerisation ✅ EN COURS

| Tâche | Statut |
|---|---|
| `docker/php/Dockerfile` (php:8.3-fpm, extensions) | ✅ Fait |
| `docker/php/php.ini` | ✅ Fait |
| `docker/nginx/default.conf` | ✅ Fait |
| `compose.yaml` (dev — 8 services) | ✅ Fait |
| `compose.prod.yaml` (multi-stage) | ✅ Fait |
| `Makefile` (up/sh/artisan/test) | ✅ Fait |
| `.env.example` patché (DB_HOST=db, REDIS_HOST=redis…) | ✅ Fait |

---

### Phase 2 — Dépendances & fondations ⏳ À faire

| Tâche | Statut |
|---|---|
| `composer.json` — ajouter tous les packages domaine | ✅ Fait |
| Inertia middleware `HandleInertiaRequests` | ⏳ À faire (frontend) |
| Sanctum + Socialite Google | ✅ Déclaré dans composer.json |
| `spatie/laravel-permission` — seeder de rôles | ✅ Fait |
| Filament panels providers (operator + admin) | ✅ Fait |
| `.env.example` — toutes les clés nécessaires | ✅ Fait |

---

### Phase 3 — Modèle de données ⏳ EN COURS

| Tâche | Statut |
|---|---|
| Migration `users` (champs étendus) | ✅ Fait |
| Migration `operators` + pivot `operator_user` | ✅ Fait |
| Migration `destinations` | ✅ Fait |
| Migration `tours` | ✅ Fait |
| Migration `tour_schedules` | ✅ Fait |
| Migration `tour_addons` | ✅ Fait |
| Migration `bookings` | ✅ Fait |
| Migration `booking_travelers` | ✅ Fait |
| Migration `booking_addons` | ✅ Fait |
| Migration `payments` | ✅ Fait |
| Migration `reviews` | ✅ Fait |
| Migration `wishlists` | ✅ Fait |
| Migration `faqs` | ✅ Fait |
| Modèles Eloquent (User, Operator, Tour, Booking…) | ✅ Fait |
| Machine à états `Booking` (spatie model-states) | ✅ Fait |
| `BookingPriceCalculator` service | ✅ Fait |
| Factories + seeders réalistes | ✅ Fait |

---

### Phase 4 — Routes & contrôleurs ⏳ À faire

| Tâche | Statut |
|---|---|
| Middleware `SetLocale` | ✅ Fait |
| Routes web (home, tours, packages, search, checkout, compte, webhooks) | ✅ Fait |
| Policies (Booking, Tour) | ✅ Fait |
| FormRequests checkout | ⏳ À faire |
| Contrôleurs Inertia (HomeController, TourIndexController, TourShowController…) | ⏳ Frontend scope |

---

### Phase 5 — Service de paiement ⏳ EN COURS

| Tâche | Statut |
|---|---|
| `PaymentProviderInterface` | ✅ Fait |
| `PaymentManager` (extends Laravel Manager) | ✅ Fait |
| DTOs `PaymentSession`, `WebhookEvent`, `PaymentStatus`, `RefundResult` | ✅ Fait |
| `FakeProvider` + page `/fake-pay/{payment}` | ✅ Fait |
| `config/payment.php` | ✅ Fait |
| Route webhook `/webhooks/payment/{provider}` | ✅ Fait |
| Tests Pest (full, deposit+balance, échec, idempotence, refund) | ⏳ À faire |

---

### Phase 7 — Filament panels ✅ COMPLET

| Tâche | Statut |
|---|---|
| Panel **Operator** (`/operator`, tenant Operator) | ✅ Fait |
| Panel **Admin** (`/admin`) | ✅ Fait |
| `TourResource` (Operator) — onglets langue, médias, itinéraire, add-ons | ✅ Fait |
| `TourScheduleResource` (Operator) | ✅ Fait |
| `BookingResource` (Operator — lecture/ViewBooking/check-in) | ✅ Fait |
| `BookingResource` Admin — infolist voyageurs+paiements, confirm/cancel/complete | ✅ Fait |
| `PaymentResource` Admin — refund action, vue payload | ✅ Fait |
| `UserResource` Admin — vérification email, reset MDP, compteurs, filtres rôle/locale | ✅ Fait |
| `OperatorResource` Admin — approve/suspend, badge en attente, logo upload | ✅ Fait |
| `TourResource` Admin — modération, reject avec motif modal, badge in_review | ✅ Fait |
| `ReviewResource` Admin — approve/masquer, titre tour, badge en attente | ✅ Fait |
| `DestinationResource` Admin — image couverture, multilingue complet | ✅ Fait |
| `FaqResource` Admin | ✅ Fait |
| `SettingsPage` Admin (spatie-settings) + vue Blade | ✅ Fait |
| Widget `BookingsPerDayWidget` (stats today/semaine/revenu mois) | ✅ Fait |
| Widget `CheckoutFunnelWidget` (funnel états + taux annulation) | ✅ Fait |
| Widget `TopToursWidget` (tableau top 5 revenus) | ✅ Fait |
| Widgets dashboard Operator | ⏳ À faire (session suivante) |

---

### Phase 8 — Emails, jobs & PDF ⏳ À faire

| Tâche | Statut |
|---|---|
| Jobs : `ReleaseExpiredBookings`, `SendBalanceReminders`, `CancelUnpaidBalances` | ✅ Fait |
| Jobs : `SendDocumentReminders`, `SendPackingList`, `SendReviewInvites` | ⏳ À faire |
| Mailables traduits (BookingConfirmed, DepositPaid, BalanceReminder…) | ⏳ À faire |
| PDF itinéraire (dompdf) via queue + stockage | ⏳ À faire |

---

## Compte rendu des sessions

### Session 1 — 2026-06-10

**Fait :**
- Analyse complète du context.md — état de départ : Laravel 13 nu
- **Phase 1 complète** : Docker (Dockerfile php:8.3-fpm, php.ini, nginx/default.conf, compose.yaml 8 services, compose.prod.yaml multi-stage, Makefile)
- **Phase 2 partielle** : composer.json mis à jour avec toutes les dépendances (Filament 5, Spatie*, Inertia, Sanctum, Socialite, DomPDF, Horizon, Pest). `.env.example` patché.
- **Phase 3 complète** : 13 migrations (users enrichi, operators, destinations, tours, tour_schedules, tour_addons, bookings, booking_travelers, booking_addons, payments, reviews, wishlists, faqs). Tous les modèles Eloquent créés avec casts, relations, scopes. Machine à états Booking (Pending/DepositPaid/Paid/Confirmed/Completed/Cancelled/Refunded/Expired). `BookingPriceCalculator`. Factories + seeders réalistes (15 tours, destinations réelles, données démo).
- **Phase 4 partielle** : Middleware `SetLocale`, routes web complètes, policies Booking + Tour.
- **Phase 5 complète** : `PaymentProviderInterface`, `PaymentManager`, DTOs, `FakeProvider`, config, routes webhook.
- **Phase 7 large** : Panels Operator (`/operator`, tenant) et Admin (`/admin`, 2FA) avec la majorité des Resources et pages.
- **Phase 8 partielle** : Jobs planifiés critiques (ReleaseExpiredBookings, SendBalanceReminders, CancelUnpaidBalances).

**Session 1 terminée avec :**
- Phase 1→3 complètes, Phase 5 complète, Phase 7 large

**Session 2 — 2026-06-10 :**
- Backoffice Admin complet (BookingResource, PaymentResource, 3 widgets, 5 resources améliorées)
- Operator BookingResource corrigé (bug transitionTo + ViewBooking page)
- Vue Blade settings + AdminPanelProvider mis à jour

**À faire (session suivante) :**
- Widgets dashboard Operator (revenus, remplissage, prochains départs)
- Tests Pest (BookingPriceCalculator + anti-surbooking + paiement flow)
- Mailables (BookingConfirmed, BalanceReminder, CancellationMail)
- BookingController + FormRequests (tunnel checkout avec lockForUpdate)
- Jobs restants (SendDocumentReminders, SendPackingList, SendReviewInvites)
- `composer install` + `php artisan migrate --seed` depuis Docker

---

## Notes techniques

- **Montants** : toujours en centimes (`unsignedBigInteger`), jamais de float
- **Webhook = seule source de vérité** pour les transitions de paiement
- **Multi-tenancy Filament** : l'opérateur est scopé sur son `Operator` via `->tenant(Operator::class)`, le modèle `Tour` implémente `HasTenant`
- **Chiffrement** : `passport_number` sur `User` et `BookingTraveler` utilisent `encrypted` cast natif Laravel
- **Idempotence paiements** : `idempotency_key` unique sur `payments` — rejouer un webhook est neutre
- **Anti-surbooking** : `seats_left` décrémenté dans une transaction `lockForUpdate()`
- **Hold 20 min** : `expires_at = now() + 20min` à la création Pending, `ReleaseExpiredBookings` tourne toutes les 5 min

## Décisions d'architecture

### ❌ Event-driven abandonné (décision utilisateur)

**Context.md** prescrivait `PaymentSucceeded` event → listener `TransitionBookingOnPayment`.  
**Décision** : supprimé. À la place, le `WebhookController` appelle directement `BookingTransitionService::onPaymentSucceeded()`.

**Pourquoi c'est mieux ici :**
- Moins de couches pour un seul point d'entrée (le webhook est *la* source de vérité)
- Le flux est linéaire et lisible : webhook → contrôleur → service de transition
- Pas de listener asynchrone caché qui peut échouer silencieusement
- Facilite les tests : injecter `BookingTransitionService` est trivial, mocker un event bus ne l'est pas

Si on a besoin de side-effects supplémentaires (email de confirmation, log d'activité), ils s'ajoutent directement dans `BookingTransitionService` ou par des méthodes dédiées appelées explicitement.
