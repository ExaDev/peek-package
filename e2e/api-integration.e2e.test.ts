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
    const input = page.getByPlaceholder("Search packages...");
    await input.fill("react");

    // Wait for autocomplete suggestions and click the "react" option
    // The option name includes both package name and description, so we match
    // on "react React" to distinguish from "react-dom", "react-router", etc.
    const reactOption = page.getByRole("option", { name: /^react React/ });
    await expect(reactOption).toBeVisible({ timeout: 15000 });
    await reactOption.click();

    // Should show real package data - allow extra time for real API calls
    // which may involve multiple requests (npms.io + GitHub API)
    await expect(
      page.getByRole("heading", { name: "react", level: 4 }),
    ).toBeVisible({
      timeout: 30000,
    });
  });

  test("should handle non-existent package gracefully", async ({ page }) => {
    const input = page.getByPlaceholder("Search packages...");
    await input.fill("this-package-definitely-does-not-exist-xyz-12345");
    await input.press("Enter");

    // Should handle error gracefully (no crash)
    await page.waitForTimeout(3000);
    // Page should still be functional
    await expect(input).toBeVisible();
  });

  test("should fetch real package data from PyPI", async ({ page }) => {
    // Navigate directly with PyPI package in URL
    // This tests the ecosystem prefix routing
    await page.goto("/?packages=pypi:django");

    // Should show real Django data from PyPI (not npm)
    await expect(page.getByText("django", { exact: true })).toBeVisible({
      timeout: 30000,
    });
  });
});
