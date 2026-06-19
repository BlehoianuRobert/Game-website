<?php

namespace App\Http\Controllers;

use Symfony\Component\Yaml\Yaml;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class PlatformController extends BaseController
{
    public function handshake(): JsonResponse
    {
        $player = $this->currentPlayer();

        return $this->success([
            'platform'      => 'GRIDFORGE',
            'version'       => '1.0.0',
            'player_id'     => $player->id,
            'username'      => $player->username,
            'authenticated' => true,
        ]);
    }

    public function openapiJson(): Response
    {
        $yamlPath = base_path('../openapi.yaml');

        if (! file_exists($yamlPath)) {
            return response('OpenAPI spec not found.', 404);
        }

        $array = Yaml::parseFile($yamlPath);

        return response(json_encode($array, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), 200)
            ->header('Content-Type', 'application/json');
    }
}
