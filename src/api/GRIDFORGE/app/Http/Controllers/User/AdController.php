<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdController extends BaseController
{
    private const AD_INTERVAL_SECONDS = 1800;
    private const AD_DURATION_SECONDS = 30;
    private const AD_TOKEN_TTL        = 35;

    public function status(): JsonResponse
    {
        $profile = $this->currentPlayer()->profile;

        if ($profile->subscribed) {
            return $this->success(['ads_enabled' => false]);
        }

        if ($profile->ad_state === 'ad_playing') {
            return $this->success(['ads_enabled' => true, 'state' => 'ad_playing']);
        }

        $lastShown = $profile->last_ad_shown_at;
        $secondsElapsed = $lastShown ? now()->diffInSeconds($lastShown) : self::AD_INTERVAL_SECONDS + 1;

        if ($secondsElapsed >= self::AD_INTERVAL_SECONDS) {
            $profile->update(['ad_state' => 'ad_pending']);
            return $this->success(['ads_enabled' => true, 'state' => 'ad_pending']);
        }

        return $this->success([
            'ads_enabled'        => true,
            'state'              => 'idle',
            'next_ad_in_seconds' => self::AD_INTERVAL_SECONDS - (int) $secondsElapsed,
        ]);
    }

    public function start(): JsonResponse
    {
        $player = $this->currentPlayer();
        $profile = $player->profile;

        if ($profile->subscribed) {
            return $this->error('Subscribed players do not receive ads.', 403);
        }

        if ($profile->ad_state !== 'ad_pending') {
            return $this->error('No ad is currently pending.', 409);
        }

        $token = Str::random(64);
        Cache::put("ad_token_{$player->id}", ['token' => $token, 'started_at' => now()->timestamp], self::AD_TOKEN_TTL);
        $profile->update(['ad_state' => 'ad_playing']);

        return $this->success(['token' => $token, 'duration_seconds' => self::AD_DURATION_SECONDS]);
    }

    public function complete(Request $request): JsonResponse
    {
        $data = $request->validate(['token' => 'required|string']);
        $player = $this->currentPlayer();
        $profile = $player->profile;

        if ($profile->subscribed) {
            return $this->error('Subscribed players do not receive ads.', 403);
        }

        $cached = Cache::get("ad_token_{$player->id}");
        if (! $cached || $cached['token'] !== $data['token']) {
            return $this->error('Invalid or expired ad token.', 400);
        }

        if (now()->timestamp - $cached['started_at'] < self::AD_DURATION_SECONDS) {
            return $this->error('Ad not yet complete.', 400);
        }

        Cache::forget("ad_token_{$player->id}");
        $profile->update(['ad_state' => 'idle', 'last_ad_shown_at' => now()]);

        return $this->success(['success' => true]);
    }
}
