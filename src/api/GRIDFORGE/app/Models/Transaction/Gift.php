<?php

namespace App\Models\Transaction;

use App\Models\Concerns\HasUuidKey;
use App\Models\User\Player;
use Illuminate\Database\Eloquent\Model;

class Gift extends Model
{
    use HasUuidKey;

    protected $fillable = [
        'sender_id',
        'recipient_id',
        'item_id',
        'status',
        'sent_at',
        'responded_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    public function sender()
    {
        return $this->belongsTo(Player::class, 'sender_id');
    }

    public function recipient()
    {
        return $this->belongsTo(Player::class, 'recipient_id');
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
