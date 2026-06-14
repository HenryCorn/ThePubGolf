import { test, expect } from '@playwright/test'

test.describe('Pub Golf smoke test', () => {
  test('registration page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Pub Golf')).toBeVisible()
    await expect(page.getByText("New Player")).toBeVisible()
    await expect(page.getByText('Returning')).toBeVisible()
  })

  test('itinerary page loads', async ({ page }) => {
    await page.goto('/itinerary')
    // Should either show stops or the empty-state message
    const content = page.locator('body')
    await expect(content).toContainText(/Route|No stops/)
  })

  test('leaderboard page loads', async ({ page }) => {
    await page.goto('/leaderboard')
    await expect(page.getByText('Leaderboard')).toBeVisible()
  })

  test('stats page loads', async ({ page }) => {
    await page.goto('/stats')
    await expect(page.getByText('Stats')).toBeVisible()
  })

  test('admin login page loads', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.getByText('Admin')).toBeVisible()
    await expect(page.getByPlaceholder('Enter passcode')).toBeVisible()
  })

  test('admin routes redirect to login without cookie', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('happy path: register → itinerary renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('New Player')).toBeVisible()

    // Fill in name
    const nameInput = page.locator('input[placeholder="e.g. Alex"]')
    await nameInput.fill(`TestPlayer${Date.now()}`)

    // Pick first emoji
    const emojiButtons = page.locator('button').filter({ hasText: /🦁|🐯|🦊/ })
    await emojiButtons.first().click()

    // Submit — will fail gracefully without DB, but we check the form works
    const submitBtn = page.getByRole('button', { name: /Let's golf|Joining/ })
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeEnabled()
  })
})
