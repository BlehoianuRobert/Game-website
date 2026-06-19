<?php

namespace App\Models\Transaction;

use App\Models\Concerns\HasUuidKey;
use App\Models\User\Player;
use Illuminate\Database\Eloquent\Model;

class PlayerItem extends Model
{
    use HasUuidKey;

    protected $fillable = [
        'player_id',
        'item_id',
        'quantity',
    ];

    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
