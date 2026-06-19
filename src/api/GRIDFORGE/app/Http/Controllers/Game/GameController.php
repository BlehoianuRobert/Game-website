<?php

namespace App\Http\Controllers\Game;

use App\Http\Controllers\BaseController;
use App\Models\Game\Game;
use App\Models\Game\GameVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GameController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Game::with('versions')->orderBy('created_at', 'desc');

        if ($request->has('player_id')) {
            $query->whereHas('progress', function ($q) use ($request) {
                $q->where('player_id', $request->player_id);
            });
        }

        return $this->success($query->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:128|unique:games,name',
            'description' => 'sometimes|nullable|string',
        ]);

        return $this->success(Game::create($data)->load('versions'), 201);
    }

    public function show(string $id): JsonResponse
    {
        return $this->success(Game::with('versions')->findOrFail($id));
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:128|unique:games,name,' . $id,
            'description' => 'sometimes|nullable|string',
        ]);

        $game = Game::findOrFail($id);
        $game->update($data);

        return $this->success($game->fresh()->load('versions'));
    }

    public function destroy(string $id): JsonResponse
    {
        Game::findOrFail($id)->delete();
        return $this->success(['message' => 'Game deleted.']);
    }
}
