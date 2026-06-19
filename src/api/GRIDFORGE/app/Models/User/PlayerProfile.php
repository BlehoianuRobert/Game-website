<?php

namespace App\Models\User;

use App\Models\Concerns\HasUuidKey;
use Illuminate\Database\Eloquent\Model;

class PlayerProfile extends Model
{
    use HasUuidKey;

    protected $fillable = [
        'player_id',
        'display_name',
        'avatar_url',
        'bio',
        'subscribed',
        'last_ad_shown_at',
        'ad_state',
    ];

    protected $casts = [
        'subscribed' => 'boolean',
        'last_ad_shown_at' => 'datetime',
    ];

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}
