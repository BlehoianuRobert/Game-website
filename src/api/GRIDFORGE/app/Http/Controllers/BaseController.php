<?php

namespace App\Http\Controllers;

use App\Models\User\Player;
use App\Services\PlayerSession;
use Illuminate\Http\JsonResponse;

abstract class BaseController extends Controller
{
    public function __construct(protected PlayerSession $session) {}

    /**
     * Get the currently authenticated player model instance from session storage.
     */
    protected function currentPlayer(): Player
    {
        return $this->session->getPlayer();
    }

    /**
     * Uniform JSON wrapper for successful API responses.
     */
    protected function success(mixed $data, int $status = 200): JsonResponse
    {
        return response()->json(['data' => $data], $status);
    }

    /**
     * Uniform JSON wrapper for error API responses.
     */
    protected function error(string $message, int $status): JsonResponse
    {
        return response()->json(['error' => $message], $status);
    }
}
