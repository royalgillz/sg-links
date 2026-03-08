import { test, expect } from '@playwright/test'

const MOCK_RESULT = {
  shortCode: 'abc123',
  shortUrl: 'http://localhost:4173/abc123',
  originalUrl: 'https://example.com',
  expiresAt: null,
  passwordProtected: false,
}

const MOCK_STATS = {
  shortCode: 'abc123',
  shortUrl: 'http://localhost:4173/abc123',
  originalUrl: 'https://example.com',
  totalClicks: 5,
  recentClicks: [],
  clicksByDay: [],
  browserBreakdown: [],
  osBreakdown: [],
  expiresAt: null,
}

test.beforeEach(async ({ page }) => {
  await page.route('/api/urls', route => route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify(MOCK_RESULT),
  }))
  await page.route('/api/urls/abc123/stats', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(MOCK_STATS),
  }))
})

test('landing page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Short links')
  await expect(page.locator('input[type="url"]')).toBeVisible()
  await expect(page.locator('button[type="submit"]')).toBeVisible()
})

test('shortens a URL and shows result', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[type="url"]', 'https://example.com')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=abc123')).toBeVisible()
  await expect(page.locator('text=5 clicks')).toBeVisible()
})

test('copy button copies short URL', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[type="url"]', 'https://example.com')
  await page.click('button[type="submit"]')
  await page.waitForSelector('text=abc123')

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.click('text=Copy')
  await expect(page.locator('text=✓ Copied!')).toBeVisible()
})

test('bulk tab shows textarea', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Bulk')
  await expect(page.locator('textarea')).toBeVisible()
  await expect(page.locator('text=Single URL')).toBeVisible()
})

test('password field is present', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('input[type="password"]')).toBeVisible()
})

test('preview modal opens from URL param', async ({ page }) => {
  await page.route('/api/urls/abc123/stats', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(MOCK_STATS),
  }))
  await page.goto('/?preview=abc123')
  await expect(page.locator('text=Link Preview')).toBeVisible()
  await expect(page.locator('text=5')).toBeVisible()
})
