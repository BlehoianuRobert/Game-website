# Automated test examples

Two starter examples — one in Python, one in JavaScript.
These show the **structure** of an automated test. Do not copy them directly.

---

## Python — pytest + requests

Good for testing the API directly, without a UI.

```bash
pip install requests pytest
pytest test_api_example.py -v
```

## JavaScript — Playwright

Good for testing the visual interface (CMS) and the API.

```bash
npm install @playwright/test
npx playwright install
npx playwright test example.spec.js
```

---

## Before writing tests, ask yourself

- What happens if I send a gift to a user that does not exist?
- What happens if a suspended user tries to log in?
- Does the leaderboard update after a score is submitted?
- Can I access the CMS without being an admin?

Each question like this is a potential test.
