# GokuSafiri — Guide de déploiement

Deux chemins sont documentés :

- **VPS avec Docker** (recommandé) — reproductible, isolation complète, supporte Horizon, Redis, cron.
- **Hébergement mutualisé** — possible mais limité ; certaines fonctionnalités (Horizon, Redis, cron propre) nécessitent des contournements.

---

## Option A — VPS avec Docker (recommandé)

### Prérequis sur le serveur

| Logiciel | Version minimale |
|---|---|
| Ubuntu / Debian | 22.04 LTS |
| Docker Engine | 24+ |
| Docker Compose v2 | 2.20+ |
| Git | 2.x |
| Certbot (optionnel) | pour SSL |

```bash
# Installer Docker sur Ubuntu
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

---

### 1. Cloner le dépôt

```bash
git clone <url-du-repo> /var/www/gokusafiri
cd /var/www/gokusafiri
```

---

### 2. Configurer l'environnement

```bash
cp .env.example .env
nano .env
```

Variables obligatoires à renseigner :

```dotenv
APP_NAME=GoKuSafiri
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votredomaine.com
APP_KEY=                         # généré à l'étape 4

# Base de données
DB_HOST=db
DB_DATABASE=gokusafiri
DB_USERNAME=gokusafiri
DB_PASSWORD=MotDePasseSolide123!

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=null

# Cache / Session / Queue
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Mail (ex. Mailgun, Brevo, SES)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=postmaster@votredomaine.com
MAIL_PASSWORD=votre_cle_smtp
MAIL_FROM_ADDRESS=hello@votredomaine.com
MAIL_FROM_NAME="GoKuSafiri"

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://votredomaine.com/auth/google/callback

# Stripe (paiements réels)
PAYMENT_DRIVER=stripe
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stockage (local par défaut, S3 recommandé en prod)
FILESYSTEM_DISK=local
```

> **S3 en production** : définir `FILESYSTEM_DISK=s3` et renseigner `AWS_*` pour ne pas perdre les images entre redéploiements (le volume Docker `app_public` est local au serveur).

---

### 3. Configurer Nginx avec HTTPS

Editer `docker/nginx/default.conf` pour pointer vers votre domaine et activer HTTPS :

```nginx
server {
    listen 80;
    server_name votredomaine.com www.votredomaine.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name votredomaine.com www.votredomaine.com;

    ssl_certificate     /etc/letsencrypt/live/votredomaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votredomaine.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    root /var/www/public;
    index index.php;

    client_max_body_size 25M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    location ~ \.php$ {
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 60;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Ajouter les volumes SSL dans `compose.prod.yaml` (service `nginx`) :

```yaml
volumes:
  - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
  - /etc/letsencrypt:/etc/letsencrypt:ro
  - app_public:/var/www/public
```

---

### 4. Obtenir un certificat SSL (Let's Encrypt)

```bash
# Installer certbot sur le HOST (pas dans Docker)
sudo apt install certbot

# Stopper tout ce qui écoute sur le port 80 avant de demander le cert
# Puis :
sudo certbot certonly --standalone -d votredomaine.com -d www.votredomaine.com
```

Le certificat est placé dans `/etc/letsencrypt/live/votredomaine.com/` — monté en lecture seule dans le conteneur nginx.

Renouvellement automatique via cron système (host) :

```bash
sudo crontab -e
# Ajouter :
0 3 * * * certbot renew --quiet && docker compose -f /var/www/gokusafiri/compose.prod.yaml exec nginx nginx -s reload
```

---

### 5. Construire et démarrer

```bash
cd /var/www/gokusafiri

# Build des images (inclut composer install + npm run build)
docker compose -f compose.prod.yaml build --no-cache

# Démarrer tous les services
docker compose -f compose.prod.yaml up -d
```

---

### 6. Initialiser l'application

```bash
# Générer la clé d'application (une seule fois)
docker compose -f compose.prod.yaml exec app php artisan key:generate

# Exécuter les migrations
docker compose -f compose.prod.yaml exec app php artisan migrate --force

# Lien de stockage (à créer dans le conteneur, pas sur le host)
docker compose -f compose.prod.yaml exec app php artisan storage:link
```

---

### 7. Créer le premier administrateur

```bash
docker compose -f compose.prod.yaml exec app php artisan tinker
```

```php
$user = App\Models\User::create([
    'name'              => 'Admin',
    'first_name'        => 'Admin',
    'last_name'         => '',
    'email'             => 'admin@votredomaine.com',
    'password'          => bcrypt('MotDePasseSolide!'),
    'email_verified_at' => now(),
]);
$user->assignRole('super_admin');
exit;
```

Accès backoffice : `https://votredomaine.com/admin`

---

### 8. Configurer le webhook Stripe

Dans le dashboard Stripe → **Developers → Webhooks** → **Add endpoint** :

- URL : `https://votredomaine.com/webhooks/payment/stripe`
- Événements : `payment_intent.succeeded`, `payment_intent.payment_failed`

Copier le `whsec_...` généré dans `.env` → `STRIPE_WEBHOOK_SECRET`.

---

### 9. Vérifier que tout tourne

```bash
docker compose -f compose.prod.yaml ps

# Logs en temps réel
docker compose -f compose.prod.yaml logs -f app
docker compose -f compose.prod.yaml logs -f horizon
```

Services attendus : `app`, `nginx`, `db`, `redis`, `horizon`, `scheduler`.

---

### Déployer une mise à jour

```bash
cd /var/www/gokusafiri
git pull origin main

# Rebuild et redémarrer sans downtime
docker compose -f compose.prod.yaml build --no-cache
docker compose -f compose.prod.yaml up -d

# Migrations si nécessaire
docker compose -f compose.prod.yaml exec app php artisan migrate --force

# Régénérer les conversions d'images si le format a changé
docker compose -f compose.prod.yaml exec app php artisan media-library:regenerate
```

---

---

## Option B — Hébergement mutualisé (sans Docker)

> **Limitations importantes** — la plupart des hébergeurs mutualisés (o2switch, LWS, Infomaniak base, etc.) n'offrent pas Redis ni de processus persistants. Cela impacte :
> - **File d'attente** : pas de Horizon ; utiliser le driver `database` ou `sync` à la place.
> - **Sessions / cache** : utiliser `file` à la place de `redis`.
> - **Scheduler** : remplacer par un cron mutualisé (1 min minimum, souvent 5 min).
> - **Emails** : utiliser un SMTP externe (Brevo, Mailgun, Resend).

Si votre hébergeur propose PHP 8.4, MySQL 8, et un accès SSH : cette option est viable. Sinon, privilégiez un VPS.

---

### Prérequis chez l'hébergeur

- PHP 8.4 avec extensions : `pdo_mysql`, `mbstring`, `bcmath`, `gd`, `zip`, `intl`, `exif`, `opcache`
- MySQL 8.0+
- Accès SSH
- Composer disponible (ou uploadable)
- Node.js 22+ disponible (ou build local puis upload de `public/build/`)

---

### 1. Configurer le document root

Sur l'hébergeur, le document root doit pointer vers `public/` et non vers la racine du projet. Dans le panneau de contrôle (cPanel, DirectAdmin, Plesk) :

- Changer le **Document Root** du domaine vers `/home/user/gokusafiri/public`

Si ce n'est pas possible, créer un `.htaccess` à la racine :

```apache
RewriteEngine On
RewriteRule ^(.*)$ public/$1 [L]
```

---

### 2. Uploader les fichiers

```bash
# En local : builder les assets
npm run build

# Uploader via rsync (exclure node_modules et .git)
rsync -avz --exclude='.git' --exclude='node_modules' --exclude='storage/app' \
    ./ user@hebergeur.com:/home/user/gokusafiri/
```

Ou via Git directement sur le serveur si SSH disponible :

```bash
ssh user@hebergeur.com
cd /home/user
git clone <url-du-repo> gokusafiri
cd gokusafiri
```

---

### 3. Installer les dépendances PHP

```bash
ssh user@hebergeur.com
cd /home/user/gokusafiri
composer install --no-dev --optimize-autoloader
```

Si Composer n'est pas disponible globalement :

```bash
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php composer.phar install --no-dev --optimize-autoloader
```

---

### 4. Configurer l'environnement

```bash
cp .env.example .env
nano .env
```

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votredomaine.com
APP_KEY=                          # généré ci-dessous

# Base de données (valeurs du panneau de contrôle hébergeur)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=user_gokusafiri
DB_USERNAME=user_gokusafiri
DB_PASSWORD=MotDePasseDB

# Pas de Redis sur mutualisé → utiliser file
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database          # ou sync si pas de cron

# Mail externe
MAIL_MAILER=smtp
MAIL_HOST=smtp.brevo.com
MAIL_PORT=587
MAIL_USERNAME=votre@email.com
MAIL_PASSWORD=votre_cle_smtp
MAIL_FROM_ADDRESS=hello@votredomaine.com

PAYMENT_DRIVER=stripe
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

```bash
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

### 5. Créer le premier admin

```bash
php artisan tinker
```

```php
$user = App\Models\User::create([
    'name'              => 'Admin',
    'first_name'        => 'Admin',
    'last_name'         => '',
    'email'             => 'admin@votredomaine.com',
    'password'          => bcrypt('MotDePasseSolide!'),
    'email_verified_at' => now(),
]);
$user->assignRole('super_admin');
exit;
```

---

### 6. Cron mutualisé (scheduler)

Dans le panneau de contrôle (cPanel → Cron Jobs) ou directement via SSH avec `crontab -e` :

```cron
* * * * * cd /home/user/gokusafiri && php artisan schedule:run >> /dev/null 2>&1
```

Cela exécute le scheduler Laravel toutes les minutes.

---

### 7. File d'attente sans Horizon

Avec `QUEUE_CONNECTION=database` (table `jobs` créée par la migration Laravel) :

```bash
# Migration pour créer la table jobs
php artisan queue:table
php artisan migrate
```

Si l'hébergeur autorise les processus de fond (certains VPS mutualisés) :

```bash
nohup php artisan queue:work --sleep=3 --tries=3 --max-time=3600 &>> storage/logs/worker.log &
```

Sinon : utiliser `QUEUE_CONNECTION=sync` — les emails et jobs s'exécutent en synchrone (ralentit légèrement les requêtes, mais fonctionne).

---

### 8. Permissions des dossiers

```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
# (adapter www-data au groupe PHP de votre hébergeur)
```

---

### .htaccess dans `public/` (Apache)

Le fichier `public/.htaccess` est déjà présent dans le projet. S'assurer qu'il est bien uploadé et que `mod_rewrite` est activé chez l'hébergeur.

---

## Récapitulatif : VPS vs Mutualisé

| Fonctionnalité | VPS Docker | Mutualisé |
|---|---|---|
| Redis (sessions, cache, queue) | ✅ | ❌ (remplacer par `file`/`database`) |
| Horizon (queue workers) | ✅ | ❌ (remplacer par `queue:work` ou `sync`) |
| Scheduler Laravel (cron 1 min) | ✅ | ⚠️ (cron mutualisé, min. 1–5 min) |
| SSL automatique (Let's Encrypt) | ✅ | ✅ (via panneau hébergeur) |
| Conversions images (GD/JPEG) | ✅ | ✅ (si GD installé) |
| Stockage S3 (images persistantes) | Recommandé | Recommandé |
| Stripe webhooks | ✅ | ✅ |
| Coût estimé | 5–20 €/mois | 3–10 €/mois |

---

## Variables d'environnement — référence complète

| Variable | Valeur prod | Description |
|---|---|---|
| `APP_ENV` | `production` | Désactive les erreurs détaillées |
| `APP_DEBUG` | `false` | Ne jamais mettre `true` en prod |
| `APP_KEY` | généré | Clé de chiffrement Laravel (ne jamais perdre) |
| `APP_URL` | `https://votredomaine.com` | URL publique complète |
| `PAYMENT_DRIVER` | `stripe` | `fake` en dev uniquement |
| `QUEUE_CONNECTION` | `redis` (VPS) / `database` (mutualisé) | Driver de file d'attente |
| `SESSION_DRIVER` | `redis` (VPS) / `file` (mutualisé) | Driver de session |
| `FILESYSTEM_DISK` | `local` ou `s3` | Stockage des images |
| `LOG_LEVEL` | `warning` | Réduire le volume de logs en prod |
