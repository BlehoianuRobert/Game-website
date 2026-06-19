<?php

namespace App\Models\Transaction;

use App\Models\Concerns\HasUuidKey;
use App\Models\Game\Game;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasUuidKey;

    protected $fillable = [
        'game_id',
        'name',
        'description',
        'rarity',
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function playerItems()
    {
        return $this->hasMany(PlayerItem::class);
    }
}
