// Example UI Test — Playwright
// Install: npm install @playwright/test && npx playwright install
// Run:     npx playwright test example.spec.js

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';       // update with your port
const CMS_URL  = 'http://localhost:3000/admin'; // update with your CMS URL

// ─── AUTH TESTS ───────────────────────────────────────────────────────────────
test('register form submits successfully', async ({ page }) => {
  await page.goto(`${BASE_URL}/register`);

  await page.fill('input[name="username"]', 'test_playwright_user');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).not.toHaveURL(/register/);
});

test('login with wrong password shows error', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);

  await page.fill('input[name="username"]', 'nonexistent_user');
  await page.fill('input[name="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');

  const error = page.locator('[data-testid="error-message"], .error, .alert');
  await expect(error).toBeVisible();
});

// ─── CMS TESTS ────────────────────────────────────────────────────────────────
test('admin can search for a player', async ({ page }) => {
  await page.goto(`${CMS_URL}/login`);
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');

  await page.goto(`${CMS_URL}/players`);
  await page.fill('input[placeholder*="search"], input[name="search"]', 'player_name');

  const results = page.locator('table tbody tr, .player-card');
  await expect(results).not.toHaveCount(0);
});

test('leaderboard displays players', async ({ page }) => {
  await page.goto(`${BASE_URL}/leaderboard`);

  const rows = page.locator('table tbody tr, .leaderboard-item');
  await expect(rows).not.toHaveCount(0);
});

// ─── API TESTS WITH PLAYWRIGHT ────────────────────────────────────────────────
test('API login returns token', async ({ request }) => {
  const res = await request.post(`${BASE_URL}/auth/login`, {
    data: { username: 'test_user', password: 'password123' }
  });
  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(body).toHaveProperty('token');
});

test('API profile requires authentication', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/players/me`);
  expect(res.status()).toBe(401);
});

// ─── WRITE YOUR TESTS BELOW ───────────────────────────────────────────────────
// Ideas:
// - Test that the CMS shows all players
// - Test that account suspension works
// - Test that a sent gift appears in the recipient's inbox
// - Test that the leaderboard updates after a score is submitted
