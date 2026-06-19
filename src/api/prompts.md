# Platform Build Prompts — Run in Order

Stack: Laravel 11 (PHP), JWT (tymon/jwt-auth), Neon (PostgreSQL), UUIDs for all PKs, Vite + Vue 3 (demo client).
Each section is owned by one role. Run prompts within a section in order.

---

# ROLE: API Engineer — Task 1

Working directory: `src/api/`

---

## Prompt 1 — Laravel project setup + Neon DB + all migrations

**Pre-flight:** verify PHP >= 8.2 and Composer are installed (`php -v && composer -V`). If missing, install before continuing.

Scaffold Laravel 11 into `src/api/`. The directory already contains a `README.md` — handle it:
- Move `README.md` to a temp location, scaffold the project with `composer create-project laravel/laravel .` inside `src/api/`, then restore `README.md`.

After scaffolding:
- In `AppServiceProvider::boot()`: set `Schema::defaultStringLength(128)` and `Model::shouldBeStrict(true)` (fails loudly on mass-assignment issues)
- Set default primary key type to string in `AppServiceProvider`: `Model::unguard()` is NOT needed — use `$fillable` per model
- Configure `.env.example` with placeholders:
  ```
  DB_CONNECTION=pgsql
  DB_HOST=
  DB_PORT=5432
  DB_DATABASE=
  DB_USERNAME=
  DB_PASSWORD=
  JWT_SECRET=
  ```

**Write all 8 migrations in this exact order** (foreign key order matters):

1. `create_players_table`
   - `id` — `$table->uuid('id')->primary()`
   - `username` — unique string
   - `email` — unique string
   - `password` — string (NOT password_hash — Laravel's auth system expects this exact column name)
   - `status` — string, default `'active'`
   - `timestamps()`

2. `create_player_profiles_table`
   - `id` — uuid primary
   - `player_id` — `$table->foreignUuid('player_id')->constrained('players')->cascadeOnDelete()`
   - `display_name` — string nullable
   - `avatar_url` — string nullable
   - `bio` — text nullable
   - `subscribed` — boolean default false
   - `last_ad_shown_at` — timestamp nullable
   - `ad_state` — string default `'idle'`
   - `timestamps()`

3. `create_games_table`
   - `id` — uuid primary
   - `name` — string
   - `description` — text nullable
   - `timestamps()`

4. `create_game_versions_table`
   - `id` — uuid primary
   - `game_id` — `$table->foreignUuid('game_id')->constrained('games')->cascadeOnDelete()`
   - `version` — string
   - `is_active` — boolean default true
   - `released_at` — timestamp default now
   - `timestamps()`

5. `create_player_progress_table`
   - `id` — uuid primary
   - `player_id` — foreignUuid → players, cascadeOnDelete
   - `game_id` — foreignUuid → games, cascadeOnDelete
   - `score` — unsignedBigInteger default 0
   - `updated_at` — timestamp
   - `$table->unique(['player_id', 'game_id'])`

6. `create_items_table`
   - `id` — uuid primary
   - `game_id` — foreignUuid → games, cascadeOnDelete
   - `name` — string
   - `description` — text nullable
   - `rarity` — string default `'common'`
   - `timestamps()`

7. `create_player_items_table`
   - `id` — uuid primary
   - `player_id` — foreignUuid → players, cascadeOnDelete
   - `item_id` — foreignUuid → items, cascadeOnDelete
   - `quantity` — unsignedInteger default 1
   - `$table->unique(['player_id', 'item_id'])`
   - `timestamps()`

8. `create_gifts_table`
   - `id` — uuid primary
   - `sender_id` — `$table->foreignUuid('sender_id')->constrained('players')`
   - `recipient_id` — `$table->foreignUuid('recipient_id')->constrained('players')`
   - `item_id` — `$table->foreignUuid('item_id')->constrained('items')`
   - `status` — string default `'pending'`
   - `sent_at` — timestamp default now
   - `responded_at` — timestamp nullable
   - `timestamps()`

**Create Eloquent models for all 8 tables.** Every model must have:
```php
public $incrementing = false;
protected $keyType = 'string';

protected static function boot(): void
{
    parent::boot();
    static::creating(function ($model) {
        if (empty($model->{$model->getKeyName()})) {
            $model->{$model->getKeyName()} = (string) \Illuminate\Support\Str::uuid();
        }
    });
}
```
This is critical — without it, UUID primary keys will be null on insert.

Add relationships:
- `Player` hasOne `PlayerProfile`, hasMany `PlayerProgress`, hasMany `PlayerItem`
- `PlayerProfile` belongsTo `Player`
- `Game` hasMany `GameVersion`, hasMany `Item`, hasMany `PlayerProgress`
- `GameVersion` belongsTo `Game`
- `Item` belongsTo `Game`, hasMany `PlayerItem`
- `PlayerItem` belongsTo `Player`, belongsTo `Item`
- `Gift` belongsTo `Player` (as sender), belongsTo `Player` (as recipient), belongsTo `Item`
- `PlayerProgress` belongsTo `Player`, belongsTo `Game`

Do NOT run migrations yet — show the final file list and confirm.

---

## Prompt 2 — Singleton PlayerSession + BaseController architecture

Establish the core architecture before writing any controllers. This pattern ensures the authenticated player is resolved once per request and shared across all controllers via dependency injection.

**Create `app/Services/PlayerSession.php`:**
```php
<?php
namespace App\Services;

use App\Models\Player;

class PlayerSession
{
    private ?Player $player = null;

    public function setPlayer(Player $player): void
    {
        $this->player = $player;
    }

    public function getPlayer(): ?Player
    {
        if ($this->player === null) {
            $this->player = auth()->user();
        }
        return $this->player;
    }

    public function isAuthenticated(): bool
    {
        return $this->getPlayer() !== null;
    }

    public function clear(): void
    {
        $this->player = null;
    }
}
```

**Register as a singleton in `AppServiceProvider::register()`:**
```php
$this->app->singleton(\App\Services\PlayerSession::class);
```
This ensures Laravel's service container creates exactly one `PlayerSession` instance per request lifecycle and injects the same instance wherever it is type-hinted.

**Create `app/Http/Controllers/BaseController.php`:**
```php
<?php
namespace App\Http\Controllers;

use App\Models\Player;
use App\Services\PlayerSession;

abstract class BaseController extends Controller
{
    public function __construct(protected PlayerSession $session) {}

    protected function currentPlayer(): Player
    {
        return $this->session->getPlayer();
    }

    protected function success(mixed $data, int $status = 200): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => $data], $status);
    }

    protected function error(string $message, int $status): \Illuminate\Http\JsonResponse
    {
        return response()->json(['error' => $message], $status);
    }
}
```

All future controllers must extend `BaseController`, not `Controller` directly. This gives every controller:
- `$this->session` — the singleton PlayerSession
- `$this->currentPlayer()` — the resolved authenticated Player model (no repeated DB hits)
- `$this->success()` / `$this->error()` — consistent JSON response format

**Add a global exception handler** in `bootstrap/app.php` (Laravel 11 style):
- 401 for `AuthenticationException`
- 403 for `AuthorizationException`
- 404 for `ModelNotFoundException`
- 422 for `ValidationException`
All return `{ "error": "message" }` JSON — never HTML.

---

## Prompt 3 — Authentication: register, login, JWT middleware

- Install `tymon/jwt-auth` via composer (`composer require tymon/jwt-auth`)
- Publish config: `php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"`
- Generate secret: `php artisan jwt:secret`
- **Rename `app/Models/User.php` to `app/Models/Player.php`** and update the class name. Update `config/auth.php` providers to point to `App\Models\Player`. Update the guard driver to `jwt`.
- Implement `JWTSubject` on `Player` model:
  ```php
  public function getJWTIdentifier(): mixed { return $this->getKey(); }
  public function getJWTCustomClaims(): array { return []; }
  ```
- **Create `app/Http/Controllers/AuthController.php`** extending `BaseController`:
  - `POST /api/v1/auth/register`:
    - Validate: username (required, unique), email (required, email, unique), password (required, min:8)
    - Create Player (hash password with `bcrypt()`)
    - Auto-create PlayerProfile row for the new player
    - Call `$this->session->setPlayer($player)` immediately after creation
    - Generate JWT: `$token = auth()->login($player)`
    - Return `$this->success(['token' => $token, 'player' => $player->only(['id','username','email'])])`
  - `POST /api/v1/auth/login`:
    - Validate credentials
    - Attempt auth: `$token = auth()->attempt(['email' => $email, 'password' => $password])`
    - On fail: `$this->error('Invalid credentials', 401)`
    - On success: `$this->session->setPlayer(auth()->user())`, return token
  - `POST /api/v1/auth/logout` (protected):
    - `auth()->logout()`
    - `$this->session->clear()`
    - Return `$this->success(['message' => 'Logged out'])`
  - `GET /api/v1/auth/me` (protected):
    - Return `$this->success($this->currentPlayer()->load('profile'))`
- Register routes in `routes/api.php` under `/api/v1/` prefix

---

## Prompt 4 — Players & player_profiles endpoints

Create `app/Http/Controllers/PlayerController.php` extending `BaseController`.

All routes protected by `auth:api` middleware.

Endpoints:
- `GET /api/v1/players/me` — return `$this->currentPlayer()->load('profile')`
- `PUT /api/v1/players/me` — validate and update profile fields only (display_name, avatar_url, bio, subscribed). Block changes to username and email. Update via `$this->currentPlayer()->profile->update([...])`
- `GET /api/v1/players/{id}` — load player by UUID. Return public fields only: id, username, profile->display_name, profile->avatar_url, profile->subscribed. Never expose email or password.
- `GET /api/v1/players` — paginate(20). Return id, username, status per player.
- `PATCH /api/v1/players/{id}/status` — validate status is one of: active, suspended. Update and return player.

Return `$this->error('Player not found', 404)` for unknown UUIDs.

---

## Prompt 5 — Games & game_versions endpoints

Create `app/Http/Controllers/GameController.php` and `app/Http/Controllers/GameVersionController.php`, both extending `BaseController`.

**GameController:**
- `GET /api/v1/games` — list all games, eager load active version count: `Game::withCount(['versions as active_versions_count' => fn($q) => $q->where('is_active', true)])->get()`
- `POST /api/v1/games` — validate (name required), create, return game
- `GET /api/v1/games/{id}` — load game with all versions
- `PUT /api/v1/games/{id}` — update name/description
- `DELETE /api/v1/games/{id}` — delete (cascade handles versions, items, progress)

**GameVersionController:**
- `GET /api/v1/games/{id}/versions` — list versions for game
- `POST /api/v1/games/{id}/versions` — create version (version string required, is_active, released_at)
- `PATCH /api/v1/games/{id}/versions/{versionId}` — toggle is_active or update version string
- `DELETE /api/v1/games/{id}/versions/{versionId}` — delete version

Return 404 for unknown game or version UUIDs.

---

## Prompt 6 — Items & inventory endpoints

Create `app/Http/Controllers/ItemController.php` and `app/Http/Controllers/InventoryController.php`, both extending `BaseController`.

**ItemController:**
- `GET /api/v1/games/{id}/items` — list items for a game
- `POST /api/v1/games/{id}/items` — create item. Validate rarity against: `['common','rare','epic','legendary']`
- `GET /api/v1/games/{id}/items/{itemId}` — single item
- `DELETE /api/v1/games/{id}/items/{itemId}` — delete item

**InventoryController:**
- `GET /api/v1/players/me/inventory` — return player's owned items with quantity. Accept optional `game_id` query param to filter by game.
- `POST /api/v1/players/me/inventory` — body: item_id, quantity (default 1). Upsert: if player already owns the item, increment quantity. Use `updateOrCreate(['player_id' => ..., 'item_id' => ...], [...])` with quantity increment.

---

## Prompt 7 — Gifts lifecycle endpoints

Create `app/Http/Controllers/GiftController.php` extending `BaseController`.

**Endpoints:**
- `POST /api/v1/gifts` — send gift:
  1. Validate: recipient_id (exists in players), item_id (exists in items)
  2. Check sender owns the item: `PlayerItem::where(['player_id' => $this->currentPlayer()->id, 'item_id' => $itemId])->firstOrFail()`
  3. Check quantity >= 1
  4. Decrement sender quantity; if quantity reaches 0, delete the `player_items` row
  5. Create gift with status=pending, sent_at=now
  6. Return `$this->success($gift, 201)`
- `GET /api/v1/gifts/inbox` — `Gift::where('recipient_id', $this->currentPlayer()->id)->with(['sender', 'item'])->get()`
- `GET /api/v1/gifts/sent` — same but sender_id
- `POST /api/v1/gifts/{id}/accept`:
  1. Load gift or 404
  2. Check `$gift->recipient_id === $this->currentPlayer()->id` — else 403
  3. Check `$gift->status === 'pending'` — else 409
  4. Update: status=accepted, responded_at=now()
  5. Add item to recipient inventory (upsert, increment quantity)
- `POST /api/v1/gifts/{id}/reject`:
  1. Same validations as accept
  2. Update: status=rejected, responded_at=now()
  3. Return item to sender inventory (upsert, increment quantity)

---

## Prompt 8 — Player progress & leaderboard endpoints

Create `app/Http/Controllers/ProgressController.php` and `app/Http/Controllers/LeaderboardController.php`, both extending `BaseController`.

**ProgressController:**
- `POST /api/v1/games/{id}/progress` — upsert score:
  ```php
  PlayerProgress::updateOrCreate(
      ['player_id' => $this->currentPlayer()->id, 'game_id' => $gameId],
      ['score' => $request->score, 'updated_at' => now()]
  );
  ```
- `GET /api/v1/players/me/progress` — return all games the player has progress in, with score and computed rank per game

**LeaderboardController:**
- `GET /api/v1/games/{id}/leaderboard` — top players by score DESC using RANK() window function:
  ```php
  DB::select("
      SELECT
          RANK() OVER (ORDER BY score DESC) as rank,
          p.id, p.username, pp.display_name, pr.score, pr.updated_at
      FROM player_progress pr
      JOIN players p ON p.id = pr.player_id
      LEFT JOIN player_profiles pp ON pp.player_id = pr.player_id
      WHERE pr.game_id = ?
      ORDER BY pr.score DESC
      LIMIT ? OFFSET ?
  ", [$gameId, $limit, $offset]);
  ```
- Support query params: `limit` (default 20, max 100), `offset` (default 0)

---

## Prompt 9 — OpenAPI spec

Write `src/api/openapi.yaml` — the complete OpenAPI 3.0 spec.

Cover every endpoint from Prompts 3–13 including ad endpoints:
- Auth: register, login, logout, me
- Players: me GET/PUT, {id} GET, list, status PATCH
- Games: CRUD + versions CRUD
- Items: CRUD per game
- Inventory: GET, POST
- Gifts: send, inbox, sent, accept, reject
- Progress: submit, my progress
- Leaderboard: GET per game
- Ads: status, start, complete
- SDK: handshake, openapi.json

For each endpoint include:
- HTTP method + path + summary
- Request body schema with required fields and types
- Response schemas for 200/201, 400, 401, 403, 404, 409
- `security: [bearerAuth: []]` on all protected routes

Define reusable schemas in `components/schemas`:
- `Player`, `PlayerProfile`, `Game`, `GameVersion`, `Item`, `PlayerItem`, `Gift`, `Progress`, `LeaderboardEntry`, `AdStatus`, `Token`, `Error`

Define `components/securitySchemes`:
```yaml
bearerAuth:
  type: http
  scheme: bearer
  bearerFormat: JWT
```

---

## Prompt 10 — Swagger UI (API documentation)

Integrate Swagger UI so the API is self-documenting and browsable.

- Install: `composer require darkaonline/l5-swagger`
- Publish config: `php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"`
- In `config/l5-swagger.php`, configure it to load from the static YAML file (NOT annotation scanning):
  - Set `'generate_always' => false`
  - Point the docs path to the manually maintained `openapi.yaml`
- Expose Swagger UI at `GET /api/docs` — publicly accessible, no auth required
- Verify: open `/api/docs` in browser, all endpoints appear, the Authorize button accepts a Bearer JWT
- Add the docs URL to `src/api/README.md`

---

## Prompt 11 — Ad state machine (SaaS revenue layer)

Add server-enforced ad scheduling for non-subscribed players.

**Before writing:** set `CACHE_STORE=file` in `.env` — no Redis needed, Laravel's file cache handles the ad token with a 35-second TTL.

**State machine:**
- `idle` — within 30-minute window, no ad due
- `ad_pending` — 30 minutes elapsed, ad is due
- `ad_playing` — client acknowledged ad start, server timer running

**Create `app/Http/Controllers/AdController.php`** extending `BaseController`:

- `GET /api/v1/ads/status` (protected):
  - If subscribed → `{ ads_enabled: false }`
  - If idle and within 30 min → `{ ads_enabled: true, state: 'idle', next_ad_in_seconds: N }`
  - If 30 min elapsed or first session → update ad_state to 'ad_pending', return `{ ads_enabled: true, state: 'ad_pending' }`
  - If ad_playing → `{ ads_enabled: true, state: 'ad_playing' }`

- `POST /api/v1/ads/start` (protected):
  - If subscribed → 403
  - If ad_state != 'ad_pending' → 409
  - Generate token: `$token = Str::random(64)`
  - Store: `Cache::put("ad_token_{$playerId}", ['token' => $token, 'started_at' => now()->timestamp], 35)`
  - Update profile: `ad_state = 'ad_playing'`
  - Return `{ token: $token, duration_seconds: 30 }`

- `POST /api/v1/ads/complete` (protected):
  - If subscribed → 403
  - Load cache: `$cached = Cache::get("ad_token_{$playerId}")`
  - If null or token mismatch → 400 `{ error: 'Invalid or expired ad token' }`
  - If `now()->timestamp - $cached['started_at'] < 30` → 400 `{ error: 'Ad not yet complete' }` (prevents skipping)
  - On success: `Cache::forget(...)`, update profile: `ad_state = 'idle'`, `last_ad_shown_at = now()`
  - Return `{ success: true }`

---

## Prompt 12 — Vite + Vue 3 demo client

Create a minimal Vite + Vue 3 frontend in `src/api/client/`.

- Scaffold: `npm create vite@latest client -- --template vue` inside `src/api/`
- Install: `npm install axios vue-router`
- Configure `.env.example`: `VITE_API_URL=http://localhost:8000`
- Set up axios with:
  - Request interceptor: attach `Authorization: Bearer <token>` from localStorage
  - Response interceptor: redirect to `/login` on 401
- Set up Vue Router with routes:
  - `/login` — Login / Register forms
  - `/profile` — display_name, subscribed toggle, update button
  - `/games` — game list, click to see leaderboard
  - `/leaderboard/:gameId` — top 20 players, submit score button
  - `/inventory` — owned items + send gift form
  - `/inbox` — received gifts with Accept / Reject buttons
- **Ad overlay component:** on every route enter, call `GET /api/v1/ads/status`. If `state === 'ad_pending'`:
  1. Call `POST /api/v1/ads/start`, get token
  2. Show full-screen overlay (z-index 9999) with 30-second countdown
  3. After 30s, call `POST /api/v1/ads/complete` with token
  4. On success, dismiss overlay
  5. No skip button — overlay blocks all interaction
- Guard all routes: redirect to `/login` if no token in localStorage
- Update `src/api/README.md` with install and run instructions for both API and client

---

## Prompt 13 — SDK integration layer (API side)

- Configure CORS in `config/cors.php`:
  - `allowed_origins: ['*']` in development
  - `allowed_headers: ['Authorization', 'Content-Type', 'Accept']`
  - `allowed_methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']`
- Add `GET /api/v1/sdk/handshake` (protected), extending `BaseController`:
  ```json
  {
    "platform": "GamePlatform",
    "version": "1.0.0",
    "player_id": "<uuid>",
    "username": "<string>",
    "authenticated": true
  }
  ```
- Add `GET /api/v1/openapi.json` (public) — serves `openapi.yaml` as JSON using `symfony/yaml`
- Document both in `src/api/README.md` and `openapi.yaml`

---

# ROLE: CMS Engineer — Task 2

Working directory: `src/cms/`
Depends on: API `openapi.yaml` and a running API at `VITE_API_URL`.

---

## Prompt CMS-1 — Admin panel setup

- Scaffold: `npm create vite@latest . -- --template react` inside `src/cms/`
- Install: `npm install react-admin ra-data-simple-rest axios`
- Write a custom `dataProvider` adapting react-admin's calls to `/api/v1/` endpoints
- Write `authProvider` with `login()` → POST /auth/login, `logout()`, `checkAuth()`, `getIdentity()`
- Set up `<Admin dataProvider authProvider>` in `App.jsx`
- Configure `.env.example`: `VITE_API_URL=http://localhost:8000`
- Panel runs on port 5174
- Update `src/cms/README.md`

---

## Prompt CMS-2 — Players & profiles management

- `<Resource name="players">` with list (id, username, status, created_at), show (all + profile), edit (status, display_name, subscribed)
- No create action
- Map to: GET /players, GET /players/{id}, PUT /players/me, PATCH /players/{id}/status

---

## Prompt CMS-3 — Games, versions & items management

- `<Resource name="games">` with list, show, create, edit, delete
- Inline version management inside Game show view
- `<Resource name="items">` filtered by game_id with rarity dropdown

---

## Prompt CMS-4 — Gifts, leaderboard & inventory views

- `<Resource name="gifts">` read-only list with status filter
- Custom leaderboard page with game selector, calls GET /games/{id}/leaderboard?limit=50
- Inventory tab inside Player show view

---

# ROLE: DevOps Engineer — Task 3

Working directory: `devops/`

---

## Prompt DEVOPS-1 — Dockerfile + Terraform RDS

- Write `devops/app/Dockerfile`: base python:3.12-slim, layer order (requirements → install → app code), Gunicorn CMD, EXPOSE 5000, no hardcoded secrets
- Write `devops/terraform/main.tf`: AWS RDS MySQL db.t3.micro, variables for credentials, output endpoint
- Document EC2 setup in `DECISIONS-DEVOPS.md`

---

## Prompt DEVOPS-2 — kind cluster + Helm charts

- Run bootstrap + create kind cluster
- Download and install locally: nginx-ingress, prometheus, grafana, metrics-server into `devops/k8s/`
- Write Helm templates in `devops/helm/vector-api/templates/`: deployment, service, ingress, hpa (60% CPU, min 1, max 5), values.yaml

---

## Prompt DEVOPS-3 — CI/CD pipeline + k6 load test

- Write `.github/workflows/deploy.yml` (push to main, self-hosted runner): test → build → load image → deploy
- Write `devops/load-tests/load_test.js`: ramp 0→50 VUs over 30s, hold 60s, assert p95 < 500ms
- Take Grafana screenshot of HPA scaling, reference in `DECISIONS-DEVOPS.md`

---

# ROLE: QA Automation Engineer — Task 4

Working directory: `qa/tests/`

---

## Prompt QA-1 — Strategy document + mock tests

- Fill `qa/AUTOMATION_STRATEGY.md`
- Write `qa/tests/test_auth.py` with 3 mock tests: register returns token, wrong password returns 401, no token returns 401

---

## Prompt QA-2 — Gift lifecycle tests (real API)

Write `qa/tests/test_gifts.py`:
- `test_player_can_send_gift`
- `test_player_can_accept_gift`
- `test_cannot_send_gift_without_owning_item`
- `test_cannot_accept_someone_elses_gift`

---

## Prompt QA-3 — Leaderboard & progress tests (real API)

Write `qa/tests/test_leaderboard.py`:
- `test_score_submission_updates_leaderboard`
- `test_leaderboard_ordered_by_score_desc`
- `test_upsert_score_replaces_previous`

---

# ROLE: Platform Engineer — Task 5

Working directory: `src/sdk/`

---

## Prompt SDK-1 — SDK setup + auth methods

- Create Python package: `src/sdk/gameplatform/__init__.py`, `client.py`, `exceptions.py`
- `GamePlatformClient` uses Singleton via `__new__`:
  ```python
  _instance = None

  def __new__(cls, base_url: str):
      if cls._instance is None:
          cls._instance = super().__new__(cls)
          cls._instance._base_url = base_url
          cls._instance._token = None
      return cls._instance
  ```
- Methods: `register()`, `login()`, `logout()`, `me()`, `get_profile()`, `update_profile()`
- Auto-attach `Authorization: Bearer <token>` on every request
- Raise `AuthError`, `APIError`, `NotFoundError` on 401, 500, 404

---

## Prompt SDK-2 — SDK leaderboard, progress & gifts

Extend `GamePlatformClient` with:
- `submit_score(game_id, score)`, `get_leaderboard(game_id, limit=20)`, `get_my_progress()`
- `send_gift(recipient_id, item_id)`, `get_inbox()`, `accept_gift(gift_id)`, `reject_gift(gift_id)`
- `get_inventory(game_id=None)`

Write `src/sdk/demo.py` — full live flow:
1. Register two players
2. Login as player A, submit score, print leaderboard
3. Send gift to player B
4. Login as player B, accept gift, print inventory

Update `src/sdk/README.md` with install and demo instructions.

---

## Prompt SDK-3 — TEAM_INTEGRATION.md

Fill `TEAM_INTEGRATION.md` answering all three integration questions:
1. What you give a new team: SDK, `/api/docs`, `openapi.yaml`, `demo.py`
2. Journey from zero to first published score: step-by-step
3. How to facilitate fast integration: SDK abstracts HTTP, Swagger is self-serve, openapi.yaml enables auto-generated clients

Answer the per-role design sub-questions. Leave "What I learned" as a placeholder.
