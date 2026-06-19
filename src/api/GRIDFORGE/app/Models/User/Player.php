<?php

namespace App\Models\User;

use App\Models\Concerns\HasUuidKey;
use App\Models\Game\PlayerProgress;
use App\Models\Transaction\Gift;
use App\Models\Transaction\PlayerItem;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Player extends Authenticatable implements JWTSubject
{
    use HasFactory, HasUuidKey;

    protected $fillable = [
        'username',
        'email',
        'password',
        'status',
        'role_id',
    ];

    protected $hidden = [
        'password',
    ];

    public function profile()
    {
        return $this->hasOne(PlayerProfile::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function progress()
    {
        return $this->hasMany(PlayerProgress::class);
    }

    public function items()
    {
        return $this->hasMany(PlayerItem::class);
    }

    public function sentGifts()
    {
        return $this->hasMany(Gift::class, 'sender_id');
    }

    public function receivedGifts()
    {
        return $this->hasMany(Gift::class, 'recipient_id');
    }

    public function hasRole(string $roleName): bool
    {
        return $this->role?->name === $roleName;
    }

    public function isDev(): bool
    {
        return $this->hasRole('dev');
    }

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        $this->loadMissing('role');

        return [
            'id'       => $this->id,
            'username' => $this->username,
            'email'    => $this->email,
            'status'   => $this->status,
            'role'     => $this->role?->name,
        ];
    }
}
