import { test, expect } from "@playwright/test";

test("smoke: production build serves landing and app home", async ({ page }) => {
  const landing = await page.goto("/");
  expect(landing?.ok()).toBeTruthy();
  await expect(
    page.getByRole("link", { name: /Deschide aplicația/i }).first()
  ).toBeVisible();

  const home = await page.goto("/app/home");
  expect(home?.ok()).toBeTruthy();
  await expect(page.getByText(/Nicio stație favorită/i)).toBeVisible();
});
