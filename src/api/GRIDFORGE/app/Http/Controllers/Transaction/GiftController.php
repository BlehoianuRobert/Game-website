<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\BaseController;
use App\Models\Transaction\Gift;
use App\Models\Transaction\PlayerItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GiftController extends BaseController
{
    public function sent(): JsonResponse
    {
        return $this->success(Gift::with(['recipient', 'item'])->where('sender_id', $this->currentPlayer()->id)->orderBy('sent_at', 'desc')->get());
    }

    public function received(): JsonResponse
    {
        return $this->success(Gift::with(['sender', 'item'])->where('recipient_id', $this->currentPlayer()->id)->orderBy('sent_at', 'desc')->get());
    }

    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            'recipient_id' => 'required|uuid|exists:players,id',
            'item_id'      => 'required|uuid|exists:items,id',
        ]);

        $sender = $this->currentPlayer();
        if ($data['recipient_id'] === $sender->id) {
            return $this->error('You cannot send a gift to yourself.', 422);
        }

        $senderItem = PlayerItem::where('player_id', $sender->id)->where('item_id', $data['item_id'])->first();
        if (! $senderItem) {
            return $this->error('You do not own this item.', 422);
        }

        $gift = Gift::create([
            'sender_id'    => $sender->id,
            'recipient_id' => $data['recipient_id'],
            'item_id'      => $data['item_id'],
            'status'       => 'pending',
        ]);

        return $this->success($gift->load(['sender', 'recipient', 'item']), 201);
    }

    public function accept(string $id): JsonResponse
    {
        $player = $this->currentPlayer();
        $gift = Gift::where('recipient_id', $player->id)->where('status', 'pending')->findOrFail($id);

        DB::transaction(function () use ($gift, $player) {
            $senderItem = PlayerItem::where('player_id', $gift->sender_id)->where('item_id', $gift->item_id)->first();
            if ($senderItem) {
                $senderItem->quantity <= 1 ? $senderItem->delete() : $senderItem->decrement('quantity');
            }

            $recipientItem = PlayerItem::where('player_id', $player->id)->where('item_id', $gift->item_id)->first();
            $recipientItem ? $recipientItem->increment('quantity') : PlayerItem::create(['player_id' => $player->id, 'item_id' => $gift->item_id, 'quantity' => 1]);

            $gift->update(['status' => 'accepted', 'responded_at' => now()]);
        });

        return $this->success($gift->fresh()->load(['sender', 'recipient', 'item']));
    }

    public function decline(string $id): JsonResponse
    {
        $gift = Gift::where('recipient_id', $this->currentPlayer()->id)->where('status', 'pending')->findOrFail($id);
        $gift->update(['status' => 'declined', 'responded_at' => now()]);

        return $this->success($gift->fresh()->load(['sender', 'recipient', 'item']));
    }
}
