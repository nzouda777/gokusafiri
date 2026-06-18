# GokuSafiri — Launch Guide

Safari booking platform + backoffice built with **Laravel 13**, **Inertia.js v2**, **React 19**, **Tailwind CSS v4**, and **Filament v5**.

---

## What Was Built

### Core platform
- Multi-language public website (English, French, Spanish) with locale-prefixed URLs (`/en/`, `/fr/`, `/es/`)
- Tour listing and detail pages with gallery lightbox, itinerary, highlights, reviews, and a sticky booking widget
- Multi-step booking flow: date selection → traveler info → payment → confirmation
- User account area: trips dashboard, saved tours, profile editor
- Filament v5 backoffice at `/admin` (admin panel) and `/operator` (operator panel)

### Features implemented / fixed

- **Language switcher** — full-page locale switch with URL prefix; `locale` is shared via a lazy closure in `HandleInertiaRequests` so it evaluates after `setlocale` middleware runs
- **Translation files** — loaded eagerly (`import.meta.glob('/lang/*.json', { eager: true })`) to avoid flash of untranslated text
- **Locale-aware navigation** — all internal links built from the current locale prop so SPA navigation never drops the prefix
- **TourCard crash fix** — Spatie Translatable returns `''` for missing translations, bypassing Eloquent's array cast; fixed with `Tour::arr()` helper and `Array.isArray()` guard on frontend
- **FAQs from database** — homepage FAQs fetched from Filament-managed `faqs` table with locale fallback
- **User reviews** — star rating + text body, held for moderation; `ReviewObserver` updates `rating_cache` on Tour
- **Account pages** — profile update, trip tabs, booking cards with inclusions guard
- **Google OAuth** — sign-in via Laravel Socialite; creates or retrieves user by email, imports avatar
- **Wishlist heart state on load** — `HomeController` and `TourIndexController` preload user's wishlisted tour IDs (single query) and inject `is_wishlisted` into each formatted tour; `TourCard` initialises local state from that prop
- **Wishlist optimistic toggle** — uses `fetch()` (not Inertia router) against `WishlistController` which returns JSON; reverts on network error. `csrfToken()` extracted to `resources/js/utils.ts` and shared between `TourCard` and `Tours/Show`
- **SearchBar responsive** — pill switches to vertical stack on mobile; popovers become bottom sheets with drag handle and dark backdrop; calendar shows 1 month on mobile, 2 on desktop
- **Filter sidebar responsive** — on mobile, slides in as a fixed bottom drawer with overlay; on desktop remains a sticky sidebar
- **Gallery lightbox** (`Tours/Show.tsx`) — hero grid (2/3 + 1/3) with clickable images, "+N more" overlay on last thumbnail when > 3 images, "View all photos" pill button; fullscreen lightbox with prev/next arrows, thumbnail strip, keyboard (←→ Escape), touch swipe, and body scroll lock
- **Tour image pipeline** — Spatie MediaLibrary `gallery` collection with `thumb` (400×300), `card` (800×600), `hero` (1920×1080) conversions in **JPEG** (not WebP — GD in current Docker image was compiled without WebP support); placeholder falls back to `/images/tours/serengeti.jpg`
- **Child / infant pricing** — `child_price` column (cents, nullable) on `tours`; configurable in Filament for both Admin and Operator panels; booking flow prices adults at `base_price` (or schedule override), children at `child_price` (falls back to `base_price` if null), infants free; `BookingSummary` shows separate line items per traveler type

---

## How It Works

### Routing
All public routes live inside a `Route::prefix('{locale}')` group in `routes/web.php`. A `SetLocale` middleware reads the `{locale}` segment and calls `app()->setLocale()`. A redirect from `/` → `/en/` ensures the site always has a locale in the URL.

Auth routes (login, register, Google OAuth, logout) live outside the locale prefix.

### Inertia + React i18n
`HandleInertiaRequests` shares `locale` as a **lazy closure**:
```php
'locale' => fn () => app()->getLocale(),
```
On the React side, `I18nLocaleSync` listens to Inertia's `navigate` event and calls `setLocale()` from the i18n context, keeping translations in sync on every SPA navigation.

### Translatable models
Tours, FAQs, and other models use Spatie Translatable (`HasTranslations`). Spatie does **not** apply Eloquent casts on translatable fields — it returns the raw locale value or `''` if missing. `Tour::arr(string $field)` normalises this to always return an array.

### Pricing rules
| Traveler type | Price used |
|---|---|
| Adults (13+) | `schedule.price_override ?? tour.base_price` |
| Children (2–12) | `tour.child_price ?? adult_price` |
| Infants (under 2) | Free (0) |

Admin/operators set `child_price` in the **Pricing & Logistics** section of the tour form. Leave it blank to charge the adult price.

`BookingDatesController::recalculatePricing` applies these rules when saving step 1 of the booking.

### Payments — Stripe
`PAYMENT_DRIVER=fake` is the default (renders a confirmation page at `/fake-pay/{payment}`). Switch to `stripe` for real payments. The webhook at `/webhooks/payment/stripe` is the **source of truth** for payment status; it verifies the Stripe signature and updates bookings. Bookings support two plans:
- **Full** — customer pays 100% now; payment method saved for potential balance charges
- **Deposit** — customer pays 20% now; balance due before a configurable deadline; a signed URL auto-charges the saved payment method for the balance

### Filament panels
| Panel | URL | Who uses it |
|---|---|---|
| Admin | `/admin` | Super-admins — full access to all resources |
| Operator | `/operator` | Safari operators — their own bookings only |

### Media
Spatie MediaLibrary for tour gallery images and user avatars. Default disk: `local` (`storage/app/public`). Storage symlink required for public URLs.

> **Docker note:** run `php artisan storage:link` **inside the container** (`docker compose exec app php artisan storage:link`). The symlink must point to `/var/www/storage/app/public`, not to the host path. If you ran it on the host first, delete `public/storage` and re-run inside the container.

Image conversions use **JPEG** format (not WebP). The current Docker image's GD extension was compiled without `--with-webp`. To switch to WebP in future, rebuild the `app` image with `--no-cache` and update `registerMediaConversions` in `Tour.php`.

### Queue / Background jobs
Laravel Horizon manages the Redis-backed queue. Key jobs:
- `ReleaseExpiredBookings` — releases seat holds for Pending bookings past `expires_at` (20-min window)
- `SendBalanceReminders` — emails customers when balance is due within 7 days
- `CancelUnpaidBalances` — cancels + refunds DepositPaid bookings past `balance_due_at`

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| PHP | 8.4 |
| Composer | 2.x |
| Node.js | 22.x |
| MySQL | 8.0 |
| Redis | 6.x |
| Docker + Docker Compose | (optional, recommended) |

---

## Setup (Docker — recommended)

### 1. Clone and copy env
```bash
git clone <repo-url> gokusafiri
cd gokusafiri
cp .env.example .env
```

### 2. Fill in `.env`
```dotenv
APP_KEY=           # filled by artisan command below
APP_URL=http://localhost

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URL=http://localhost/auth/google/callback

# Stripe (leave PAYMENT_DRIVER=fake to skip real payments during dev)
PAYMENT_DRIVER=fake
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mail (Mailpit catches all mail in dev — no change needed)
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_FROM_ADDRESS=hello@gokusafiri.com
```

Everything else (`DB_HOST=db`, `REDIS_HOST=redis`) already points to Docker services.

### 3. Start containers
```bash
docker compose up -d
```

Starts: `app` (PHP-FPM), `nginx`, `db` (MySQL 8), `redis`, `horizon`, `scheduler`, `node` (Vite), `mailpit`.

### 4–8. Install and initialise
```bash
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
docker compose exec app php artisan storage:link   # must run inside the container
docker compose exec node npm install               # if the node container hasn't already run this
```

### 9. Open the app
- **Website**: http://localhost
- **Filament admin**: http://localhost/admin
- **Mailpit**: http://localhost:8025 (catches all outgoing email in dev)

---

## Setup (without Docker)

```bash
# 1. Install dependencies
composer install
npm install

# 2. Environment
cp .env.example .env
# Edit .env: DB_HOST=127.0.0.1, REDIS_HOST=127.0.0.1, MAIL_HOST=localhost

# 3. Key + DB
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

# 4. Dev servers (three separate terminals)
php artisan serve          # Laravel on :8000
php artisan horizon        # Queue worker (processes jobs + sends emails)
npm run dev                # Vite on :5173
```

---

## Creating the first admin user

```bash
docker compose exec app php artisan tinker
```
```php
$user = App\Models\User::create([
    'name'              => 'Admin',
    'first_name'        => 'Admin',
    'last_name'         => '',
    'email'             => 'admin@example.com',
    'password'          => bcrypt('password'),
    'email_verified_at' => now(),
]);
$user->assignRole('super_admin');
```

Then log in at `/admin`.

---

## Google OAuth setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Create an **OAuth 2.0 Client ID** (type: Web application)
3. Add to **Authorized redirect URIs**:
   - `http://localhost/auth/google/callback` (dev)
   - `https://yourdomain.com/auth/google/callback` (prod)
4. Copy Client ID and Secret into `.env`:
   ```dotenv
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URL=http://localhost/auth/google/callback
   ```

---

## Stripe setup (when ready to take real payments)

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. From **Developers** → **API keys**, copy test keys
3. Set in `.env`:
   ```dotenv
   PAYMENT_DRIVER=stripe
   STRIPE_KEY=pk_test_...
   STRIPE_SECRET=sk_test_...
   ```
4. For webhooks — install [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
   ```bash
   stripe listen --forward-to http://localhost/webhooks/payment/stripe
   ```
   Copy the displayed `whsec_...` into `.env`:
   ```dotenv
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
5. In production, register the webhook URL in the Stripe dashboard under **Developers → Webhooks**. Listen for `payment_intent.succeeded` and `payment_intent.payment_failed`.

---

## After pulling new migrations

Any new column added to the database must be migrated before the app works:

```bash
docker compose exec app php artisan migrate
```

To regenerate existing tour image conversions after changing conversion format:

```bash
docker compose exec app php artisan media-library:regenerate
```

---

## Mail service setup (production)

See `dump.md → "Mail service & queue workers"` for the complete guide (SMTP, SES, Mailgun, workers, Supervisor).

---

## Building for production

```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Use `compose.prod.yaml` for the production Docker setup. Set `APP_ENV=production` and `APP_DEBUG=false`.

---

## Languages

Translation files are in `lang/`:
```
lang/en.json   # English (default)
lang/fr.json   # French
lang/es.json   # Spanish
```

To add a language: create `lang/xx.json` with all matching keys, then add the locale to the language switcher in `resources/js/Components/AppLayout.tsx`.

---

## Known constraints

- **GD / WebP** — GD in the current Docker image is compiled without WebP. Conversions are JPEG. Rebuild `docker/php/Dockerfile` with `--no-cache` to enable WebP, then update `Tour::registerMediaConversions`.
- **Storage symlink** — must be created inside the Docker container, not on the host. Host-created symlinks point to the host filesystem path which doesn't exist inside the container.
- **Amounts always in cents** — `base_price`, `child_price`, `subtotal`, `total`, `deposit_amount` etc. are all integers representing cents. Never store or compute floats.
- **Wishlist endpoint returns JSON** — `WishlistController::toggle` returns `{"wishlisted": bool}`. Always call it with `fetch()`, never with `router.post()` (Inertia would reject the response).
