<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class BackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:backup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backup database and views';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting backup...');

        $timestamp = now()->format('Y_m_d_H_i_s');
        $backupDir = database_path('backups');

        if (!file_exists($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        // Backup Database
        $dbPath = database_path('database.sqlite');
        if (file_exists($dbPath)) {
            $backupDbPath = $backupDir . '/database_' . $timestamp . '.sqlite';
            copy($dbPath, $backupDbPath);
            $this->info('Database backed up to: ' . $backupDbPath);
        } else {
            $this->warn('Database file not found!');
        }

        // Backup landingpageadmin.blade.php
        $viewPath = resource_path('views/admin/landingpageadmin.blade.php');
        if (file_exists($viewPath)) {
            $backupViewPath = $backupDir . '/landingpageadmin_' . $timestamp . '.blade.php';
            copy($viewPath, $backupViewPath);
            $this->info('Landing page view backed up to: ' . $backupViewPath);
        }

        // Backup SignInadmin.blade.php
        $signInPath = resource_path('views/admin/SignInadmin.blade.php');
        if (file_exists($signInPath)) {
            $backupSignInPath = $backupDir . '/SignInadmin_' . $timestamp . '.blade.php';
            copy($signInPath, $backupSignInPath);
            $this->info('Sign in view backed up to: ' . $backupSignInPath);
        }

        $this->info('Backup completed successfully!');
    }
}
