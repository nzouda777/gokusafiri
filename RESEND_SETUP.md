# Resend — Guide de configuration

## 1. Installer le package Resend

```bash
composer require resend/resend-laravel
```

Ce package enregistre automatiquement le transport `resend` dans Laravel (il est déjà déclaré dans `config/mail.php`).

---

## 2. Variables d'environnement

Ajoute ces lignes dans ton fichier `.env` (et `.env.production`) :

```env
# Mailer
MAIL_MAILER=resend

# Resend API Key — obtenu sur https://resend.com/api-keys
RESEND_KEY=re_xxxxxxxxxxxxxxxx

# Adresse expéditrice (doit être vérifiée dans Resend)
MAIL_FROM_ADDRESS="bookings@gokusafiri.com"
MAIL_FROM_NAME="GokuSafiri"

# Adresse admin qui reçoit les notifications internes
ADMIN_EMAIL="admin@gokusafiri.com"
```

> **Important** : Supprime les anciennes variables SMTP (`MAIL_HOST`, `MAIL_PORT`, etc.) pour éviter les conflits.

---

## 3. Vérifier ton domaine dans Resend

1. Va sur [resend.com/domains](https://resend.com/domains)
2. Ajoute `gokusafiri.com`
3. Copie les enregistrements DNS (SPF, DKIM, DMARC) et ajoute-les chez ton registrar
4. Clique **Verify** — ça prend 1–10 minutes

Sans domaine vérifié, les emails n'arrivent pas en production.

---

## 4. Créer une API Key

1. Va sur [resend.com/api-keys](https://resend.com/api-keys)
2. Crée une clé avec la permission **Sending access**
3. Copie la valeur dans `RESEND_KEY` dans ton `.env`

---

## 5. Tester en local

Pour tester sans Resend en dev, tu peux garder `MAIL_MAILER=log` — les emails s'écrivent dans `storage/logs/laravel.log`.

Pour tester le rendu réel (HTML), utilise `MAIL_MAILER=resend` avec ton API key de test Resend (ils ont un domaine `@resend.dev` pour ça) :

```env
# Envoie vers l'adresse de test Resend
MAIL_MAILER=resend
RESEND_KEY=re_test_xxxx  # clé de test
```

---

## 6. S'assurer que la queue tourne

Les emails sont **queueés** (`ShouldQueue`). La queue doit tourner :

```bash
# En dev
php artisan queue:work

# En prod (via Horizon, déjà installé)
php artisan horizon
```

Sans queue worker, les emails restent bloqués dans la table `jobs`.

---

## 7. Emails envoyés — récapitulatif des points d'envoi

| Email | Destinataire | Déclencheur | Fichier |
|---|---|---|---|
| **Booking Confirmed** | Client | Paiement complet réussi (full) | `BookingTransitionService::onPaymentSucceeded` |
| **Deposit Received** | Client | Acompte réussi | `BookingTransitionService::onPaymentSucceeded` |
| **Balance Paid** | Client | Solde réussi (balance payment) | `BookingTransitionService::onPaymentSucceeded` |
| **Balance Reminder** | Client | 7 jours avant échéance du solde | `Jobs/SendBalanceReminders` (cron 09h00) |
| **Booking Cancelled** | Client | Solde non reçu à l'échéance | `Jobs/CancelUnpaidBalances` (cron 08h00) |
| **New Booking (admin)** | Admin | Tout paiement réussi (deposit/full/balance) | `BookingTransitionService::onPaymentSucceeded` |

---

## 8. Fichiers modifiés / créés

### Mailable classes
- `app/Mail/BookingConfirmedMail.php`
- `app/Mail/DepositReceivedMail.php`
- `app/Mail/BalancePaidMail.php`
- `app/Mail/BalanceReminderMail.php`
- `app/Mail/BookingCancelledMail.php`
- `app/Mail/NewBookingAdminMail.php`

### Templates email (Blade)
- `resources/views/emails/layout.blade.php` — layout partagé
- `resources/views/emails/booking-confirmed.blade.php`
- `resources/views/emails/deposit-received.blade.php`
- `resources/views/emails/balance-paid.blade.php`
- `resources/views/emails/balance-reminder.blade.php`
- `resources/views/emails/booking-cancelled.blade.php`
- `resources/views/emails/admin-new-booking.blade.php`

### Fichiers modifiés
- `app/Services/BookingTransitionService.php` — dispatch des mails au bon moment
- `app/Jobs/SendBalanceReminders.php` — remplace le `TODO` par l'envoi réel
- `app/Jobs/CancelUnpaidBalances.php` — remplace le `TODO` par l'envoi réel
- `app/Models/Booking.php` — ajout de `clientEmail()` helper
- `config/mail.php` — ajout de `admin_email`

---

## 9. Dépannage

**Email non reçu** → Vérifie que la queue tourne (`php artisan queue:work`), et regarde `failed_jobs` en cas d'erreur.

**Domaine non vérifié** → Les emails arrivent dans le spam ou sont rejetés. Vérifie les DNS dans le dashboard Resend.

**`RESEND_KEY` manquant** → Erreur `Resend API key not configured`. Assure-toi que `.env` est bien chargé (`php artisan config:clear`).
