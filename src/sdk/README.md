# GridForge SDK

Python SDK for the GridForge game platform. A game team installs it, logs in
once, and calls high-level methods — no raw HTTP, no manual token handling.

## Install

From inside `src/sdk/`:

```bash
pip install -e .
```

This installs the `gridforge` package and its only dependency (`requests`).

## Quickstart

```python
from gridforge import GridForgeClient

# base_url is the server root, WITHOUT /api/v1 — the SDK adds it.
client = GridForgeClient("http://localhost:8000")
client.register("alice", "alice@example.com", "secret123")
client.login("alice@example.com", "secret123")   # login is by email

client.submit_score(game_id, 9999)
print(client.get_leaderboard(game_id))
```

The token returned at login is stored inside the client and attached to every
later call automatically. If the API sends the token as a cookie instead of
in the response body, the SDK detects and handles that transparently — no
extra configuration needed.

## Player profile (read & update)

```python
# Read the logged-in player's profile
profile = client.get_profile()
print(profile)

# Read another player's public profile
other = client.get_profile(player_id="some-player-uuid")

# Update your own profile — pass only the fields you want to change
client.update_profile(display_name="AliceTheGreat", bio="GG")
```

## Score & leaderboard

```python
client.submit_score(game_id, 9999)          # only updates if higher than best

top = client.get_leaderboard(game_id, limit=10)
for row in top:
    print(row)

print(client.get_my_rank(game_id))          # your own rank for this game
```

## Methods

| Method | What it does |
|--------|-------------|
| `register(username, email, password)` | Create a new player account, stores the token |
| `login(email, password)` | Authenticate **by email**, stores the token |
| `logout()` | Invalidate the token and clear it locally |
| `me()` | The authenticated player (`GET /auth/me`) |
| `get_profile(player_id=None)` | Own profile, or another player's public profile |
| `update_profile(display_name=, avatar_url=, bio=)` | Update own profile fields |
| `submit_score(game_id, score)` | Submit a score (updates only if higher than best) |
| `get_my_progress()` | All games the player has progress in |
| `get_progress(game_id)` | Progress for one specific game |
| `get_leaderboard(game_id, limit=10)` | Ranked leaderboard for a game |
| `get_my_rank(game_id)` | The player's own rank and score for a game |
| `get_inventory()` | The player's owned items |
| `add_to_inventory(item_id, quantity=1)` | Add an item to the player's inventory |
| `remove_from_inventory(item_id)` | Remove an item from the inventory |
| `send_gift(recipient_id, item_id)` | Send an item as a gift |
| `get_inbox()` | Gifts received (all statuses) |
| `get_sent_gifts()` | Gifts the player has sent |
| `accept_gift(gift_id)` | Accept a received gift |
| `decline_gift(gift_id)` | Decline a received gift |
| `get_ad_status()` | Current ad state for the player |
| `handshake()` | Verify the SDK is connected and authenticated in one call |

## Error handling

Every error is a typed exception, all subclasses of `GridForgeError`:

| Exception | Raised when |
|-----------|-------------|
| `AuthError` | 401 — not logged in, bad credentials, expired token |
| `ForbiddenError` | 403 — logged in but not allowed (e.g. ad while subscribed) |
| `NotFoundError` | 404 — resource does not exist |
| `ConflictError` | 409 — wrong state (e.g. no ad pending) |
| `ValidationError` | 400 / 422 — invalid request body (e.g. don't own the item) |
| `APIError` | anything else (500, network down, unreadable response) |

```python
from gridforge import GridForgeClient, AuthError, GridForgeError

client = GridForgeClient("http://localhost:8000")
try:
    client.login("alice@example.com", "wrong-password")
except AuthError as e:
    print("Login failed:", e)
except GridForgeError as e:
    print("Something else went wrong:", e)
```

## Demo

```bash
python demo.py
```

`demo.py` runs the full flow live: two players, score submission, leaderboard,
and the complete gift lifecycle (send → inbox → accept). Set `BASE_URL`,
`GAME_ID` and `ITEM_ID` at the top of the file first.

## API reference

Full endpoint contract: `src/api/openapi.yaml`, browsable Swagger UI at `/api/docs`.
