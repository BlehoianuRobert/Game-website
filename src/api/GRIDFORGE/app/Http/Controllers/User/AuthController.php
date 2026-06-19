<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\BaseController;
use App\Models\User\Player;
use App\Models\User\PlayerProfile;
use App\Models\User\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends BaseController
{
    /**
     * POST /api/v1/auth/register
     * * Register a brand new player or developer account and issue an auth token.
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => 'required|string|max:64|unique:players,username',
            'email'    => 'required|email|unique:players,email',
            'password' => 'required|string|min:8',
            'role'     => 'required|string|in:player,dev',
        ]);

        $role = Role::where('name', $data['role'])->firstOrFail();

        $player = Player::create([
            'username' => $data['username'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role_id'  => $role->id,
        ]);

        // Automatically set up the profile relationship
        PlayerProfile::create(['player_id' => $player->id]);

        $this->session->setPlayer($player);
        $token = auth()->login($player);

        return $this->success([
            'token'  => $token,
            'player' => $player->only(['id', 'username', 'email']),
        ], 201)->withCookie($this->getAuthCookie($token));
    }

    /**
     * POST /api/v1/auth/login
     * * Authenticate user credentials and return player context with a secure cookie.
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $token = auth()->attempt([
            'email'    => $data['email'],
            'password' => $data['password'],
        ]);

        if (! $token) {
            return $this->error('Invalid credentials.', 401);
        }

        $this->session->setPlayer(auth()->user());

        return $this->success([
            'token'  => $token,
            'player' => auth()->user()->only(['id', 'username', 'email']),
        ])->withCookie($this->getAuthCookie($token));
    }

    /**
     * POST /api/v1/auth/logout
     * * Invalidate the current token sessions and strip the authentication cookie.
     */
    public function logout(): JsonResponse
    {
        auth()->logout();
        $this->session->clear();

        return $this->success(['message' => 'Logged out successfully.'])
            ->withoutCookie('token');
    }

    /**
     * Helper logic to build the Cross-Origin/HttpOnly secure cookie configuration uniformly.
     */
    private function getAuthCookie(string $token)
    {
        return cookie(
            'token',
            $token,
            config('jwt.ttl'),
            '/',
            null,
            true,  // Secure
            true,  // HttpOnly
            false, // Raw
            'None' // SameSite configuration needed for external game engines/clients
        );
    }
}
