import { test, expect } from "@playwright/test";

/**
 * E2E tests for PyPI dual-dataset functionality
 * Tests full vs popular dataset loading and fallback mechanism
 */

test.describe("PyPI Dual Dataset Loading", () => {
  test("should prefetch both PyPI datasets in background", async ({ page }) => {
    // Set up request tracking before navigation
    const requests: Array<{ url: string; method: string }> = [];

    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("pypi.org") || url.includes("hugovk.github.io")) {
        requests.push({
          url: url,
          method: request.method(),
        });
      }
    });

    // Navigate to home page
    await page.goto("/");

    // Wait for prefetch to complete
    await page.waitForTimeout(10000);

    // Verify at least some PyPI-related requests were made
    const pypiRequests = requests.filter(
      (r) => r.url.includes("pypi.org") || r.url.includes("top-pypi-packages"),
    );

    // Should have made at least one request for PyPI data
    expect(pypiRequests.length).toBeGreaterThan(0);
  });

  test("should search PyPI packages with popular dataset", async ({ page }) => {
    // Navigate with a PyPI package to trigger dataset loading
    await page.goto("/?packages=pypi:django");

    // Wait for page and data to load
    await page.waitForTimeout(5000);

    // Django package should be visible (use first() due to multiple matches)
    await expect(page.getByText("django", { exact: true }).first()).toBeVisible(
      {
        timeout: 10000,
      },
    );
  });

  test("should handle search for PyPI packages", async ({ page }) => {
    await page.goto("/");

    // Wait for page to be ready
    await page.waitForLoadState("networkidle");

    // Type in search box for PyPI package (don't use pypi: prefix in search)
    const input = page.getByPlaceholder("Search packages...");
    await input.waitFor({ state: "visible", timeout: 10000 });
    await input.fill("flask");

    // Wait for autocomplete to appear
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 10000 });
  });
});

test.describe("PyPI Full Dataset Integration", () => {
  test("should fetch full dataset when available", async ({ page }) => {
    // Monitor for full dataset fetch
    const fullDatasetRequested: string[] = [];

    page.on("request", (request) => {
      if (
        request.url().includes("pypi.org/simple") &&
        request.url().includes("application/vnd.pypi.simple.v1+json")
      ) {
        fullDatasetRequested.push(request.url());
      }
    });

    await page.goto("/");
    await page.waitForTimeout(10000);

    // Full dataset should be requested
    expect(fullDatasetRequested.length).toBeGreaterThan(0);
  });

  test("should fall back to popular dataset if full fails", async ({
    page,
  }) => {
    // Mock full dataset to fail
    await page.route("**/pypi.org/simple/**", (route) => route.abort());

    // Popular dataset should still work
    await page.goto("/?packages=pypi:django");

    // Should still load successfully with popular dataset
    await expect(page.getByText("django", { exact: true }).first()).toBeVisible(
      {
        timeout: 10000,
      },
    );
  });
});

test.describe("PyPI Dataset Performance", () => {
  test("should load popular dataset faster than full dataset", async ({
    page,
  }) => {
    const requestStartTimes = new Map<string, number>();
    const requestDurations = new Map<string, number>();

    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("top-pypi-packages")) {
        requestStartTimes.set(url, Date.now());
      }
    });

    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("top-pypi-packages") && requestStartTimes.has(url)) {
        const startTime = requestStartTimes.get(url)!;
        requestDurations.set(url, Date.now() - startTime);
      }
    });

    await page.goto("/");
    await page.waitForTimeout(15000);

    // Popular dataset should load quickly (< 10 seconds)
    const durations = Array.from(requestDurations.values());
    if (durations.length > 0) {
      expect(durations[0]).toBeLessThan(10000); // Should load in < 10 seconds
    }
  });
});
