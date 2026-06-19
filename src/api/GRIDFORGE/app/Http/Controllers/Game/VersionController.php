<?php

namespace App\Http\Controllers\Game;

use App\Http\Controllers\BaseController;
use App\Models\Game\Game;
use App\Models\Game\GameVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VersionController extends BaseController
{
    public function index(string $gameId): JsonResponse
    {
        $game = Game::findOrFail($gameId);
        return $this->success($game->versions()->orderBy('released_at', 'desc')->get());
    }

    public function store(Request $request, string $gameId): JsonResponse
    {
        $game = Game::findOrFail($gameId);
        $data = $request->validate([
            'version'     => 'required|string|max:32',
            'is_active'   => 'sometimes|boolean',
            'released_at' => 'sometimes|date',
        ]);

        return $this->success($game->versions()->create($data), 201);
    }

    public function update(Request $request, string $gameId, string $versionId): JsonResponse
    {
        Game::findOrFail($gameId);
        $data = $request->validate([
            'version'     => 'sometimes|string|max:32',
            'is_active'   => 'sometimes|boolean',
            'released_at' => 'sometimes|date',
        ]);

        $version = GameVersion::where('game_id', $gameId)->findOrFail($versionId);
        $version->update($data);

        return $this->success($version->fresh());
    }

    public function destroy(string $gameId, string $versionId): JsonResponse
    {
        Game::findOrFail($gameId);
        GameVersion::where('game_id', $gameId)->findOrFail($versionId)->delete();

        return $this->success(['message' => 'Version deleted.']);
    }
}
