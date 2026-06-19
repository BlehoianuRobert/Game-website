<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseController;
use App\Models\User\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends BaseController
{
    public function me(): JsonResponse
    {
        return $this->success($this->currentPlayer()->load('profile', 'role'));
    }

    public function index(Request $request): JsonResponse
    {
        $players = Player::with('profile')
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return $this->success($players);
    }

    public function show(string $id): JsonResponse
    {
        $player = Player::with('profile')->findOrFail($id);
        return $this->success($player);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'display_name' => 'sometimes|string|max:64',
            'avatar_url'   => 'sometimes|nullable|url|max:255',
            'bio'          => 'sometimes|nullable|string|max:500',
        ]);

        $profile = $this->currentPlayer()->profile;
        if (! $profile) {
            return $this->error('Player profile not found.', 404);
        }

        $profile->update($data);
        return $this->success($this->currentPlayer()->fresh()->load('profile'));
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        if ($this->currentPlayer()->id === $id) {
            return $this->error('You cannot change your own status.', 403);
        }

        $data = $request->validate([
            'status' => 'required|string|in:active,banned,suspended',
        ]);

        $player = Player::findOrFail($id);
        $player->update(['status' => $data['status']]);

        return $this->success($player->fresh());
    }
}
