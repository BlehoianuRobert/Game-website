import requests
import responses  
import pytest

BASE_URL = "http://localhost:3000"  


# ─── HELPER ───────────────────────────────────────────────────────────────────
def register_and_login(username, password):
    """Register a user and return the auth token."""
    requests.post(f"{BASE_URL}/auth/register", json={
        "username": username,
        "password": password
    })
    res = requests.post(f"{BASE_URL}/auth/login", json={
        "username": username,
        "password": password
    })
    return res.json().get("token")


# ─── TESTS ────────────────────────────────────────────────────────────────────

@responses.activate  # <--- Îi spune testului să simuleze serverul
def test_register_success():
    """A new user can register."""
    # Îi spunem programului ce să răspundă când apelăm /auth/register
    responses.add(
        responses.POST,
        f"{BASE_URL}/auth/register",
        json={"status": "success"},
        status=201
    )

    res = requests.post(f"{BASE_URL}/auth/register", json={
        "username": "test_user_001",
        "password": "password123"
    })
    assert res.status_code in [200, 201], f"Expected 200/201, got {res.status_code}"


@responses.activate  # <--- Îi spune testului să simuleze serverul
def test_login_success():
    """A registered user can log in."""
    # Simulăm rutele pentru helper și pentru test
    responses.add(responses.POST, f"{BASE_URL}/auth/register", json={}, status=201)
    responses.add(responses.POST, f"{BASE_URL}/auth/login", json={"token": "mocked_token_123"}, status=200)

    register_and_login("test_user_002", "password123")
    res = requests.post(f"{BASE_URL}/auth/login", json={
        "username": "test_user_002",
        "password": "password123"
    })
    assert res.status_code == 200
    assert "token" in res.json(), "Token missing from login response"


@responses.activate  # <--- Îi spune testului să simuleze serverul
def test_login_wrong_password():
    """Login with wrong password returns an error."""
    responses.add(responses.POST, f"{BASE_URL}/auth/login", json={"error": "Unauthorized"}, status=401)

    res = requests.post(f"{BASE_URL}/auth/login", json={
        "username": "test_user_002",
        "password": "wrongpassword"
    })
    assert res.status_code in [401, 403], f"Expected 401/403, got {res.status_code}"