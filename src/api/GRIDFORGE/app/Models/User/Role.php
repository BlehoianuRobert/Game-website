<?php

namespace App\Models\User;

use App\Models\Concerns\HasUuidKey;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasUuidKey;

    protected $fillable = ['name', 'description'];

    public function players()
    {
        return $this->hasMany(Player::class);
    }
}
