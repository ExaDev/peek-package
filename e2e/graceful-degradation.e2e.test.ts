import { test, expect } from "@playwright/test";

test.describe("Graceful Degradation", () => {
  test("should display package data even when GitHub API fails", async ({
    page,
  }) => {
    // Override the GitHub API mock to return errors
    await page.route(/api\.github\.com/, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "API rate limit exceeded" }),
      });
    });

    // Navigate with MSW enabled (npms.io will still be mocked successfully)
    await page.goto("/?msw=true");

    // Search and select a package
    const input = page.getByRole("textbox", { name: "Package 1" });
    await input.fill("react");

    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    // Package should still load with npms.io data even though GitHub failed
    await expect(page.getByRole("heading", { name: "react" })).toBeVisible({
      timeout: 15000,
    });

    // Should display metrics from npms.io (GitHub stats come from collected.github)
    await expect(page.getByText("Weekly Downloads")).toBeVisible();
  });

  test("should handle npms.io API failure gracefully", async ({ page }) => {
    // Don't use MSW - use Playwright routes only
    // Mock search to return results
    await page.route(
      /api\.npms\.io\/v2\/search\/suggestions/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              package: {
                name: "react",
                description:
                  "A JavaScript library for building user interfaces",
                version: "18.2.0",
              },
            },
          ]),
        });
      },
    );

    // Mock package endpoint to return error
    await page.route(/api\.npms\.io\/v2\/package\//, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    // Navigate without MSW
    await page.goto("/");

    // Search and select a package
    const input = page.getByRole("textbox", { name: "Package 1" });
    await input.fill("react");

    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    // App should not crash - input should still be visible after the API error
    await page.waitForTimeout(3000);
    await expect(input).toBeVisible();

    // The card should show the empty placeholder (since data fetch failed)
    await expect(page.getByText("Enter a package name")).toBeVisible();
  });
});
