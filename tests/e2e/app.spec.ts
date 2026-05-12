import { test, expect } from '@playwright/test'

test.describe('Canada Citizenship Prep', () => {
  test('landing page loads and shows hero heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Canadian')
  })

  test('navigating to login page works', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /start.*studying/i }).first().click()
    await expect(page).toHaveURL('/auth/login')
  })

  test('can sign in with a username', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByPlaceholder('e.g. maple_leaf_fan').fill('e2e_testuser_123')
    await page.getByRole('button', { name: /start studying/i }).click()
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('e2e_testuser_123')).toBeVisible()
  })

  test('dashboard shows study mode tiles', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByPlaceholder('e.g. maple_leaf_fan').fill('e2e_dash_tester')
    await page.getByRole('button', { name: /start studying/i }).click()
    await page.waitForURL('/dashboard')
    await expect(page.getByText('Exam Simulator')).toBeVisible()
    await expect(page.getByText('Flashcards')).toBeVisible()
  })

  test('health check API returns 200', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
  })

  test('topics API returns 10 topics', async ({ request }) => {
    const res = await request.get('/api/topics')
    expect(res.status()).toBe(200)
    const topics = await res.json()
    expect(topics.length).toBe(10)
  })

  test('unauthenticated access to dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/auth\/login/)
  })
})
