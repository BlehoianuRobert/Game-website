"""GridForge SDK — a thin Python client over the GridForge REST API.

A game team imports GridForgeClient, logs in once, and calls high-level
methods. The client manages the JWT token, attaches it to every request,
unwraps the API's `{ "data": ... }` success envelope, and turns HTTP error
codes into clear, typed Python exceptions.

Paths below are aligned with src/api/openapi.yaml. `base_url` must be the
server root WITHOUT the version prefix, e.g. "http://localhost:8000" — the
SDK adds "/api/v1" itself.
"""

import requests

from .exceptions import (
    APIError,
    AuthError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
)

# Which exception we raise for each HTTP error status. Anything not listed
# here (e.g. 500) falls back to APIError.
_ERROR_FOR_STATUS = {
    400: ValidationError,
    401: AuthError,
    403: ForbiddenError,
    404: NotFoundError,
    409: ConflictError,
    422: ValidationError,
}


class GridForgeClient:
    def __init__(self, base_url, timeout=10):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.token = None
        self.session = requests.Session()

    # ---- internal helpers -------------------------------------------------

    def _headers(self, auth):
        headers = {"Accept": "application/json"}
        if auth:
            if not self.token and not self.session.cookies:
                raise AuthError("Not logged in. Call login() or register() first.")
            if self.token:
                headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def _request(self, method, path, auth=True, json=None, params=None):
        url = f"{self.base_url}/api/v1{path}"
        headers = self._headers(auth)
        try:
            response = self.session.request(
                method,
                url,
                json=json,
                params=params,
                headers=headers,
                timeout=self.timeout,
            )
        except requests.exceptions.ConnectionError:
            raise APIError(
                f"Cannot reach the GridForge API at {self.base_url}. Is it running?"
            )
        except requests.exceptions.Timeout:
            raise APIError(f"Request to {url} timed out after {self.timeout}s.")
        self._last_response = response
        return self._parse(response)

    def _parse(self, response):
        # The API may return a non-JSON body on hard failures (HTML 500 page,
        # empty 204, etc.), so reading JSON is best-effort.
        try:
            body = response.json()
        except ValueError:
            body = None

        if response.ok:
            # Success bodies are wrapped as { "data": ... } — unwrap them.
            if isinstance(body, dict) and "data" in body:
                return body["data"]
            return body  # logout / empty bodies land here

        # Error path — surface the server's message if it provided one.
        message = None
        if isinstance(body, dict):
            message = body.get("error") or body.get("message")
        if not message:
            message = f"API returned HTTP {response.status_code}"

        exc_class = _ERROR_FOR_STATUS.get(response.status_code, APIError)
        raise exc_class(message, status_code=response.status_code, payload=body)

    def _store_token(self, data):
        token = None
        if isinstance(data, dict):
            token = data.get("token") or data.get("access_token")
        if not token and hasattr(self, "_last_response"):
            cookies = self._last_response.cookies
            token = (
                cookies.get("token")
                or cookies.get("access_token")
                or cookies.get("jwt")
            )
        if not token:
            raise APIError(
                "Authenticated, but no token was found in the response. "
                "Confirm the token field name with the API engineer."
            )
        self.token = token

    # ---- auth -------------------------------------------------------------

    def register(self, username, email, password):
        data = self._request(
            "POST",
            "/auth/register",
            auth=False,
            json={"username": username, "email": email, "password": password},
        )
        self._store_token(data)
        return data

    def login(self, email, password):
        # The API authenticates by email, not username.
        data = self._request(
            "POST",
            "/auth/login",
            auth=False,
            json={"email": email, "password": password},
        )
        self._store_token(data)
        return data

    def logout(self):
        result = self._request("POST", "/auth/logout")
        self.token = None
        self.session.cookies.clear()
        return result

    def me(self):
        return self._request("GET", "/auth/me")

    # ---- players / profile ------------------------------------------------

    def get_profile(self, player_id=None):
        if player_id is None:
            return self._request("GET", "/players/me")
        return self._request("GET", f"/players/{player_id}")

    def update_profile(self, display_name=None, avatar_url=None, bio=None):
        fields = {
            "display_name": display_name,
            "avatar_url": avatar_url,
            "bio": bio,
        }
        body = {k: v for k, v in fields.items() if v is not None}
        if not body:
            raise ValidationError("update_profile() needs at least one field to change.")
        return self._request("PUT", "/players/me", json=body)

    # ---- progress / leaderboard ------------------------------------------

    def submit_score(self, game_id, score):
        # game_id goes in the body, not the URL.
        return self._request(
            "POST", "/players/me/progress", json={"game_id": game_id, "score": score}
        )

    def get_my_progress(self):
        return self._request("GET", "/players/me/progress")

    def get_progress(self, game_id):
        return self._request("GET", f"/players/me/progress/{game_id}")

    def get_leaderboard(self, game_id, limit=10):
        return self._request(
            "GET", f"/leaderboard/{game_id}", params={"limit": limit}
        )

    def get_my_rank(self, game_id):
        return self._request("GET", f"/leaderboard/{game_id}/me")

    # ---- inventory --------------------------------------------------------

    def get_inventory(self):
        return self._request("GET", "/players/me/inventory")

    def add_to_inventory(self, item_id, quantity=1):
        return self._request(
            "POST",
            "/players/me/inventory",
            json={"item_id": item_id, "quantity": quantity},
        )

    def remove_from_inventory(self, item_id):
        return self._request("DELETE", f"/players/me/inventory/{item_id}")

    # ---- gifts ------------------------------------------------------------

    def send_gift(self, recipient_id, item_id):
        return self._request(
            "POST",
            "/gifts",
            json={"recipient_id": recipient_id, "item_id": item_id},
        )

    def get_inbox(self):
        # The API calls this "received".
        return self._request("GET", "/gifts/received")

    def get_sent_gifts(self):
        return self._request("GET", "/gifts/sent")

    def accept_gift(self, gift_id):
        return self._request("PATCH", f"/gifts/{gift_id}/accept")

    def decline_gift(self, gift_id):
        return self._request("PATCH", f"/gifts/{gift_id}/decline")

    # ---- ads --------------------------------------------------------------

    def get_ad_status(self):
        return self._request("GET", "/ads/status")

    # ---- sdk handshake ----------------------------------------------------

    def handshake(self):
        """One call to verify the SDK is connected and authenticated."""
        return self._request("GET", "/sdk/handshake")
