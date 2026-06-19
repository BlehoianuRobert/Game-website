# TEAM_INTEGRATION.md

> "Tomorrow, a new game team wants to integrate with your platform.
> What do you give them? What does their journey from zero to the first
> published score look like, and how do you facilitate fast and easy integration?"

---

## What you give a new game team

A new game team receives four things:

1. **The SDK** — the `gridforge` Python package. They `pip install -e .` and import one class. No raw HTTP, no manual token management.
2. **The OpenAPI spec** (`src/api/openapi.yaml`) — the full contract of every endpoint, request body, and response shape.
3. **Swagger UI** (`/api/docs`) — the spec rendered as a browsable, try-it-out page. Self-serve, no one to ask.
4. **A working example** (`src/sdk/demo.py`) — the full flow they can copy and adapt.

---

## Integration journey — from zero to first published score

### Step 1 — Install the SDK

From inside `src/sdk/`:

```bash
pip install -e .
```

### Step 2 — Register a player

```python
from gridforge import GridForgeClient

client = GridForgeClient("http://<gridforge-api-url>")
client.register("your_username", "your_email@example.com", "your_password")
```

### Step 3 — Login (by email)

```python
client.login("your_email@example.com", "your_password")
```

The SDK stores the JWT token automatically. Every call after this is authenticated.

### Step 4 — Submit your first score

```python
GAME_ID = "your-game-uuid"   # the platform team provides this
client.submit_score(GAME_ID, 1500)
```

### Step 5 — Read the leaderboard

```python
print(client.get_leaderboard(GAME_ID))
```

A new team goes from zero to a ranked leaderboard entry in five steps and a
couple of minutes.

---

## SDK

### Install

```bash
pip install -e .   # from src/sdk/
```

### Covers

Authentication, profile read/update, score submission, leaderboard, inventory,
and the full gift lifecycle (send / inbox / accept / reject). See
`src/sdk/README.md` for the complete method list.

### Why it's easy to integrate

- **One import, one login.** After `login()`, the token is managed for you — no
  `Authorization` headers to build by hand.
- **Typed errors.** A failed login raises `AuthError`, a missing resource raises
  `NotFoundError`, and so on — the game can react to each case instead of parsing
  HTTP status codes.
- **The success envelope is unwrapped for you.** The API wraps responses as
  `{ "data": ... }`; the SDK returns the inner data directly.

---

## How each role supports fast integration

- **API** — endpoints are discoverable via Swagger UI (`/api/docs`) and the
  `openapi.yaml` contract. The spec is defined before implementation, so the SDK
  is built against it from day one. A `/api/v1/sdk/handshake` endpoint lets any
  client verify it is connected and authenticated in a single call.
- **CMS** — a new team can self-serve: create games and items, and inspect
  players, gifts, and leaderboards through the admin panel without asking anyone.
- **DevOps** — the platform runs on a stable, reachable URL. A new team can test
  against it immediately, no local setup required.
- **QA** — the automated test suite documents the expected behaviours as
  executable specs (auth, gift lifecycle, leaderboard), giving a new team
  confidence their integration behaves the same way.

---

## What I learned

<!-- Write in your own words after the hackathon:
- How did the collaboration feel, working with people you just met?
- When you were stuck, who helped and how?
- Were there moments of disagreement? How did you decide?
- Did someone take on a leadership role naturally? What did that look like?
- What didn't you know before that you know now?
-->
