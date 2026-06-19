# DECISIONS-API.md — API decisions

## Decisions

---

Decision: Laravel (PHP) as the backend framework
Why: Laravel provides migrations, Eloquent ORM, built-in auth scaffolding, and first-class JWT support out of the box. In a 2-day hackathon, the time saved on boilerplate is the deciding factor — a working API can be stood up in hours, not days.
Rejected alternative: Slim (PHP microframework) — requires manual wiring of routing, ORM, and auth, which costs time we don't have. Raw PHP was not considered.

---

Decision: JWT (JSON Web Tokens) for authentication via tymon/jwt-auth
Why: Stateless tokens fit REST APIs and game clients well — no session state to manage on the server. The Platform Engineer building the SDK benefits directly: a token is portable across any language or runtime without needing cookie jars or session stores.
Rejected alternative: Laravel Sanctum (API token auth) — simpler to set up, but tokens are stored in the database and require a session lookup on every request. JWT keeps auth logic entirely in the token payload.

---

Decision: Neon (hosted PostgreSQL) as the database
Why: Neon provides a free-tier serverless PostgreSQL instance with a connection string ready in under a minute. All configuration is a single DATABASE_URL in .env — no local DB setup needed for any team member. Supports all PostgreSQL features we need (UUIDs, JSON, cascade constraints).
Rejected alternative: Supabase — also free Postgres and has a nice admin dashboard (useful for CMS), but Neon's DX for pure backend connection is faster to configure. Supabase was kept as a secondary option if the CMS engineer needs a visual DB explorer.

---

Decision: UUIDs for all primary keys (gen_random_uuid()) instead of auto-increment integers
Why: Auto-increment integers break referential integrity when rows are deleted and new ones are inserted — IDs are reused or create confusing gaps. UUIDs are globally unique, safe to expose in API responses, and portable across services and future migrations.
Rejected alternative: SERIAL / BIGSERIAL (PostgreSQL auto-increment) — fast and simple, but fragile under deletes and not safe to expose publicly (sequential IDs reveal insertion order and volume).

---

Decision: Separate player_profiles table; subscribed (ad-less) field lives in player_profiles, not players
Why: players holds identity and auth data only. Profile data (display name, bio, avatar, subscription status) changes independently and belongs conceptually to the profile, not the account. This keeps the players table narrow and the separation clean.
Rejected alternative: Flat players table with all profile fields — simpler to query, but mixes auth state with display state and bloats the table as features grow.

---

Decision: items and player_items tables included in the data model
Why: The gifts feature requires players to send items they own to other players. Without an items table (items defined per game) and a player_items table (player inventory), there is nothing to gift. The gift lifecycle (pending → accepted/rejected) references a specific item_id.
Rejected alternative: Treating gifts as abstract "tokens" without an item reference — this would satisfy the gift lifecycle requirement but would not support item ownership, inventory management, or game-specific item catalogs.

---

Decision: CASCADE DELETE from games to game_versions
Why: A game version has no meaning without its parent game. If a game is deleted, all its versions should be cleaned up automatically. This prevents orphaned rows and removes the need for manual cleanup logic in the application layer.
Rejected alternative: SET NULL or RESTRICT on delete — SET NULL makes version rows meaningless; RESTRICT blocks game deletion entirely unless all versions are manually removed first, which is error-prone.

---

Decision: Vite as the frontend for a minimal demo client (also usable as CMS foundation)
Why: We need a lightweight UI to demonstrate the API live at the demo without using Postman or raw curl commands. Vite gives a fast dev server and a clean starting point. The CMS engineer can fork or extend it rather than starting from zero.
Rejected alternative: Postman / Insomnia for demo — functional but not a live UX. A Vite client shows the flows visually and doubles as a foundation for the CMS admin panel.

---

Decision: REST API versioned under /api/v1/ with resource-based URL naming
Why: Versioning from day one means the CMS, SDK, and QA tests all import against a stable contract — if we need to break something later, /api/v2/ is an option without touching existing consumers. Resource-based naming (nouns, not verbs) keeps endpoints predictable: /api/v1/players, /api/v1/games/{id}/leaderboard, /api/v1/gifts/{id}/respond.
Rejected alternative: No versioning prefix — simpler URLs but any breaking change forces all consumers to update simultaneously. Not worth the risk in a multi-role team working in parallel.

---

Decision: OpenAPI spec (openapi.yaml) defined before any implementation
Why: The spec is the shared contract. The CMS engineer, QA engineer, and Platform Engineer (SDK) all need to know the shape of requests and responses before the API is built. Writing it first unblocks the rest of the team immediately and forces us to think through edge cases (auth headers, error codes, gift lifecycle states) before they become bugs in code.
Rejected alternative: Write the spec after implementation — common but backwards. The rest of the team would be blocked or guessing, and the spec would just document what was built rather than what was agreed.

---

## Data Model

```
players
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  username      VARCHAR(64) UNIQUE NOT NULL
  email         VARCHAR(255) UNIQUE NOT NULL
  password_hash TEXT NOT NULL
  status        VARCHAR(16) DEFAULT 'active'   -- active | suspended
  created_at    TIMESTAMPTZ DEFAULT now()

player_profiles
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  player_id     UUID REFERENCES players(id) ON DELETE CASCADE
  display_name  VARCHAR(128)
  avatar_url    TEXT
  bio           TEXT
  subscribed    BOOLEAN DEFAULT false           -- ad-less experience
  created_at    TIMESTAMPTZ DEFAULT now()

games
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  name          VARCHAR(128) NOT NULL
  description   TEXT
  created_at    TIMESTAMPTZ DEFAULT now()

game_versions
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  game_id       UUID REFERENCES games(id) ON DELETE CASCADE
  version       VARCHAR(32) NOT NULL
  is_active     BOOLEAN DEFAULT true
  released_at   TIMESTAMPTZ DEFAULT now()

player_progress
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  player_id     UUID REFERENCES players(id) ON DELETE CASCADE
  game_id       UUID REFERENCES games(id) ON DELETE CASCADE
  score         BIGINT DEFAULT 0
  updated_at    TIMESTAMPTZ DEFAULT now()
  UNIQUE (player_id, game_id)

items
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  game_id       UUID REFERENCES games(id) ON DELETE CASCADE
  name          VARCHAR(128) NOT NULL
  description   TEXT
  rarity        VARCHAR(32) DEFAULT 'common'   -- common | rare | epic | legendary

player_items
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  player_id     UUID REFERENCES players(id) ON DELETE CASCADE
  item_id       UUID REFERENCES items(id) ON DELETE CASCADE
  quantity      INT DEFAULT 1
  UNIQUE (player_id, item_id)

gifts
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  sender_id     UUID REFERENCES players(id)
  recipient_id  UUID REFERENCES players(id)
  item_id       UUID REFERENCES items(id)
  status        VARCHAR(16) DEFAULT 'pending'  -- pending | accepted | rejected
  sent_at       TIMESTAMPTZ DEFAULT now()
  responded_at  TIMESTAMPTZ
```

Leaderboard is derived — not a table. It is a query on `player_progress` ordered by `score DESC` filtered by `game_id`.

---

## What I learned

<!-- Fill in after the hackathon — in your own words:
- How did the collaboration feel, working with people you just met?
- When you were stuck, who helped and how?
- Were there moments of disagreement? How did you decide?
- Did someone take on a leadership role naturally? What did that look like?
- What didn't you know before that you know now?
-->
