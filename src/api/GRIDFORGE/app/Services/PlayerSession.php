<?php

namespace App\Services;

use App\Models\User\Player;

class PlayerSession
{
    private ?Player $player = null;

    public function setPlayer(Player $player): void
    {
        $this->player = $player;
    }

    public function getPlayer(): ?Player
    {
        if ($this->player === null) {
            $this->player = auth()->user();
        }

        return $this->player;
    }

    public function isAuthenticated(): bool
    {
        return $this->getPlayer() !== null;
    }

    public function clear(): void
    {
        $this->player = null;
    }
}
