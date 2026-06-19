<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\BaseController;
use App\Models\Transaction\Item;
use App\Models\Transaction\PlayerItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class InventoryController extends BaseController
{
    public function index(): JsonResponse
    {
        return $this->success($this->currentPlayer()->items()->with('item.game')->get());
    }

    public function award(Request $request): JsonResponse
    {
        $data = $request->validate([
            'item_id'  => 'required|uuid|exists:items,id',
            'quantity' => 'sometimes|integer|min:1|max:9999',
        ]);

        $player = $this->currentPlayer();
        $quantity = $data['quantity'] ?? 1;

        $existing = PlayerItem::where('player_id', $player->id)->where('item_id', $data['item_id'])->first();

        if ($existing) {
            $existing->increment('quantity', $quantity);
            return $this->success($existing->fresh()->load('item.game'));
        }

        $playerItem = PlayerItem::create([
            'player_id' => $player->id,
            'item_id'   => $data['item_id'],
            'quantity'  => $quantity,
        ]);

        return $this->success($playerItem->load('item.game'), 201);
    }

    public function remove(string $itemId): JsonResponse
    {
        PlayerItem::where('player_id', $this->currentPlayer()->id)
            ->where('item_id', $itemId)
            ->firstOrFail()
            ->delete();

        return $this->success(['message' => 'Item removed from inventory.']);
    }
}
