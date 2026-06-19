<?php

namespace App\Models\Game;

use App\Models\Concerns\HasUuidKey;
use App\Models\User\Player;
use Illuminate\Database\Eloquent\Model;

class PlayerProgress extends Model
{
    use HasUuidKey;

    public $timestamps = false;

    protected $fillable = [
        'player_id',
        'game_id',
        'score',
        'updated_at',
    ];

    protected $casts = [
        'score' => 'integer',
        'updated_at' => 'datetime',
    ];

    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}
