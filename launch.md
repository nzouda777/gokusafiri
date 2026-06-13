# GokuSafiri — Launch Guide

Safari booking backoffice + customer-facing website built with **Laravel 13**, **Inertia.js v2**, **React 19**, **Tailwind CSS v4**, and **Filament v5**.

---

## What Was Built

### Core platform
- Multi-language public website (English, French, Spanish) with locale-prefixed URLs (`/en/`, `/fr/`, `/es/`)
- Tour listing and detail pages with gallery, itinerary, highlights, reviews, and a sticky booking widget
- Multi-step booking flow: date selection → traveler info → payment → confirmation
- User account area: trips dashboard, saved tours, profile editor
- Filament v5 backoffice at `/admin` (admin panel) and `/operator` (operator panel)

### Features implemented / fixed in this session
- **Language switcher** — full-page locale switch with URL prefix; Inertia shares locale via a lazy closure so it evaluates _after_ the `setlocale` middleware runs; the React i18n provider syncs on every navigation via an `I18nLocaleSync` component
- **Translation files** — loaded eagerly (`import.meta.glob('/lang/*.json', { eager: true })`) to avoid a flash of untranslated text on first render
- **Locale-aware navigation** — all internal links (`/en/tours`, `/fr/tours`, …) built from the current locale prop so SPA navigation never drops the locale prefix
- **TourCard crash fix** — Spatie Translatable returns `''` (not `null`) for missing locale translations, bypassing Eloquent's `array` cast; fixed with a `Tour::arr()` helper on the backend and an `Array.isArray()` guard on the frontend
- **FAQs from database** — homepage FAQs are now fetched from the Filament-managed `faqs` table (with locale fallback) instead of a hardcoded array
- **User reviews** — users can submit a star rating + body text on any tour detail page; reviews are held for moderation; a `ReviewObserver` updates the tour's `rating_cache` automatically
- **Account pages** — profile update uses the correct DB column (`country` not `country_of_residence`); registration uses `newsletter_opt_in`; trip tabs switch server-side so filtering works correctly; booking cards guard against non-array `inclusions`
- **Google OAuth** — sign-in with Google via Laravel Socialite; creates or retrieves user by email, imports avatar from Google, stores `google_id`

---

## How It Works

### Routing
All public routes live inside a `Route::prefix('{locale}')` group in `routes/web.php`. A `setlocale` middleware reads the `{locale}` segment and calls `app()->setLocale()`. A redirect from `/` → `/en/` is in place so the site always has a locale in the URL.

Auth routes (login, register, Google OAuth, logout) live outside the locale prefix and are not duplicated.

### Inertia + React i18n
`HandleInertiaRequests` shares `locale` as a **lazy closure** so it is evaluated after `setlocale` runs:
```php
'locale' => fn () => app()->getLocale(),
```
On the React side, `I18nLocaleSync` (inside `LaravelReactI18nProvider`) listens to Inertia's `navigate` event and calls `setLocale()` from the i18n context. This keeps the translation layer in sync on every SPA navigation.

### Translatable models
Tours, FAQs, and several other models use Spatie Translatable (`HasTranslations`). Spatie does **not** apply Eloquent casts on translatable fields — it returns the raw locale value or `''` if missing. `Tour::arr(string $field)` normalises this: it returns the value if it is already an array, JSON-decodes it if it is a non-empty string, or returns `[]` otherwise.

### Payments
`PAYMENT_DRIVER=fake` is set by default — the fake driver renders a confirmation page at `/fake-pay/{payment}` with approve/decline buttons. Switch to `stripe` and supply the Stripe keys to accept real card payments. The webhook endpoint (`/stripe/webhook`) is the source of truth for payment status; it updates bookings directly.

### Filament panels
| Panel | URL | Who uses it |
|---|---|---|
| Admin | `/admin` | Super-admins — full access to all resources |
| Operator | `/operator` | Safari operators — their own bookings only |

Resources available in admin: Tours, Packages, Destinations, Operators, Bookings, Payments, Users, Reviews, FAQs, Roles.

### Media
Spatie MediaLibrary is used for tour gallery images and user avatars. Files are stored on the `local` disk by default (`storage/app/public`). A storage symlink must exist (`php artisan storage:link`) for public URLs to work.

### Queue / Background jobs
Laravel Horizon manages the Redis-backed queue. The `ReviewObserver` and payment webhooks dispatch jobs to recalculate caches and send emails. In production, Horizon must be running.

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| PHP | 8.4 |
| Composer | 2.x |
| Node.js | 22.x |
| MySQL | 8.0 |
| Redis | 6.x |
| Docker + Docker Compose | (optional, but simplest path) |

---

## Setup (Docker — recommended)

### 1. Clone and copy env
```bash
git clone <repo-url> gokusafiri
cd gokusafiri
cp .env.example .env
```

### 2. Fill in `.env`
Open `.env` and set at minimum:

```dotenv
APP_KEY=           # filled by artisan command below
APP_URL=http://localhost

# Google OAuth (get from console.cloud.google.com)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URL=http://localhost/auth/google/callback

# Stripe (leave PAYMENT_DRIVER=fake to skip real payments during dev)
PAYMENT_DRIVER=fake
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Everything else (`DB_HOST=db`, `REDIS_HOST=redis`, `MAIL_HOST=mailpit`) already points to the Docker services.

### 3. Start containers
```bash
docker compose up -d
```

This starts: `app` (PHP-FPM), `nginx`, `db` (MySQL 8), `redis`, `horizon`, `scheduler`, `node` (Vite), `mailpit`.

### 4. Install PHP dependencies
```bash
docker compose exec app composer install
```

### 5. Generate app key
```bash
docker compose exec app php artisan key:generate
```

### 6. Run migrations + seed
```bash
docker compose exec app php artisan migrate --seed
```

The seeder creates sample tours, destinations, and a default admin user.

### 7. Create storage symlink
```bash
docker compose exec app php artisan storage:link
```

### 8. Install Node dependencies (if not already done by the node container)
```bash
docker compose exec node npm install
```

The `node` container already runs `npm run dev` on port 5173. If you prefer to run it on your host machine instead:
```bash
npm install
npm run dev
```

### 9. Open the app
- **Website**: http://localhost
- **Filament admin**: http://localhost/admin
- **Vite dev server**: http://localhost:5173 (proxied through nginx in dev)
- **Mailpit**: http://localhost:8025 (catches all outgoing email)

---

## Setup (without Docker)

### Prerequisites on your machine
- PHP 8.4 with extensions: `pdo_mysql`, `redis`, `gd`, `zip`, `exif`, `bcmath`, `intl`
- MySQL 8 running locally
- Redis running locally
- Node 22

### Steps
```bash
# 1. Install dependencies
composer install
npm install

# 2. Environment
cp .env.example .env
# Edit .env: set DB_HOST=127.0.0.1, REDIS_HOST=127.0.0.1, MAIL_HOST=localhost
# Set APP_URL, GOOGLE_*, STRIPE_* as above

# 3. Key + DB
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

# 4. Dev servers (three separate terminals)
php artisan serve          # Laravel on :8000
php artisan horizon        # Queue worker
npm run dev                # Vite on :5173
```

---

## Creating the first admin user

After migrations:
```bash
# Docker
docker compose exec app php artisan tinker

# Local
php artisan tinker
```

```php
$user = App\Models\User::where('email', 'your@email.com')->firstOrFail();
$user->assignRole('super_admin');
```

Or create one from scratch:
```php
$user = App\Models\User::create([
    'name'       => 'Admin',
    'first_name' => 'Admin',
    'last_name'  => '',
    'email'      => 'admin@example.com',
    'password'   => bcrypt('password'),
    'email_verified_at' => now(),
]);
$user->assignRole('super_admin');
```

Then log in at `/admin`.

---

## Google OAuth setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Create an **OAuth 2.0 Client ID** (application type: Web application)
3. Add to **Authorized redirect URIs**:
   - `http://localhost/auth/google/callback` (dev)
   - `https://yourdomain.com/auth/google/callback` (production)
4. Copy **Client ID** and **Client Secret** into `.env`:
   ```dotenv
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URL=http://localhost/auth/google/callback
   ```

---

## Stripe setup (when ready to take payments)

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. From the Stripe dashboard → **Developers** → **API keys**, copy your test keys
3. Set in `.env`:
   ```dotenv
   PAYMENT_DRIVER=stripe
   STRIPE_KEY=pk_test_...
   STRIPE_SECRET=sk_test_...
   ```
4. For webhooks (needed for payment confirmation):
   - Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
     ```bash
     stripe listen --forward-to http://localhost/stripe/webhook
     ```
   - Copy the displayed `whsec_...` signing secret into `.env`:
     ```dotenv
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```

---

## Building for production

```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Use `compose.prod.yaml` for the production Docker setup. Make sure `APP_ENV=production` and `APP_DEBUG=false` in the production `.env`.

---

## Languages

Translation files are in `lang/`:
```
lang/en.json   # English (default)
lang/fr.json   # French
lang/es.json   # Spanish
lang/en/       # Laravel PHP translation files
lang/fr/
lang/es/
```

To add a new language, create `lang/xx.json` and `lang/xx/` with the matching keys, then add the locale to the language switcher in `resources/js/Components/AppLayout.tsx`.
