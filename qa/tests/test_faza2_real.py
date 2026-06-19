# =============================================================================
# PRE-REQUISITES — What must exist in the database before running this suite
# (run Laravel Seeders/Factories or insert manually)
#
# 1. Primary QA user (gift sender):
#    username: "test_qa"   | email: "test_qa@gridforge.io"   | password: "SecurePass!99"
#    status: active
#
# 2. Secondary QA user (gift recipient):
#    username: "test_qa2"  | email: "test_qa2@gridforge.io"  | password: "SecurePass!99"
#    status: active
# =============================================================================

import threading
import time
import pytest
import requests

# ─── Configuration ────────────────────────────────────────────────────────────
BASE_URL = "http://localhost:8000/api/v1"

QA_EMAIL         = "test_qa@gridforge.io"
QA2_EMAIL        = "test_qa2@gridforge.io"
QA_PASSWORD      = "SecurePass!99"

TIMEOUT = 10  # seconds

# =============================================================================
# HELPERS
# =============================================================================

def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def login(email: str, password: str) -> str:
    """Încearcă mai întâi să înregistreze userul de test (dacă nu există), apoi face login."""
    username_placeholder = email.split('@')[0]  # extrage 'test_qa' din email
    
    # Pasul A: Încearcă să înregistreze userul (în caz că baza de date e proaspăt ștearsă)
    requests.post(
        f"{BASE_URL}/auth/register",
        json={"username": username_placeholder, "email": email, "password": password, "role": "player"},
        timeout=TIMEOUT
    )
    
    # Pasul B: Efectuează login-ul normal
    res = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password},
        timeout=TIMEOUT,
    )
    assert res.status_code == 200, (
        f"[SETUP] Login failed for {email}: HTTP {res.status_code} — {res.text[:200]}"
    )
    return res.json()["data"]["token"]

def get_my_player_id(token: str) -> str:
    """GET /auth/me → returns the authenticated player's UUID."""
    res = requests.get(
        f"{BASE_URL}/auth/me", headers=auth_header(token), timeout=TIMEOUT
    )
    assert res.status_code == 200, (
        f"[SETUP] GET /auth/me failed: HTTP {res.status_code} — {res.text[:200]}"
    )
    return res.json()["data"]["id"]


def get_or_create_game(token: str) -> str:
    """Returns the first available game ID; creates one if none exist."""
    res = requests.get(
        f"{BASE_URL}/games", headers=auth_header(token), timeout=TIMEOUT
    )
    assert res.status_code == 200, (
        f"[SETUP] GET /games failed: HTTP {res.status_code} — {res.text[:200]}"
    )
    games = res.json()["data"]["data"]
    if games:
        return games[0]["id"]
    
    unique_name = f"QA Arena {int(time.time())}"
    res = requests.post(
        f"{BASE_URL}/games",
        json={"name": unique_name, "description": "Auto-created by QA suite"},
        headers=auth_header(token),
        timeout=TIMEOUT,
    )
    assert res.status_code == 201, (
        f"[SETUP] Game creation failed: HTTP {res.status_code} — {res.text[:200]}"
    )
    return res.json()["data"]["id"]


def get_or_create_item(token: str, game_id: str) -> str:
    """Returns an item ID for the given game; creates one if none exist."""
    res = requests.get(
        f"{BASE_URL}/items",
        params={"game_id": game_id},
        headers=auth_header(token),
        timeout=TIMEOUT,
    )
    assert res.status_code == 200, (
        f"[SETUP] GET /items failed: HTTP {res.status_code} — {res.text[:200]}"
    )
    items = res.json()["data"]["data"]
    if items:
        return items[0]["id"]
    unique_name = f"QA Sword {int(time.time())}"
    res = requests.post(
        f"{BASE_URL}/items",
        json={"game_id": game_id, "name": unique_name, "rarity": "legendary"},
        headers=auth_header(token),
        timeout=TIMEOUT,
    )
    assert res.status_code == 201, (
        f"[SETUP] Item creation failed: HTTP {res.status_code} — {res.text[:200]}"
    )
    return res.json()["data"]["id"]


def ensure_item_in_inventory(token: str, item_id: str) -> None:
    """POST /players/me/inventory — awards 1 unit of item to the current player."""
    res = requests.post(
        f"{BASE_URL}/players/me/inventory",
        json={"item_id": item_id, "quantity": 1},
        headers=auth_header(token),
        timeout=TIMEOUT,
    )
    assert res.status_code in [200, 201], (
        f"[SETUP] Inventory award failed: HTTP {res.status_code} — {res.text[:200]}"
    )


def setup_pending_gift(token_sender: str, token_receiver: str) -> tuple:
    """End-to-end gift setup."""
    receiver_id = get_my_player_id(token_receiver)
    game_id     = get_or_create_game(token_sender)
    item_id     = get_or_create_item(token_sender, game_id)
    ensure_item_in_inventory(token_sender, item_id)

    send_res = requests.post(
        f"{BASE_URL}/gifts",
        json={"recipient_id": receiver_id, "item_id": item_id},
        headers=auth_header(token_sender),
        timeout=TIMEOUT,
    )
    assert send_res.status_code == 201, (
        f"[SETUP] Gift send failed: HTTP {send_res.status_code} — {send_res.text[:200]}"
    )
    return send_res.json()["data"]["id"], item_id, game_id


# =============================================================================
# PYTEST FIXTURES
# =============================================================================

@pytest.fixture(scope="module")
def qa_token():
    return login(QA_EMAIL, QA_PASSWORD)


@pytest.fixture(scope="module")
def qa2_token():
    return login(QA2_EMAIL, QA_PASSWORD)


@pytest.fixture(scope="module")
def shared_game_id(qa_token):
    return get_or_create_game(qa_token)


@pytest.fixture(scope="module")
def shared_item_id(qa_token, shared_game_id):
    return get_or_create_item(qa_token, shared_game_id)


# =============================================================================
# ─── FUNCTIONAL & INTEGRATION TESTS (STABLE) ─────────────────────────────────
# =============================================================================

def test_api_unauthenticated_access_blocked():
    """[Negative / Security] GET /players/me/progress without any token → 401."""
    res = requests.get(f"{BASE_URL}/players/me/progress", timeout=TIMEOUT)
    assert res.status_code == 401, (
        f"Expected 401 with no token, got {res.status_code} — {res.text[:200]}"
    )
    assert "error" in res.json()


def test_api_duplicate_registration_handling():
    """[Negative / Validation] POST /auth/register with already-taken credentials → 422."""
    unique  = int(time.time())
    payload = {
        "username": f"dup_qa_{unique}",
        "email":    f"dup_qa_{unique}@gridforge.io",
        "password": "SecurePass!99",
        "role":     "player",
    }

    r1 = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=TIMEOUT)
    assert r1.status_code == 201

    r2 = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=TIMEOUT)
    assert r2.status_code == 422, (
        f"Expected 422 for duplicate credentials, got {r2.status_code} — {r2.text[:200]}"
    )
    assert "error" in r2.json()


def test_api_invalid_token_rejection():
    """[Security] A structurally invalid JWT in the Authorization header → 401."""
    res = requests.get(
        f"{BASE_URL}/players/me/progress",
        headers={"Authorization": "Bearer header.payload.bad_signature"},
        timeout=TIMEOUT,
    )
    assert res.status_code == 401
    assert "error" in res.json()


def test_e2e_auth_and_profile_flow():
    """[E2E] Full auth chain: POST /auth/login → JWT → GET /players/me/progress."""
    login_res = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": QA_EMAIL, "password": QA_PASSWORD},
        timeout=TIMEOUT,
    )
    assert login_res.status_code == 200
    token = login_res.json()["data"]["token"]

    progress_res = requests.get(
        f"{BASE_URL}/players/me/progress",
        headers=auth_header(token),
        timeout=TIMEOUT,
    )
    assert progress_res.status_code == 200
    progress_list = progress_res.json()["data"]
    assert isinstance(progress_list, list)

    for entry in progress_list:
        assert "score"     in entry and entry["score"] >= 0
        assert "game_id"   in entry
        assert "player_id" in entry


def test_e2e_gift_lifecycle_and_race_condition():
    """[E2E + State Machine] Full gift flow: send → pending → accept → accepted."""
    token_sender   = login(QA_EMAIL,  QA_PASSWORD)
    token_receiver = login(QA2_EMAIL, QA_PASSWORD)

    gift_id, item_id, _ = setup_pending_gift(token_sender, token_receiver)

    accept_res = requests.patch(
        f"{BASE_URL}/gifts/{gift_id}/accept",
        headers=auth_header(token_receiver),
        timeout=TIMEOUT,
    )
    assert accept_res.status_code == 200
    accepted = accept_res.json()["data"]
    assert accepted["status"] == "accepted"
    assert accepted["responded_at"] is not None

    double_accept_res = requests.patch(
        f"{BASE_URL}/gifts/{gift_id}/accept",
        headers=auth_header(token_receiver),
        timeout=TIMEOUT,
    )
    assert double_accept_res.status_code == 404


def test_e2e_leaderboard_progression(qa_token, shared_game_id):
    """[E2E] Score submission upsert → leaderboard sorted DESC → personal rank endpoint."""
    HIGH_SCORE = 99_500

    score_res = requests.post(
        f"{BASE_URL}/players/me/progress",
        json={"game_id": shared_game_id, "score": HIGH_SCORE},
        headers=auth_header(qa_token),
        timeout=TIMEOUT,
    )
    assert score_res.status_code in [200, 201]

    leader_res = requests.get(
        f"{BASE_URL}/leaderboard/{shared_game_id}",
        headers=auth_header(qa_token),
        timeout=TIMEOUT,
    )
    assert leader_res.status_code == 200
    entries = leader_res.json()["data"]

    scores = [e["score"] for e in entries]
    assert scores == sorted(scores, reverse=True)

    rank_res = requests.get(
        f"{BASE_URL}/leaderboard/{shared_game_id}/me",
        headers=auth_header(qa_token),
        timeout=TIMEOUT,
    )
    assert rank_res.status_code == 200
    rank_data = rank_res.json()["data"]
    assert rank_data["rank"] is not None


# ─── MALFORMED HEADERS ────────────────────────────────────────────────────────

_MALFORMED_HEADERS = [
    ("Bearer ",                               "empty token after Bearer prefix"),
    ("Bearer not.a.real.jwt",                 "arbitrary non-JWT string"),
    ("Token eyJhbGciOiJIUzI1NiJ9.mock.sig",   "wrong scheme 'Token' instead of 'Bearer'"),
    ("eyJhbGciOiJIUzI1NiJ9.mock.sig",         "JWT with no scheme prefix at all"),
]

@pytest.mark.parametrize(
    "auth_value, description",
    _MALFORMED_HEADERS,
    ids=[d for _, d in _MALFORMED_HEADERS],
)
def test_auth_malformed_authorization_headers(auth_value, description):
    """[Security] All malformed Authorization header formats must return 401."""
    res = requests.get(
        f"{BASE_URL}/players/me/progress",
        headers={"Authorization": auth_value},
        timeout=TIMEOUT,
    )
    assert res.status_code == 401
    assert "error" in res.json()


# ─── SCORE DATA VALIDATION ────────────────────────────────────────────────────

def test_score_invalid_datatype_rejected(qa_token, shared_game_id):
    """[Validation] POST /players/me/progress with score as a string → 422."""
    res = requests.post(
        f"{BASE_URL}/players/me/progress",
        json={"game_id": shared_game_id, "score": "not_a_number"},
        headers=auth_header(qa_token),
        timeout=TIMEOUT,
    )
    assert res.status_code == 422
    assert "error" in res.json()


def test_score_upsert_cannot_decrease(qa_token, shared_game_id):
    """[Idempotency] Submitting a LOWER score must keep the maximum existing score."""
    VERY_HIGH = 999_000
    LOWER     = 42

    res_high = requests.post(
        f"{BASE_URL}/players/me/progress",
        json={"game_id": shared_game_id, "score": VERY_HIGH},
        headers=auth_header(qa_token),
        timeout=TIMEOUT,
    )
    assert res_high.status_code in [200, 201]
    established = res_high.json()["data"]["score"]

    res_low = requests.post(
        f"{BASE_URL}/players/me/progress",
        json={"game_id": shared_game_id, "score": LOWER},
        headers=auth_header(qa_token),
        timeout=TIMEOUT,
    )
    assert res_low.status_code == 200
    final_score = res_low.json()["data"]["score"]
    assert final_score == established


def test_score_negative_is_rejected(qa_token, shared_game_id):
    """[Validation] POST /players/me/progress with score = -1 → 422."""
    res = requests.post(
        f"{BASE_URL}/players/me/progress",
        json={"game_id": shared_game_id, "score": -1},
        headers=auth_header(qa_token),
        timeout=TIMEOUT,
    )
    assert res.status_code == 422
    assert "error" in res.json()


def test_score_zero_is_valid(shared_game_id):
    """[Validation] POST /players/me/progress with score = 0 → 200 or 201.
    Uses a fresh unique player so they have no prior score on this game,
    guaranteeing a new record is created (no upsert interference).
    """
    unique = int(time.time())
    fresh_email = f"zero_qa_{unique}@gridforge.io"
    fresh_token = login(fresh_email, "SecurePass!99")

    res = requests.post(
        f"{BASE_URL}/players/me/progress",
        json={"game_id": shared_game_id, "score": 0},
        headers=auth_header(fresh_token),
        timeout=TIMEOUT,
    )
    assert res.status_code in [200, 201]
    assert res.json()["data"]["score"] == 0


# ─── GIFT STATE MACHINE ───────────────────────────────────────────────────────

def test_gift_declined_state_blocks_subsequent_accept():
    """[State Machine] A DECLINED gift cannot be retroactively accepted → 404."""
    token_sender   = login(QA_EMAIL,  QA_PASSWORD)
    token_receiver = login(QA2_EMAIL, QA_PASSWORD)

    gift_id, _, _ = setup_pending_gift(token_sender, token_receiver)

    decline_res = requests.patch(
        f"{BASE_URL}/gifts/{gift_id}/decline",
        headers=auth_header(token_receiver),
        timeout=TIMEOUT,
    )
    assert decline_res.status_code == 200
    assert decline_res.json()["data"]["status"] == "declined"

    late_accept = requests.patch(
        f"{BASE_URL}/gifts/{gift_id}/accept",
        headers=auth_header(token_receiver),
        timeout=TIMEOUT,
    )
    assert late_accept.status_code == 404


def test_gift_concurrent_accept_race_condition():
    """[Concurrency] Two simultaneous accept requests result in exactly ONE 200 and ONE 404."""
    token_sender   = login(QA_EMAIL,  QA_PASSWORD)
    token_receiver = login(QA2_EMAIL, QA_PASSWORD)

    gift_id, _, _ = setup_pending_gift(token_sender, token_receiver)

    results = []
    lock = threading.Lock()

    def try_accept():
        res = requests.patch(
            f"{BASE_URL}/gifts/{gift_id}/accept",
            headers=auth_header(token_receiver),
            timeout=TIMEOUT,
        )
        with lock:
            results.append(res.status_code)

    threads = [threading.Thread(target=try_accept) for _ in range(2)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert len(results) == 2
    assert 500 not in results
    assert results.count(200) == 1
    assert results.count(404) == 1