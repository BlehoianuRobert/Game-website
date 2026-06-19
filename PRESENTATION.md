# GRIDFORGE — Team SnackIt
### Builders Lab 2026 · 48-Hour Hackathon

---

## Team

| Name | Role |
|---|---|
| Danaila Mihai Teodor | Frontend Engineer |
| George Bot | SPA / SDK Software Engineer |
| Maria Isabel Oprea | QA Automation Engineer |
| Vlad Bontas | DevOps Engineer |
| Robert Blehoianu | E-commerce & Backend Engineer |

---

## What is GRIDFORGE?

GRIDFORGE is a production-grade gaming platform built end-to-end in 48 hours. It provides everything a game studio needs to manage players, distribute games, track progression, run an item economy, and monetize through ads — all exposed through a clean REST API, a React admin panel, and a Python SDK.

### Three Core Pillars

**Platform (REST API)**
Complete backend powering player accounts, game management, item economy, leaderboards, and an ad system — all secured with JWT authentication.

**Admin CMS**
React + TypeScript admin panel giving non-technical operators full control: create games, manage versions, track players, handle inventory and gifts.

**Developer SDK**
Python client library so any game studio integrates in under 5 minutes. 26 high-level methods. No raw HTTP required.

### Technology Stack

| Component | Technology |
|---|---|
| Backend API | Laravel PHP 8.3 |
| Database | PostgreSQL (Neon serverless) |
| Authentication | JWT — tymon/jwt-auth, stateless |
| Admin Panel | React + TypeScript + Vite |
| SDK | Python (gridforge package) |
| DevOps | Docker, Kubernetes (kind), Helm, Terraform |
| CI/CD | GitHub Actions (self-hosted runner) |
| Testing | pytest + responses library |
| Load Testing | k6 |
| Observability | Prometheus + Grafana |
| Infrastructure | AWS EC2, AWS RDS |

---

## What GRIDFORGE Does

### Player Management
- Register, authenticate, and manage player profiles
- Role-based access: Player vs Developer
- Status control: active / suspended / banned

### Game Lifecycle
- Create games and versioned releases
- Activate / deactivate specific versions
- Developer-only write access to protect production data

### Scoring & Leaderboards
- Submit scores (platform keeps personal best only)
- Ranked leaderboard per game
- Personal rank endpoint for quick lookups

### Item Economy & Gifts
- Define per-game item catalog with rarities
- Manage player inventories
- Full gift state machine: pending → accepted / rejected (irreversible)

### Ad System
- Ad lifecycle: idle → ad_pending → ad_playing
- Subscribed players bypass ads automatically
- Platform handshake endpoint for SDK health checks

### SDK & Integration
- `pip install gridforge` — zero raw HTTP
- Copy-paste demo scripts included
- OpenAPI spec + Swagger UI for full documentation

---

## Database Model

```
players          (id UUID, username, email, password_hash, role_id, status, created_at)
player_profiles  (id UUID, player_id, display_name, avatar_url, bio, subscribed, ad_state, last_ad_shown_at)

games            (id UUID, name, description, created_at)
game_versions    (id UUID, game_id, version, is_active, released_at)
player_progress  (id UUID, player_id, game_id, score, updated_at)  -- UNIQUE(player_id, game_id)

items            (id UUID, game_id, name, description, rarity)
player_items     (id UUID, player_id, item_id, quantity)  -- UNIQUE(player_id, item_id)

gifts            (id UUID, sender_id, recipient_id, item_id, status, sent_at, responded_at)
                 -- status: pending | accepted | rejected

roles            (id UUID, name)  -- dev | player
```

---

## API Endpoints (40+)

| Category | Endpoints | Access |
|---|---|---|
| Auth | POST /register, POST /login, POST /logout | Public |
| Players | GET /me, PUT /me, GET /players (dev), PATCH /players/:id/status (dev) | Auth required |
| Games | GET /games, GET /games/:id, POST/PUT/DELETE (dev only) | Read: all, Write: dev |
| Versions | GET /versions, POST/PATCH/DELETE (dev) | Read: all, Write: dev |
| Items | GET /items, GET /items/:id, POST/PUT/DELETE (dev) | Read: all, Write: dev |
| Inventory | GET /inventory, POST /inventory, DELETE /inventory/:id | Auth required |
| Gifts | GET /gifts/sent, GET /gifts/inbox, POST /gifts, PATCH accept/decline | Auth required |
| Progress | GET /progress, GET /progress/:game_id, POST /progress | Auth required |
| Leaderboard | GET /leaderboard/:game_id, GET /leaderboard/:game_id/my-rank | Auth required |
| Ads | GET /ads/status, POST /ads/start, POST /ads/complete | Auth required |
| SDK | GET /handshake, GET /openapi.json | SDK / public |

---

## 5-Step Integration Path

```python
from gridforge import GridForgeClient

client = GridForgeClient("http://platform-url")
client.register("username", "email", "password")
client.login("email", "password")
client.submit_score(GAME_ID, 1500)
print(client.get_leaderboard(GAME_ID))
```

First published score in under 5 minutes, zero API documentation reading required.

---

---

# Team Members

---

## Danaila Mihai Teodor — Frontend Engineer

**Tagline:** Turned raw API endpoints into a polished admin experience

### Overview

Mihai built the entire admin panel (CMS) from scratch using React, TypeScript, and Vite. He owned the full frontend layer — authentication flows, dashboard navigation, game management, player tracking, and inventory screens — and integrated all 40+ API endpoints with proper type safety throughout.

### Highlights

**React + TypeScript CMS**
Built the full admin panel from scratch using React, TypeScript, and Vite. Authentication screens, dashboard navigation, and role-based views for both players and developers.

**Game & Version Management**
Create / edit games and versioned releases directly from the UI. GameCard and VersionForm components with live API integration.

**Player & Inventory Screens**
Browse player profiles, view progress per game, and manage item inventories — all from a single responsive dashboard.

**TypeScript Data Models**
Defined typed interfaces for every domain entity (Player, Game, Gift, Leaderboard) ensuring compile-time safety across the whole frontend.

### Key Contributions

- Implemented login / signup with context-based auth state management
- Dashboard with multi-section navigation: Games, Players, Inventory, Gifts
- GameCard, ItemForm, VersionForm — reusable typed UI components
- Role-aware views: different experience for Player vs Developer
- Live data fetching from 40+ API endpoints with error handling
- Gift management UI with pending / accepted / rejected state display
- Responsive layouts across all major screen breakpoints
- 18 commits — primary frontend owner on the team

### Impact

| Metric | Value |
|---|---|
| Commits (frontend owner) | 18 |
| API endpoints integrated | 40+ |
| TypeScript models defined | 10+ |
| Dashboard sections | 4 |
| Component library size | 15+ |

### Tech Stack
React · TypeScript · Vite · Context API · REST Integration

---

## George Bot — SPA Software Engineer (SDK & Integration)

**Tagline:** First published score in under 5 minutes — zero API docs required

### Overview

George built the Python SDK that any game studio uses to integrate with GRIDFORGE. He designed the full client library, typed exception hierarchy, and two demo scripts — one showcasing every feature, one being a fully playable game running against the real platform API.

### Highlights

**Python SDK — gridforge**
Developed the full Python client library with 26 high-level methods covering auth, profiles, scoring, leaderboards, inventory, gifts, and ads.

**Typed Exception Hierarchy**
`AuthError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`, `APIError` — every failure mode is catchable and documented.

**Demo & Game Scripts**
`demo.py`: full feature showcase walking through the complete platform flow.
`game.py`: interactive number-guessing game that calls the real platform — a living integration example.

**Cookie + Bearer Token Auth**
Dual auth storage (cookie and header) so the SDK works transparently in browser-based tools and CLI scripts alike.

### Key Contributions

- 26 SDK methods: register, login, submit_score, get_leaderboard, send_gift, get_ad_status and more
- Typed exceptions so errors never surface as raw HTTP status codes
- `demo.py` walks through the full auth → score → leaderboard → gift flow
- `game.py` — interactive guessing game running against the live platform API
- Cookie handling added to support browser-based and headless clients
- 5-step integration path: `pip install` → first score in under 5 minutes
- API docs auto-generation wired into the project pipeline
- 18 total commits across SDK and integration work

### SDK Method Reference

```
auth:        register, login, logout, handshake
profile:     get_profile, update_profile, me
scoring:     submit_score, get_progress, get_my_progress
leaderboard: get_leaderboard, get_my_rank
inventory:   add_to_inventory, get_inventory, remove_from_inventory
gifts:       send_gift, accept_gift, decline_gift, get_inbox, get_sent_gifts
ads:         get_ad_status
```

### Impact

| Metric | Value |
|---|---|
| SDK methods shipped | 26 |
| Exception types defined | 6 |
| Lines of client code | 400+ |
| Integration steps to first score | 5 |
| Total commits | 18 |

### Tech Stack
Python · requests · JWT · OpenAPI · pip package

---

## Maria Isabel Oprea — QA Automation Engineer

**Tagline:** Mock first, real API second — tests that evolve with the platform

### Overview

Maria defined and implemented the full QA strategy for GRIDFORGE. She prioritised the three most critical test flows, built a two-phase test suite (mock then real API), and ensured that security, validation, and state machine behaviour were all covered before the platform reached production.

### Highlights

**Automation Strategy**
Defined a written QA strategy prioritising 3 critical flows: authentication, gift lifecycle, and leaderboard ranking — with justification for each choice.

**Phase 1 — Mock Tests**
Complete pytest suite using the `responses` library. Security: unauthenticated blocking, invalid token rejection. Functional: score submission, profile update, gift state transitions.

**Phase 2 — Real API Tests**
Same test code, decorator removed — mock layer replaced with live API calls without rewriting tests. Clean migration path validated.

**Negative & E2E Testing**
Full user flows: registration → auth → action → validation. Negative cases: duplicate registration, input validation errors, 401/422 assertions.

### Key Contributions

- Written `AUTOMATION_STRATEGY.md` — 3 critical flows, rationale documented
- Security tests: unauthenticated requests return 401, invalid tokens blocked
- Validation tests: duplicate registration → 422, malformed input rejected
- Gift lifecycle: pending → accepted / rejected state machine verified
- Leaderboard ranking assertion: sorted by score, not insertion order
- Profile read/write consistency checks across create → update → fetch
- Phase 1 (mock) → Phase 2 (real) migration with zero test rewrites
- 14 commits — full ownership of QA layer

### Testing Approach

**End-to-End Testing**
Full user flows: registration → authentication → action → validation

**Negative Testing**
Security-focused: invalid tokens, unauthorized access, validation failures

**Mock First, Real Later**
Phase 1 uses `responses` mocking. Phase 2 removes the decorator and hits the live API. Same test code — zero rewrites.

### Impact

| Metric | Value |
|---|---|
| Commits (QA owner) | 14 |
| Critical flows prioritised | 3 |
| Test phases shipped | 2 |
| HTTP status codes asserted | 401, 422 |
| Test types covered | Security, E2E, Negative |

### Tech Stack
pytest · responses (mock) · requests · E2E testing · API testing

---

## Vlad Bontas — DevOps Engineer

**Tagline:** Reproducible infra from code — zero manual clicks in production

### Overview

Vlad built and owns the entire infrastructure layer. He provisioned cloud resources with Terraform, deployed the platform to Kubernetes with Helm, wired up two GitHub Actions CI/CD pipelines, and validated auto-scaling under real load using k6. Every decision is documented, every problem solved is recorded.

### Highlights

**Kubernetes with kind**
Local cluster in Docker (under 1 minute spin-up, zero cloud cost) running the full platform stack with Nginx Ingress as the single entry point.

**Terraform + AWS**
AWS RDS (MySQL) provisioned with Terraform for persistent state — compute is disposable, data is not. Infrastructure as code, fully version-controlled.

**GitHub Actions CI/CD**
Two pipelines: unit tests → Docker build → Trivy security scan → Helm deploy. Self-hosted runner on EC2 for full pipeline control.

**Observability & Load Testing**
Prometheus + Grafana for live metrics. k6 load tests validating HPA auto-scaling from 1 → 10 replicas under sustained load.

### Key Contributions

- kind (Kubernetes in Docker) cluster — full K8s API, zero EKS overhead
- AWS RDS separated from compute: disposable pods, persistent data
- Nginx Ingress: single auditable entry point, ClusterIP for internal routing
- Helm charts for all application deployments (`devops/helm/vector-api`)
- Trivy security scan in every CI pipeline — containers checked before deploy
- HPA auto-scaling validated: 1 → 10 replicas under k6 sustained load
- Fixed 3 real production issues: pymysql dialect, python3-venv, HPA metrics
- `DECISIONS-DEVOPS.md`: documented rationale + troubleshooting log

### Real Problems Solved

| Problem | Solution |
|---|---|
| pymysql ModuleNotFoundError | Switched DB_URL dialect to mysql+mysqlconnector |
| python3-venv missing on runner | Installed missing system packages on self-hosted EC2 |
| HPA metrics unavailable | Installed metrics-server with --kubelet-insecure-tls flag |

### Infrastructure Decisions

**kind over EKS**
Fast provisioning (< 1 min), zero cloud cost, full Kubernetes API surface without EKS overhead.

**AWS RDS for persistent state**
Separated from cluster so compute is disposable. Managed backups and automated failover included.

**Nginx Ingress**
Single controlled entry point for all external traffic. ClusterIP Services keep internal routing auditable.

### Impact

| Metric | Value |
|---|---|
| CI/CD pipelines | 2 |
| Real issues debugged & fixed | 3 |
| HPA max replicas scaled to | 10 |
| IaC tools | Terraform + Helm |
| Observability stack | Prometheus + Grafana |

### Tech Stack
Kubernetes · Terraform · Helm · Docker · GitHub Actions · Prometheus · Grafana · k6

---

## Robert Blehoianu — E-commerce & Backend Engineer

**Tagline:** API-first: spec written before the first line of code

### Overview

Robert architected and built the entire REST API that powers GRIDFORGE. He wrote the OpenAPI specification before implementation began, designed the domain-driven controller structure, modelled the full database schema with UUIDs throughout, and implemented every business rule — from JWT auth to the gift state machine to the ad lifecycle.

### Highlights

**Laravel REST API**
Architected the full backend with domain-driven structure: User, Game, and Transaction pillars — each with its own Models, Controllers, and migrations.

**OpenAPI Spec (40+ endpoints)**
Defined the complete API contract in `openapi.yaml` before implementation. Bearer JWT security scheme and all request/response schemas specified upfront.

**Item Economy & Gift System**
Per-game item catalog with rarities, player inventories with unique constraints, and a full gift state machine (pending → accepted / rejected).

**UUID-first Database Design**
All primary keys are UUIDs for security and portability. CASCADE deletes, unique constraints, and Neon PostgreSQL with connection pooling.

### Key Contributions

- Designed 3-pillar domain structure: User / Game / Transaction controllers
- JWT stateless auth: register, login, logout, cookie fallback for browsers
- Role-based access: Developer-only write endpoints on games, items, versions
- Score upsert: only the personal best is kept per player per game
- Gift state machine: pending → accepted / rejected (irreversible transitions)
- Ad system state machine: idle → ad_pending → ad_playing + subscription bypass
- 10 database migrations, all with UUID PKs and proper CASCADE constraints
- 21 commits — highest commit count on the team

### Domain Controller Structure

```
User/
├── AuthController       — register, login, logout
├── ProfileController    — player profiles, /me endpoint
└── AdController         — ad lifecycle: status, start, complete

Game/
├── GameController       — CRUD games
├── VersionController    — manage game versions
└── StatsController      — progress, leaderboard, my rank

Transaction/
├── GiftController       — send, accept, decline gifts
├── InventoryController  — manage player items
└── ItemCatalogController — item catalog CRUD
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Laravel | Mature ecosystem, built-in migrations, Eloquent ORM |
| JWT (stateless) | Portable across mobile clients and game servers |
| Neon PostgreSQL | Serverless, connection pooling, zero-ops |
| UUID primary keys | Security, portability, no sequential ID enumeration |
| Separate profile table | Players table stays lean; profile data isolated |
| OpenAPI-first | SDK and CMS could be built in parallel against the spec |

### Impact

| Metric | Value |
|---|---|
| Commits (most on team) | 21 |
| API endpoints designed | 40+ |
| Database migrations | 10 |
| Domain controllers | 9 |
| Decisions documented | 9 |

### Tech Stack
Laravel PHP 8.3 · PostgreSQL · JWT · OpenAPI · UUID · Swagger UI

---

## Deliverables Summary

| Deliverable | Status |
|---|---|
| REST API (Laravel, 40+ endpoints) | Done |
| Database migrations (PostgreSQL, UUID) | Done |
| JWT authentication + role-based access | Done |
| React + TypeScript admin panel | Done |
| Python SDK (26 methods) | Done |
| Demo scripts (demo.py, game.py) | Done |
| QA automation strategy + test suite | Done |
| Mock → real API test migration | Done |
| Terraform AWS infrastructure | Done |
| Helm charts + Kubernetes deployment | Done |
| GitHub Actions CI/CD (2 pipelines) | Done |
| Trivy security scanning in CI | Done |
| k6 load tests + HPA validation | Done |
| Prometheus + Grafana observability | Done |
| OpenAPI spec + Swagger UI | Done |
| DECISIONS.md (team-wide) | Done |
| DECISIONS-API.md (backend) | Done |
| DECISIONS-DEVOPS.md (infra) | Done |
| AUTOMATION_STRATEGY.md (QA) | Done |
| TEAM_INTEGRATION.md | Done |

---

*Team SnackIt · GRIDFORGE · Builders Lab 2026*
