<?php

namespace App\Http\Controllers\Game;

use App\Http\Controllers\BaseController;
use App\Models\Game\Game;
use App\Models\Game\PlayerProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatsController extends BaseController
{
    public function myProgress(): JsonResponse
    {
        $progress = $this->currentPlayer()
            ->progress()
            ->with('game')
            ->orderBy('score', 'desc')
            ->get();

        return $this->success($progress);
    }

    public function gameProgress(string $gameId): JsonResponse
    {
        Game::findOrFail($gameId);

        $progress = PlayerProgress::where('player_id', $this->currentPlayer()->id)
            ->where('game_id', $gameId)
            ->with('game')
            ->firstOrFail();

        return $this->success($progress);
    }

    public function upsertProgress(Request $request): JsonResponse
    {
        $data = $request->validate([
            'game_id' => 'required|uuid|exists:games,id',
            'score'   => 'required|integer|min:0',
        ]);

        $player = $this->currentPlayer();
        $progress = PlayerProgress::where('player_id', $player->id)->where('game_id', $data['game_id'])->first();

        if ($progress) {
            if ($data['score'] > $progress->score) {
                $progress->update(['score' => $data['score'], 'updated_at' => now()]);
            }
            return $this->success($progress->fresh()->load('game'));
        }

        $progress = PlayerProgress::create([
            'player_id' => $player->id,
            'game_id'   => $data['game_id'],
            'score'     => $data['score'],
        ]);

        return $this->success($progress->load('game'), 201);
    }

    public function leaderboard(Request $request, string $gameId): JsonResponse
    {
        Game::findOrFail($gameId);
        $limit = min((int) $request->query('limit', 10), 100);

        $entries = PlayerProgress::where('game_id', $gameId)
            ->with('player:id,username,status')
            ->orderBy('score', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn ($entry, $index) => [
                'rank'       => $index + 1,
                'player_id'  => $entry->player_id,
                'username'   => $entry->player->username,
                'score'      => $entry->score,
                'updated_at' => $entry->updated_at,
            ]);

        return $this->success($entries);
    }

    public function myRank(string $gameId): JsonResponse
    {
        Game::findOrFail($gameId);
        $progress = PlayerProgress::where('player_id', $this->currentPlayer()->id)->where('game_id', $gameId)->first();

        if (! $progress) {
            return $this->success(['rank' => null, 'score' => 0, 'message' => 'No score submitted yet.']);
        }

        $rank = PlayerProgress::where('game_id', $gameId)->where('score', '>', $progress->score)->count() + 1;

        return $this->success(['rank' => $rank, 'score' => $progress->score, 'updated_at' => $progress->updated_at]);
    }
}
