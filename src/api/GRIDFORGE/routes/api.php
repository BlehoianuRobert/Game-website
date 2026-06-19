<?php

use App\Http\Controllers\PlatformController;
use App\Http\Controllers\User\AdController;
use App\Http\Controllers\User\AuthController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\Game\GameController;
use App\Http\Controllers\Game\VersionController;
use App\Http\Controllers\Game\StatsController;
use App\Http\Controllers\Transaction\GiftController;
use App\Http\Controllers\Transaction\InventoryController;
use App\Http\Controllers\Transaction\ItemCatalogController;
use Illuminate\Support\Facades\Route;

// ─── Public: OpenAPI spec as JSON (for SDK code generation) ──────────────────
Route::get('v1/openapi.json', [PlatformController::class, 'openapiJson']);

// ─── Auth (public) ────────────────────────────────────────────────────────────
Route::prefix('v1/auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
});

// ─── Protected ────────────────────────────────────────────────────────────────
Route::middleware(['auth:api', 'auth.cookie'])->prefix('v1')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',      [ProfileController::class, 'me']); // Handled by ProfileController now

    // ─── Players (player: own profile; dev: all players + status) ────────────
    Route::prefix('players')->group(function () {
        Route::get('me',            [ProfileController::class, 'me']);
        Route::put('me',            [ProfileController::class, 'update']);

        // dev-only
        Route::middleware('role:dev')->group(function () {
            Route::get('',                [ProfileController::class, 'index']);
            Route::get('{id}',            [ProfileController::class, 'show']);
            Route::patch('{id}/status',   [ProfileController::class, 'updateStatus']);
        });
    });

    // ─── Games (read: all; write: dev only) ───────────────────────────────────
    Route::prefix('games')->group(function () {
        Route::get('',          [GameController::class, 'index']);
        Route::get('{id}',      [GameController::class, 'show']);
        Route::get('{gameId}/versions', [VersionController::class, 'index']);

        // dev-only
        Route::middleware('role:dev')->group(function () {
            Route::post('',                                         [GameController::class, 'store']);
            Route::put('{id}',                                      [GameController::class, 'update']);
            Route::delete('{id}',                                   [GameController::class, 'destroy']);
            Route::post('{gameId}/versions',                        [VersionController::class, 'store']);
            Route::patch('{gameId}/versions/{versionId}',           [VersionController::class, 'update']);
            Route::delete('{gameId}/versions/{versionId}',          [VersionController::class, 'destroy']);
        });
    });

    // ─── Items (read: all; write: dev only) ───────────────────────────────────
    Route::prefix('items')->group(function () {
        Route::get('',      [ItemCatalogController::class, 'index']);
        Route::get('{id}',  [ItemCatalogController::class, 'show']);

        // dev-only
        Route::middleware('role:dev')->group(function () {
            Route::post('',           [ItemCatalogController::class, 'store']);
            Route::put('{id}',        [ItemCatalogController::class, 'update']);
            Route::delete('{id}',     [ItemCatalogController::class, 'destroy']);
        });
    });

    // ─── Inventory ────────────────────────────────────────────────────────────
    Route::prefix('players/me/inventory')->group(function () {
        Route::get('',          [InventoryController::class, 'index']);
        Route::post('',         [InventoryController::class, 'award']);
        Route::delete('{itemId}', [InventoryController::class, 'remove']);
    });

    // ─── Gifts ────────────────────────────────────────────────────────────────
    Route::prefix('gifts')->group(function () {
        Route::get('sent',          [GiftController::class, 'sent']);
        Route::get('received',      [GiftController::class, 'received']);
        Route::post('',             [GiftController::class, 'send']);
        Route::patch('{id}/accept', [GiftController::class, 'accept']);
        Route::patch('{id}/decline',[GiftController::class, 'decline']);
    });

    // ─── Progress & Leaderboard ───────────────────────────────────────────────
    Route::get('players/me/progress',          [StatsController::class, 'myProgress']);
    Route::get('players/me/progress/{gameId}', [StatsController::class, 'gameProgress']);
    Route::post('players/me/progress',         [StatsController::class, 'upsertProgress']);
    Route::get('leaderboard/{gameId}',         [StatsController::class, 'leaderboard']);
    Route::get('leaderboard/{gameId}/me',      [StatsController::class, 'myRank']);

    // ─── Ads ──────────────────────────────────────────────────────────────────
    Route::prefix('ads')->group(function () {
        Route::get('status',   [AdController::class, 'status']);
        Route::post('start',   [AdController::class, 'start']);
        Route::post('complete',[AdController::class, 'complete']);
    });

    // ─── SDK ──────────────────────────────────────────────────────────────────
    Route::get('sdk/handshake', [PlatformController::class, 'handshake']);
});
