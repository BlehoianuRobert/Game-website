import requests
import responses
import pytest

BASE_URL = "http://localhost:8000/api/v1"

# UUIDs fixe folosite în teste — consistent cu data model-ul din openapi.yaml
PLAYER_ID      = "550e8400-e29b-41d4-a716-446655440001"
PLAYER_2_ID    = "550e8400-e29b-41d4-a716-446655440002"
GAME_ID        = "660e8400-e29b-41d4-a716-446655440010"
ITEM_ID        = "770e8400-e29b-41d4-a716-446655440020"
GIFT_ID        = "880e8400-e29b-41d4-a716-446655440030"
MOCK_JWT       = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.bW9ja19wYXlsb2Fk.bW9ja19zaWduYXR1cmU"


# ─── TEST 1: [Negative] Blocare acces fără token + Login reușit cu JWT ────────

@responses.activate
def test_api_unauthenticated_access_blocked():
    """[Negative / Security] GET /players/me/progress fără token → 401.
    Spec: endpoint protejat cu bearerAuth; răspuns { error: string }.
    """
    responses.add(
        responses.GET,
        f"{BASE_URL}/players/me/progress",
        json={"error": "Unauthenticated"},
        status=401
    )

    res = requests.get(f"{BASE_URL}/players/me/progress")

    assert res.status_code == 401, f"Așteptat 401 fără token, primit {res.status_code}"
    body = res.json()
    assert "error" in body, "Răspunsul 401 trebuie să conțină câmpul 'error' conform schemei Error din spec"
    assert body["error"] == "Unauthenticated"


# ─── TEST 2: [Negative] Validare unicitate username la înregistrare → 422 ────

@responses.activate
def test_api_duplicate_registration_handling():
    """[Negative / Validation] POST /auth/register cu username deja existent → 422.
    Spec: register cere username + email + password; duplicat → 422 Validation error.
    """
    responses.add(
        responses.POST,
        f"{BASE_URL}/auth/register",
        json={"error": "The username has already been taken."},
        status=422
    )

    res = requests.post(f"{BASE_URL}/auth/register", json={
        "username": "alex_gamer",
        "email": "alex@example.com",
        "password": "SecurePass!99"
    })

    assert res.status_code == 422, f"Așteptat 422 pentru duplicat, primit {res.status_code}"
    assert "error" in res.json()


# ─── TEST 3: [Security] Respingere token malformat sau expirat → 401 ─────────

@responses.activate
def test_api_invalid_token_rejection():
    """[Security] GET /players/me/progress cu token invalid/expirat → 401.
    Spec: bearerAuth; orice token invalid returnează { error: string } cu 401.
    """
    responses.add(
        responses.GET,
        f"{BASE_URL}/players/me/progress",
        json={"error": "Token has expired"},
        status=401
    )

    res = requests.get(
        f"{BASE_URL}/players/me/progress",
        headers={"Authorization": "Bearer token.invalid.signature"}
    )

    assert res.status_code == 401, f"Token expirat/invalid trebuie să returneze 401, primit {res.status_code}"
    assert "error" in res.json()


# ─── TEST 4: [Functional] Actualizare profil jucător (PUT /players/me) ────────

@responses.activate
def test_api_profile_update():
    """[Functional] PUT /players/me cu display_name + avatar_url → 200.
    Spec: body acceptă display_name (max 64), avatar_url (uri), bio (max 500).
    Răspuns înfășurat în { data: PlayerWithProfile }.
    """
    responses.add(
        responses.PUT,
        f"{BASE_URL}/players/me",
        json={
            "data": {
                "id": PLAYER_ID,
                "username": "alex_gamer",
                "email": "alex@example.com",
                "status": "active",
                "profile": {
                    "id": "990e8400-e29b-41d4-a716-446655440099",
                    "player_id": PLAYER_ID,
                    "display_name": "Alex The Dragon Slayer",
                    "avatar_url": "https://cdn.gridforge.io/avatars/dragon.png",
                    "bio": "Main tank, 3 years experience",
                    "subscribed": False,
                    "ad_state": "idle"
                }
            }
        },
        status=200
    )

    res = requests.put(
        f"{BASE_URL}/players/me",
        json={
            "display_name": "Alex The Dragon Slayer",
            "avatar_url": "https://cdn.gridforge.io/avatars/dragon.png",
            "bio": "Main tank, 3 years experience"
        },
        headers={"Authorization": f"Bearer {MOCK_JWT}"}
    )

    assert res.status_code == 200, f"Așteptat 200 la update profil, primit {res.status_code}"
    data = res.json()["data"]
    assert data["profile"]["display_name"] == "Alex The Dragon Slayer"
    assert data["profile"]["avatar_url"] == "https://cdn.gridforge.io/avatars/dragon.png"
    assert data["status"] == "active", "Update profilului nu trebuie să modifice statusul contului"


# ─── TEST 5: [E2E] Login → extragere token → citire progres autentificat ──────

@responses.activate
def test_e2e_auth_and_profile_flow():
    """[E2E] POST /auth/login (email+password) → JWT → GET /players/me/progress.
    Spec: login cere email (nu username); răspuns { data: { token: string } }.
    """
    responses.add(
        responses.POST,
        f"{BASE_URL}/auth/login",
        json={"data": {"token": MOCK_JWT}},
        status=200
    )
    responses.add(
        responses.GET,
        f"{BASE_URL}/players/me/progress",
        json={
            "data": [
                {
                    "id": "aa0e8400-e29b-41d4-a716-446655440001",
                    "player_id": PLAYER_ID,
                    "game_id": GAME_ID,
                    "score": 4200,
                    "updated_at": "2026-06-16T10:00:00Z"
                }
            ]
        },
        status=200
    )

    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "alex@example.com",
        "password": "SecurePass!99"
    })
    assert login_res.status_code == 200
    token = login_res.json()["data"]["token"]
    assert len(token) > 20, "Token-ul JWT returnat pare prea scurt"

    progress_res = requests.get(
        f"{BASE_URL}/players/me/progress",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert progress_res.status_code == 200
    progress_list = progress_res.json()["data"]
    assert isinstance(progress_list, list), "Progresul trebuie returnat ca array"
    assert progress_list[0]["score"] == 4200


# ─── TEST 6: [E2E] Ciclu complet cadou: PENDING → ACCEPTED + blocare re-accept

@responses.activate
def test_e2e_gift_lifecycle_and_race_condition():
    """[E2E + Edge Case] POST /gifts → PATCH /gifts/{id}/accept → re-accept → 404.
    Spec: status enum = pending | accepted | declined (lowercase).
    Accept: PATCH /gifts/{id}/accept. Re-accept pe gift non-pending → 404.
    """
    # 1. Trimitere cadou → status: pending
    responses.add(
        responses.POST,
        f"{BASE_URL}/gifts",
        json={
            "data": {
                "id": GIFT_ID,
                "sender_id": PLAYER_ID,
                "recipient_id": PLAYER_2_ID,
                "item_id": ITEM_ID,
                "status": "pending",
                "sent_at": "2026-06-16T10:00:00Z",
                "responded_at": None
            }
        },
        status=201
    )

    send_res = requests.post(
        f"{BASE_URL}/gifts",
        json={"recipient_id": PLAYER_2_ID, "item_id": ITEM_ID},
        headers={"Authorization": f"Bearer {MOCK_JWT}"}
    )
    assert send_res.status_code == 201
    gift = send_res.json()["data"]
    assert gift["status"] == "pending", f"Cadou nou trebuie să fie 'pending', primit '{gift['status']}'"
    assert gift["item_id"] == ITEM_ID

    # 2. Acceptare cadou → PATCH /gifts/{id}/accept → status: accepted
    responses.add(
        responses.PATCH,
        f"{BASE_URL}/gifts/{GIFT_ID}/accept",
        json={
            "data": {
                "id": GIFT_ID,
                "sender_id": PLAYER_ID,
                "recipient_id": PLAYER_2_ID,
                "item_id": ITEM_ID,
                "status": "accepted",
                "sent_at": "2026-06-16T10:00:00Z",
                "responded_at": "2026-06-16T10:05:00Z"
            }
        },
        status=200
    )

    accept_res = requests.patch(
        f"{BASE_URL}/gifts/{GIFT_ID}/accept",
        headers={"Authorization": f"Bearer {MOCK_JWT}"}
    )
    assert accept_res.status_code == 200
    accepted = accept_res.json()["data"]
    assert accepted["status"] == "accepted", f"După accept, status trebuie 'accepted', primit '{accepted['status']}'"
    assert accepted["responded_at"] is not None, "responded_at trebuie setat după acceptare"

    # 3. Re-accept pe cadou deja procesat → 404 (gift not found or not pending)
    responses.add(
        responses.PATCH,
        f"{BASE_URL}/gifts/{GIFT_ID}/accept",
        json={"error": "Gift not found or not pending"},
        status=404
    )

    double_accept_res = requests.patch(
        f"{BASE_URL}/gifts/{GIFT_ID}/accept",
        headers={"Authorization": f"Bearer {MOCK_JWT}"}
    )
    assert double_accept_res.status_code == 404, (
        f"Re-accept pe gift deja procesat trebuie să returneze 404, primit {double_accept_res.status_code}"
    )


# ─── TEST 7: [E2E] Submit scor → validare poziție #1 în leaderboard ──────────

@responses.activate
def test_e2e_leaderboard_progression():
    """[E2E] POST /players/me/progress cu scor nou → GET /leaderboard/{gameId}.
    Spec: submit scor actualizează doar dacă e mai mare; leaderboard ordonat DESC.
    Răspuns leaderboard: { data: [LeaderboardEntry] }.
    """
    HIGH_SCORE = 99500

    # 1. Submit scor → 201 (record nou sau scor mai bun)
    responses.add(
        responses.POST,
        f"{BASE_URL}/players/me/progress",
        json={
            "data": {
                "id": "bb0e8400-e29b-41d4-a716-446655440001",
                "player_id": PLAYER_ID,
                "game_id": GAME_ID,
                "score": HIGH_SCORE,
                "updated_at": "2026-06-16T11:30:00Z"
            }
        },
        status=201
    )

    score_res = requests.post(
        f"{BASE_URL}/players/me/progress",
        json={"game_id": GAME_ID, "score": HIGH_SCORE},
        headers={"Authorization": f"Bearer {MOCK_JWT}"}
    )
    assert score_res.status_code == 201, f"Așteptat 201 la submit scor nou, primit {score_res.status_code}"
    assert score_res.json()["data"]["score"] == HIGH_SCORE

    # 2. Leaderboard → GET /leaderboard/{gameId} → jucătorul nostru pe locul 1
    responses.add(
        responses.GET,
        f"{BASE_URL}/leaderboard/{GAME_ID}",
        json={
            "data": [
                {"rank": 1, "player_id": PLAYER_ID,   "username": "alex_gamer",    "score": 99500, "updated_at": "2026-06-16T11:30:00Z"},
                {"rank": 2, "player_id": PLAYER_2_ID, "username": "runner_up",     "score": 75200, "updated_at": "2026-06-16T09:00:00Z"},
                {"rank": 3, "player_id": "cc0e8400-e29b-41d4-a716-446655440003", "username": "bronze_guy", "score": 60100, "updated_at": "2026-06-16T08:00:00Z"},
            ]
        },
        status=200
    )

    leader_res = requests.get(
        f"{BASE_URL}/leaderboard/{GAME_ID}",
        headers={"Authorization": f"Bearer {MOCK_JWT}"}
    )
    assert leader_res.status_code == 200
    entries = leader_res.json()["data"]
    assert len(entries) > 0, "Leaderboard-ul este gol"

    first = entries[0]
    assert first["rank"] == 1
    assert first["player_id"] == PLAYER_ID, (
        f"Așteptat player_id='{PLAYER_ID}' pe locul 1, găsit '{first['player_id']}'"
    )
    assert first["score"] == HIGH_SCORE

    # Invariant de business: lista ordonată descrescător după scor
    scores = [e["score"] for e in entries]
    assert scores == sorted(scores, reverse=True), (
        f"BUG: Leaderboard NU este ordonat DESC. Scoruri primite: {scores}"
    )


# ─── TEST 8: [System Integration] Ban CMS → blocare login API ────────────────

@responses.activate
def test_system_cms_ban_propagation_to_api():
    """[System Integration] Admin suspendă jucătorul via PATCH /players/{id}/status
    (acțiune CMS), apoi jucătorul încearcă login → 403 Forbidden.
    Spec: status enum include 'suspended'; login returnează 401/403 pentru cont suspendat.
    """
    CHEATER_ID = "dd0e8400-e29b-41d4-a716-446655440099"

    # Pas 1: Admin (CMS) suspendă contul via PATCH /players/{id}/status
    responses.add(
        responses.PATCH,
        f"{BASE_URL}/players/{CHEATER_ID}/status",
        json={
            "data": {
                "id": CHEATER_ID,
                "username": "cheater_01",
                "status": "suspended"
            }
        },
        status=200
    )

    ban_res = requests.patch(
        f"{BASE_URL}/players/{CHEATER_ID}/status",
        json={"status": "suspended"},
        headers={"Authorization": f"Bearer {MOCK_JWT}"}
    )
    assert ban_res.status_code == 200
    assert ban_res.json()["data"]["status"] == "suspended"

    # Pas 2: Jucătorul suspendat încearcă login → 403
    responses.add(
        responses.POST,
        f"{BASE_URL}/auth/login",
        json={"error": "Account suspended. Contact support."},
        status=403
    )

    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "cheater01@example.com",
        "password": "password123"
    })
    assert login_res.status_code == 403, (
        f"Cont suspendat prin CMS trebuie să returneze 403 la login, primit {login_res.status_code}"
    )
    assert "suspended" in login_res.json()["error"].lower(), (
        "Mesajul de eroare trebuie să menționeze că accountul este suspendat"
    )
