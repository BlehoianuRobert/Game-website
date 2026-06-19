<?php

namespace App\Models\Game;

use App\Models\Concerns\HasUuidKey;
use App\Models\Transaction\Item;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasUuidKey;

    protected $fillable = [
        'name',
        'description',
    ];

    public function versions()
    {
        return $this->hasMany(GameVersion::class);
    }

    public function items()
    {
        return $this->hasMany(Item::class);
    }

    public function progress()
    {
        return $this->hasMany(PlayerProgress::class);
    }
}
