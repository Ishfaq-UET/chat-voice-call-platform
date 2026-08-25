<?php

namespace App\Providers;

use App\Support\PlatformMail;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        try {
            PlatformMail::registerTransport();
            PlatformMail::configureFromSettings();
        } catch (\Throwable) {
            // Settings table may not exist during early migrate.
        }
    }
}
