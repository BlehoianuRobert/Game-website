<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\BaseController;
use App\Models\Transaction\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ItemCatalogController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $items = Item::with('game')
            ->when($request->query('game_id'), fn ($q, $v) => $q->where('game_id', $v))
            ->when($request->query('rarity'),  fn ($q, $v) => $q->where('rarity', $v))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return $this->success($items);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'game_id'     => 'required|uuid|exists:games,id',
            'name'        => 'required|string|max:128',
            'description' => 'sometimes|nullable|string',
            'rarity'      => 'sometimes|string|in:common,uncommon,rare,epic,legendary',
        ]);

        return $this->success(Item::create($data)->load('game'), 201);
    }

    public function show(string $id): JsonResponse
    {
        return $this->success(Item::with('game')->findOrFail($id));
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:128',
            'description' => 'sometimes|nullable|string',
            'rarity'      => 'sometimes|string|in:common,uncommon,rare,epic,legendary',
        ]);

        $item = Item::findOrFail($id);
        $item->update($data);

        return $this->success($item->fresh()->load('game'));
    }

    public function destroy(string $id): JsonResponse
    {
        Item::findOrFail($id)->delete();
        return $this->success(['message' => 'Item deleted.']);
    }
}
