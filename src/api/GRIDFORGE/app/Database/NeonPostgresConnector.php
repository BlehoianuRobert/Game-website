<?php

namespace App\Database;

use Illuminate\Database\Connectors\PostgresConnector;

class NeonPostgresConnector extends PostgresConnector
{
    /**
     * Neon's hosted PostgreSQL requires the endpoint ID in the DSN because
     * PHP's bundled libpq does not support SNI for TLS. Without it, the
     * connection is rejected with SQLSTATE 08006.
     *
     * The endpoint ID is the first segment of the host before "-pooler".
     * It is injected via the NEON_ENDPOINT environment variable.
     */
    protected function getDsn(array $config): string
    {
        $dsn = parent::getDsn($config);

        $endpoint = $config['neon_endpoint'] ?? '';
        if ($endpoint) {
            $dsn .= ';options=endpoint=' . $endpoint;
        }

        return $dsn;
    }
}
