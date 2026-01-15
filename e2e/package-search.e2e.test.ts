import { test, expect } from "@playwright/test";

test.describe("Package Search Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with MSW enabled via query param
    await page.goto("/?msw=true");
  });

  test("should display the app title", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "PeekPackage", level: 4 }),
    ).toBeVisible();
  });

  test("should show autocomplete suggestions when typing", async ({ page }) => {
    const input = page.getByPlaceholder("Search packages...");
    await input.fill("react");

    // Wait for autocomplete suggestions to appear
    await expect(page.getByRole("option").first()).toBeVisible({
      timeout: 5000,
    });

    // Should show multiple suggestions
    const options = page.getByRole("option");
    await expect(options.first()).toBeVisible();
  });

  test("should add package from autocomplete dropdown", async ({ page }) => {
    const input = page.getByPlaceholder("Search packages...");
    await input.fill("lodash");

    // Wait for and click on the first suggestion
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    // Input should be cleared after adding
    await expect(input).toHaveValue("");

    // Package should appear in comparison (h4 heading in column)
    await expect(
      page.getByRole("heading", { name: "lodash", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should add package on Enter key", async ({ page }) => {
    const input = page.getByPlaceholder("Search packages...");
    await input.fill("express");

    // Wait for autocomplete to appear
    await expect(page.getByRole("option").first()).toBeVisible({
      timeout: 5000,
    });

    // Press Enter to add the package
    await input.press("Enter");

    // Should show package data - check for the package name heading (h4 in column)
    await expect(
      page.getByRole("heading", { name: "express", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should show empty state when no packages added", async ({ page }) => {
    // Should show empty state message
    await expect(page.getByText("Compare npm packages")).toBeVisible();
  });

  test("should handle non-existent package gracefully", async ({ page }) => {
    const input = page.getByPlaceholder("Search packages...");
    await input.fill("this-package-definitely-does-not-exist-12345");
    await input.press("Enter");

    // Should handle error gracefully (no crash)
    await page.waitForTimeout(3000);
    // Page should still be functional
    await expect(input).toBeVisible();
  });
});
