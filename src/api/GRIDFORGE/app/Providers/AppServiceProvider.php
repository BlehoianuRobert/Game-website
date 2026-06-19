<?php

namespace App\Providers;

use App\Database\NeonPostgresConnector;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(\App\Services\PlayerSession::class);

        // Laravel's ConnectionFactory checks 'db.connector.{driver}' in the
        // container before falling back to its hardcoded switch. Binding here
        // ensures NeonPostgresConnector is used for every pgsql connection.
        $this->app->bind('db.connector.pgsql', NeonPostgresConnector::class);

        // Inject the Neon endpoint ID into the pgsql connection config so the
        // connector can append it to the DSN string (PHP libpq SNI workaround).
        $neonEndpoint = env('NEON_ENDPOINT');
        if ($neonEndpoint) {
            config(['database.connections.pgsql.neon_endpoint' => $neonEndpoint]);
        }
    }

    public function boot(): void
    {
        Schema::defaultStringLength(128);
        Model::shouldBeStrict(! app()->isProduction());
    }
}
