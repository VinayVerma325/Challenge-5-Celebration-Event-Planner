import { test, expect } from '@playwright/test';

test.describe('End-to-End User Journey: Celebration & Event Planner', () => {
  test('Complete celebration workflow from registration to AI planning, budget, and checklists', async ({ page }) => {
    // 1. Open the application
    await page.goto('/');

    // Verify redirected to /login
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1')).toContainText('Welcome Back');

    // 2. Perform One-Click Evaluator Sign-In
    const evaluatorButton = page.getByRole('button', { name: /one-click evaluator sign-in/i });
    await expect(evaluatorButton).toBeVisible();
    await evaluatorButton.click();

    // Verify navigation to /dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Celebration Overview');

    // 3. Navigate to Events and Create an Event
    await page.getByRole('link', { name: 'Events' }).click();
    await expect(page).toHaveURL(/.*events/);

    const createButton = page.getByRole('button', { name: /create new event/i });
    await createButton.click();

    // Fill Create Event form
    await page.getByLabel(/event title/i).fill('Sophia & Liam Golden Wedding Celebration');
    await page.getByLabel(/celebration date/i).fill('2026-11-20');
    await page.getByLabel(/location \/ venue/i).fill('Grand Crystal Ballroom, San Francisco');
    await page.getByLabel(/estimated guests/i).fill('120');
    await page.getByLabel(/planned budget/i).fill('15000');
    await page.getByLabel(/theme & style preferences/i).fill('Art Deco Vintage Gold & Ivory');

    // Toggle a dietary consideration
    await page.getByRole('button', { name: 'Vegetarian' }).click();

    // Submit form
    await page.getByRole('button', { name: /create event & open planner/i }).click();

    // Verify redirected to Event Detail page
    await expect(page).toHaveURL(/.*events\/.*/, { timeout: 10000 });
    await expect(page.locator('h2')).toContainText('Sophia & Liam Golden Wedding Celebration');

    // 4. Open AI Planner Tab
    const aiTab = page.getByRole('button', { name: /ai planner/i });
    await aiTab.click();

    // Generate AI Plan
    const generateButton = page.getByRole('button', { name: /generate comprehensive plan/i });
    await expect(generateButton).toBeVisible();
    await generateButton.click();

    // Verify Plan loaded (either Live Gemini or transparent Demo Fallback)
    await expect(page.locator('text=Theme Concept & Atmosphere')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Recommended Budget Allocation')).toBeVisible();

    // 5. Apply Plan to Event
    const applyButton = page.getByRole('button', { name: /save & apply plan to event/i });
    await applyButton.click();
    await expect(page.locator('text=Plan successfully applied to event')).toBeVisible({ timeout: 8000 });

    // 6. Navigate to Budget Manager Tab
    const budgetTab = page.getByRole('button', { name: /budget manager/i });
    await budgetTab.click();

    // Verify budget summary populated
    await expect(page.locator('text=Target Event Budget')).toBeVisible();
    await expect(page.locator('text=$15,000.00')).toBeVisible();

    // Add a custom expense
    await page.getByRole('button', { name: /add expense/i }).click();
    await page.getByLabel(/expense item title/i).fill('Artisan Floral Centerpieces');
    await page.getByLabel(/allocated amount/i).fill('1200');
    await page.getByLabel(/actual amount spent/i).fill('1150');
    await page.getByRole('button', { name: /save expense/i }).click();

    await expect(page.locator('text=Artisan Floral Centerpieces')).toBeVisible();

    // 7. Navigate to Timeline & Tasks Tab
    const tasksTab = page.getByRole('button', { name: /timeline & tasks/i });
    await tasksTab.click();

    // Verify tasks generated from AI plan exist
    await expect(page.locator('text=Overall Task Completion')).toBeVisible();
    const taskCheckboxes = page.locator('button[aria-label*="Mark task"]');
    await expect(taskCheckboxes.first()).toBeVisible();

    // Toggle first task completion
    await taskCheckboxes.first().click();

    // 8. Navigate to Vendors Tab
    const vendorsTab = page.getByRole('button', { name: /vendors/i });
    await vendorsTab.click();

    // Add a Vendor
    await page.getByRole('button', { name: /add vendor/i }).click();
    await page.getByLabel(/vendor \/ business name/i).fill('Golden Gate String Quartet');
    await page.getByLabel(/contact person/i).fill('David Miller');
    await page.getByLabel(/phone number/i).fill('(415) 555-8921');
    await page.getByLabel(/quote \/ estimate amount/i).fill('1400');
    await page.getByRole('button', { name: /save vendor/i }).click();

    await expect(page.locator('text=Golden Gate String Quartet')).toBeVisible();

    // 9. Reload Browser Page and Verify Data Persistence
    await page.reload();
    await expect(page.locator('h2')).toContainText('Sophia & Liam Golden Wedding Celebration');
    await expect(page.locator('text=Golden Gate String Quartet')).toBeVisible();
  });
});
