⏺ Build ✅ sans erreur. Voici ce qui a été livré — tout dynamique depuis le 
  backoffice :
     
  ---
  Ce qui a été implémenté
  
  Design (pixel-perfect Figma)

  ┌─────────────────┬───────────────────────────────────────────────────────┐
  │      Page       │                  Éléments redessinés                  │
  ├─────────────────┼───────────────────────────────────────────────────────┤
  │                 │ Header logo + "Secure checkout" + Sign in/Plan my     │
  │ CheckoutLayout  │ trip · Stepper 4 étapes (✓ vert / orange actif / gris │
  │                 │  futur) · Footer dark                                 │
  ├─────────────────┼───────────────────────────────────────────────────────┤
  │                 │ Date cards 3 colonnes avec radio checkmark vert ·     │
  │ Step 1 — Trip & │ "Only X slots left" en orange · Compteurs             │
  │  dates          │ ±adultes/enfants/nourrissons · Addons avec checkboxes │
  │                 │  stylisées · Sidebar summary live                     │
  ├─────────────────┼───────────────────────────────────────────────────────┤
  │ Step 2 —        │ Lead contact (nom, email, téléphone avec dial code) · │
  │ Travelers       │  Traveler cards par paxe avec "Same as lead contact"  │
  │                 │ · Dropdown pays (ISO-2) · Champ special request       │
  ├─────────────────┼───────────────────────────────────────────────────────┤
  │                 │ Toggle Pay in full / Reserve with deposit (dynamique) │
  │ Step 3 —        │  · Stripe split fields (CardNumber, Expiry, CVV,      │
  │ Payment         │ Postal) · Labels "Save $X" et "20% today" · Trust     │
  │                 │ signals Stripe                                        │
  ├─────────────────┼───────────────────────────────────────────────────────┤
  │ Step 4 —        │ Grande checkmark verte · "You're booked! 🎉" · 3      │
  │ Confirmation    │ étapes numérotées · CTA "View dashboard" + "Download  │
  │                 │ PDF" · Summary card final                             │
  └─────────────────┴───────────────────────────────────────────────────────┘
  
  Fonctionnalités backend (données 100% dynamiques)
                                                         
  - Prix live : prix du schedule sélectionné × voyageurs + addons + membre
  discount 5% + taxes recalculés à chaque interaction
  - Schedules : seats_left depuis la table tour_schedules, badge sold out/low
  stock automatique
  - Addons : label traduit via label (translatable), price_per_person depuis la
  table tour_addons
  - Switch deposit/full : POST /booking/{ref}/payment/plan → nouveau
  PaymentIntent Stripe → nouveau client_secret sans rechargement de page
  - 3DS : géré automatiquement par confirmCardPayment (popup ou redirect selon
  la banque)
  - Webhook : payment_intent.succeeded → transition d'état booking (Pending →
  DepositPaid → Confirmed)
  - Balance auto-charge : payment_method sauvegardé via setup_future_usage: 
  off_session → URL signée pour payer le solde

  À compléter
  
  # Dans le container Docker :
  docker compose exec app composer update stripe/stripe-php
  docker compose exec app php artisan migrate

  # Dans .env : remplacer les clés Stripe test
  STRIPE_KEY=pk_test_xxxx
  STRIPE_SECRET=sk_test_xxxx
  STRIPE_WEBHOOK_SECRET=whsec_xxxx

