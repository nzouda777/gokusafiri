<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * php artisan app:setup-production
 *
 * Vérifie et prépare l'environnement de production sur serveur mutualisé.
 * À exécuter une fois après chaque déploiement (ou via post-deploy hook).
 */
class SetupProduction extends Command
{
    protected $signature   = 'app:setup-production';
    protected $description = 'Prépare l\'environnement de production (migrations, cache, queues)';

    public function handle(): int
    {
        $this->info('── GokuSafiri · Production Setup ──────────────────');

        // 1. Migrations
        $this->step('Migrations');
        $this->call('migrate', ['--force' => true]);

        // 2. Nettoyage des caches
        $this->step('Cache clear');
        $this->call('config:clear');
        $this->call('route:clear');
        $this->call('view:clear');
        $this->call('event:clear');

        // 3. Rechargement optimisé
        $this->step('Cache warm-up');
        $this->call('config:cache');
        $this->call('route:cache');
        $this->call('view:cache');
        $this->call('event:cache');

        // 4. Liens symboliques storage
        $this->step('Storage link');
        $this->call('storage:link');

        // 5. Vérification table jobs (queue database driver)
        $this->step('Queue check');
        $this->checkQueueTable();

        // 6. Vider les jobs bloqués (initiated depuis > 2h)
        $this->step('Stale jobs cleanup');
        $this->call('queue:flush');

        $this->newLine();
        $this->info('✓ Setup terminé. Pense à vérifier le cron dans cPanel.');
        $this->line('  Cron: * * * * * cd ' . base_path() . ' && php artisan schedule:run >> /dev/null 2>&1');

        return self::SUCCESS;
    }

    private function step(string $label): void
    {
        $this->newLine();
        $this->comment("→ {$label}");
    }

    private function checkQueueTable(): void
    {
        try {
            DB::table('jobs')->count();
            $this->line('  ✓ Table jobs présente');
        } catch (\Exception) {
            $this->warn('  ⚠ Table jobs manquante — lance: php artisan queue:table && php artisan migrate');
        }

        try {
            DB::table('failed_jobs')->count();
            $this->line('  ✓ Table failed_jobs présente');
        } catch (\Exception) {
            $this->warn('  ⚠ Table failed_jobs manquante — lance: php artisan queue:failed-table && php artisan migrate');
        }

        try {
            DB::table('cache')->count();
            $this->line('  ✓ Table cache présente (withoutOverlapping() fonctionnel)');
        } catch (\Exception) {
            $this->warn('  ⚠ Table cache manquante — nécessaire pour withoutOverlapping()');
            $this->warn('    Lance: php artisan cache:table && php artisan migrate');
        }
    }
}
