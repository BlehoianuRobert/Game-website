<?php

namespace App\Models\Game;

use App\Models\Concerns\HasUuidKey;
use Illuminate\Database\Eloquent\Model;

class GameVersion extends Model
{
    use HasUuidKey;

    protected $fillable = [
        'game_id',
        'version',
        'is_active',
        'released_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'released_at' => 'datetime',
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}
