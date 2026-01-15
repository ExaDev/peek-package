import { test, expect } from "@playwright/test";

test.describe("Column Management Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with MSW enabled via query param
    await page.goto("/?msw=true");
  });

  test("should start with one empty column", async ({ page }) => {
    // Should have exactly one package input initially
    await expect(
      page.getByRole("textbox", { name: "Package 1" }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Package 2" }),
    ).not.toBeVisible();
  });

  test("should add a new column when clicking add button", async ({ page }) => {
    // Find and click the add column button
    const addButton = page.getByRole("button", { name: /add package/i });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Should now have two package inputs
    await expect(
      page.getByRole("textbox", { name: "Package 1" }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Package 2" }),
    ).toBeVisible();
  });

  test("should add up to 6 columns maximum", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add package/i });

    // Add 5 more columns (starting with 1)
    for (let i = 0; i < 5; i++) {
      await addButton.click();
      await page.waitForTimeout(100); // Small delay for UI update
    }

    // Should have 6 columns
    await expect(
      page.getByRole("textbox", { name: "Package 1" }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Package 6" }),
    ).toBeVisible();

    // Add button should be disabled or hidden
    await expect(addButton).toBeDisabled();
  });

  test("should remove column when clicking remove button", async ({ page }) => {
    // First add a second column
    const addButton = page.getByRole("button", { name: /add package/i });
    await addButton.click();
    await expect(
      page.getByRole("textbox", { name: "Package 2" }),
    ).toBeVisible();

    // Find and click remove button for second column
    const removeButton = page.getByRole("button", {
      name: /remove package 2/i,
    });
    await removeButton.click();

    // Should now have only one column
    await expect(
      page.getByRole("textbox", { name: "Package 2" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Package 1" }),
    ).toBeVisible();
  });

  test("should not show remove button when only one column exists", async ({
    page,
  }) => {
    // With only one column, remove button should not be visible
    await expect(
      page.getByRole("button", { name: /remove package 1/i }),
    ).not.toBeVisible();
  });

  test("should show remove button when multiple columns exist", async ({
    page,
  }) => {
    // Add a second column
    const addButton = page.getByRole("button", { name: /add package/i });
    await addButton.click();

    // Both columns should have remove buttons
    await expect(
      page.getByRole("button", { name: /remove package 1/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /remove package 2/i }),
    ).toBeVisible();
  });

  test("should maintain input values when adding columns", async ({ page }) => {
    // First add a column, then enter value (avoids autocomplete blocking add button)
    const addButton = page.getByRole("button", { name: /add package/i });
    await addButton.click();

    // Wait for the second column to appear
    const input2 = page.getByRole("textbox", { name: "Package 2" });
    await expect(input2).toBeVisible();

    // Now enter a value in the first column
    const input1 = page.getByRole("textbox", { name: "Package 1" });
    await input1.fill("react");

    // Close autocomplete
    await input1.press("Escape");

    // First column should still have its value
    await expect(input1).toHaveValue("react");

    // Second column should be empty
    await expect(input2).toHaveValue("");
  });

  test("should display all columns when many are added", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add package/i });

    // Add 5 more columns (starting with 1, ending with 6)
    for (let i = 0; i < 5; i++) {
      await addButton.click();
      await page.waitForTimeout(100);
    }

    // All 6 columns should be accessible
    await expect(
      page.getByRole("textbox", { name: "Package 1" }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Package 6" }),
    ).toBeVisible();

    // Verify we can interact with both first and last columns
    await page.getByRole("textbox", { name: "Package 1" }).fill("first");
    await page.getByRole("textbox", { name: "Package 6" }).fill("last");

    await expect(page.getByRole("textbox", { name: "Package 1" })).toHaveValue(
      "first",
    );
    await expect(page.getByRole("textbox", { name: "Package 6" })).toHaveValue(
      "last",
    );
  });
});
