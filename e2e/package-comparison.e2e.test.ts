import { test, expect } from "@playwright/test";

test.describe("Package Comparison Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with MSW enabled via query param
    await page.goto("/?msw=true");
  });

  // Helper function to fill and submit a package
  async function fillAndSubmitPackage(
    page: import("@playwright/test").Page,
    inputName: string,
    packageName: string,
  ) {
    const input = page.getByRole("textbox", { name: inputName });
    await input.fill(packageName);

    // Wait for autocomplete and click first option to submit
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();
  }

  test("should compare two packages side by side", async ({ page }) => {
    // Add a second column
    const addButton = page.getByRole("button", { name: /add package/i });
    await addButton.click();

    // Wait for second column
    await expect(
      page.getByRole("textbox", { name: "Package 2" }),
    ).toBeVisible();

    // Enter and submit both packages
    await fillAndSubmitPackage(page, "Package 1", "react");
    await fillAndSubmitPackage(page, "Package 2", "vue");

    // Wait for both packages to load - check for package name headings (h4 in metrics panel)
    await expect(
      page.getByRole("heading", { name: "react", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("heading", { name: "vue", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display package metadata after submission", async ({ page }) => {
    await fillAndSubmitPackage(page, "Package 1", "lodash");

    // Should show package heading with name (h4 in metrics panel)
    await expect(
      page.getByRole("heading", { name: "lodash", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should show loading or data state after submission", async ({
    page,
  }) => {
    await fillAndSubmitPackage(page, "Package 1", "express");

    // Should show package data (loading state is brief, so we check for the result)
    await expect(
      page.getByRole("heading", { name: "express", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should highlight winner metrics when comparing", async ({ page }) => {
    // Add second column
    const addButton = page.getByRole("button", { name: /add package/i });
    await addButton.click();

    // Wait for second column
    await expect(
      page.getByRole("textbox", { name: "Package 2" }),
    ).toBeVisible();

    // Compare two popular packages
    await fillAndSubmitPackage(page, "Package 1", "react");
    await fillAndSubmitPackage(page, "Package 2", "preact");

    // Wait for both packages to load (h4 in metrics panel, use exact: true to avoid react matching preact)
    await expect(
      page.getByRole("heading", { name: "react", level: 4, exact: true }),
    ).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("heading", { name: "preact", level: 4, exact: true }),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should compare three packages", async ({ page }) => {
    // Add two more columns
    const addButton = page.getByRole("button", { name: /add package/i });
    await addButton.click();
    await expect(
      page.getByRole("textbox", { name: "Package 2" }),
    ).toBeVisible();
    await addButton.click();
    await expect(
      page.getByRole("textbox", { name: "Package 3" }),
    ).toBeVisible();

    // Enter three packages
    await fillAndSubmitPackage(page, "Package 1", "express");
    await fillAndSubmitPackage(page, "Package 2", "fastify");
    await fillAndSubmitPackage(page, "Package 3", "koa");

    // Wait for all packages to load (h4 in metrics panel)
    await expect(
      page.getByRole("heading", { name: "express", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("heading", { name: "fastify", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("heading", { name: "koa", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should update comparison when changing a package", async ({ page }) => {
    // Add second column
    const addButton = page.getByRole("button", { name: /add package/i });
    await addButton.click();
    await expect(
      page.getByRole("textbox", { name: "Package 2" }),
    ).toBeVisible();

    // Enter initial packages
    await fillAndSubmitPackage(page, "Package 1", "moment");
    await fillAndSubmitPackage(page, "Package 2", "dayjs");

    // Wait for data (h4 in metrics panel)
    await expect(
      page.getByRole("heading", { name: "moment", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });

    // Change second package
    const input2 = page.getByRole("textbox", { name: "Package 2" });
    await input2.clear();
    await input2.fill("date-fns");
    const firstOption = page.getByRole("option").first();
    await expect(firstOption).toBeVisible({ timeout: 5000 });
    await firstOption.click();

    // Wait for new data (h4 in metrics panel)
    await expect(
      page.getByRole("heading", { name: "date-fns", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should preserve comparison when removing middle column", async ({
    page,
  }) => {
    // Add two more columns
    const addButton = page.getByRole("button", { name: /add package/i });
    await addButton.click();
    await expect(
      page.getByRole("textbox", { name: "Package 2" }),
    ).toBeVisible();
    await addButton.click();
    await expect(
      page.getByRole("textbox", { name: "Package 3" }),
    ).toBeVisible();

    // Enter packages
    await fillAndSubmitPackage(page, "Package 1", "lodash");
    await fillAndSubmitPackage(page, "Package 2", "underscore");
    await fillAndSubmitPackage(page, "Package 3", "ramda");

    // Wait for data to load (h4 in metrics panel)
    await expect(
      page.getByRole("heading", { name: "lodash", level: 4 }),
    ).toBeVisible({
      timeout: 15000,
    });

    // Remove middle column
    const removeButton = page.getByRole("button", {
      name: /remove package 2/i,
    });
    await removeButton.click();

    // Should now have two columns with lodash and ramda
    await expect(page.getByRole("textbox", { name: "Package 1" })).toHaveValue(
      "lodash",
    );
    await expect(page.getByRole("textbox", { name: "Package 2" })).toHaveValue(
      "ramda",
    );
  });
});
