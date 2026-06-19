"""Typed exceptions raised by the GridForge SDK.

Every error the SDK raises is a subclass of GridForgeError. A game can catch
everything with a single `except GridForgeError`, or catch a specific case
(for example, only a failed login via `except AuthError`).
"""


class GridForgeError(Exception):
    """Base class for every error raised by the SDK."""

    def __init__(self, message, status_code=None, payload=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code  # HTTP status, or None for network errors
        self.payload = payload          # the raw JSON body the API returned, if any


class AuthError(GridForgeError):
    """401 — missing/invalid/expired token, or wrong credentials."""


class ForbiddenError(GridForgeError):
    """403 — authenticated, but not allowed to perform this action."""


class NotFoundError(GridForgeError):
    """404 — the requested resource does not exist."""


class ConflictError(GridForgeError):
    """409 — the resource is in a state that blocks this action."""


class ValidationError(GridForgeError):
    """400 / 422 — the request body failed validation."""


class APIError(GridForgeError):
    """Any other failure: 500, an unexpected status, a network error,
    or a response body the SDK could not read."""
