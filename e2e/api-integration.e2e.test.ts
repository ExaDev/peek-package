import { test, expect } from "@playwright/test";

/**
 * Real API integration tests
 * These tests use actual API calls to verify end-to-end integration
 * Run sparingly to avoid rate limiting and flakiness
 */
test.describe("API Integration (Real API)", () => {
  // These tests are slower and may be flaky due to network conditions
  test.slow();

  test.beforeEach(async ({ page }) => {
    // No mocking - use real API
    await page.goto("/");
  });

  test("should fetch real package data from npms.io", async ({ page }) => {
    const input = page.getByRole("textbox", { name: "Package 1" });
    await input.fill("react");

    // Wait for real autocomplete suggestions
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 10000 });
    await firstOption.click();

    // Should show real package data
    await expect(page.getByRole("heading", { name: "react" })).toBeVisible({
      timeout: 20000,
    });
  });

  test("should handle non-existent package gracefully", async ({ page }) => {
    const input = page.getByRole("textbox", { name: "Package 1" });
    await input.fill("this-package-definitely-does-not-exist-xyz-12345");
    await input.press("Enter");

    // Should handle error gracefully (no crash)
    await page.waitForTimeout(3000);
    // Page should still be functional
    await expect(input).toBeVisible();
  });
});
