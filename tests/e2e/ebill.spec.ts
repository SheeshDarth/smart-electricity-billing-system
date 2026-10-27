import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const screenshots = resolve("docs/assets/ebill-walkthrough");
const sampleCsv = resolve("public/sample-energy-readings.csv");

test("CSV upload → validation → estimate → supplier bill comparison", async ({ page }) => {
  page.clock.setFixedTime(new Date("2026-10-16T12:00:00.000Z"));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "E-bill", exact: true }).click();
  await page.addStyleTag({ content: "header { position: static !important; }" });

  await page.locator('[aria-label="Choose energy readings CSV"]').setInputFiles(sampleCsv);
  await expect(page.getByText("sample-energy-readings.csv")).toBeVisible();
  await expect(page.getByText("Accepted", { exact: true })).toBeVisible();
  await expect(page.getByText("Rejected", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Meter for this e-bill")).toHaveValue("MTR-DEMO-041");
  await expect(page.getByText("2.720 kWh")).toBeVisible();
  mkdirSync(dirname(resolve(screenshots, "01-csv-validation.png")), { recursive: true });
  await page.screenshot({ path: resolve(screenshots, "01-csv-validation.png"), fullPage: true });

  const supplierTotal = page.getByLabel("Supplier-stated bill total (optional)");
  await supplierTotal.fill("25.00");
  await page.getByLabel("I confirmed that the supplier-stated amount covers the same period shown above.").check();
  await expect(page.getByRole("button", { name: "Generate e-bill PDF" })).toBeEnabled();
  await page.screenshot({ path: resolve(screenshots, "02-estimate-comparison.png"), fullPage: true });

  await page.getByRole("button", { name: "Generate e-bill PDF" }).click();
  await expect(page.getByText("E-bill estimate ready")).toBeVisible();
  await expect(page.getByText(/Variance:.*-₹3\.24/)).toBeVisible();
  await page.screenshot({ path: resolve(screenshots, "03-bill-variance.png"), fullPage: true });

});

test("invalid CSV rows are reported and block bill generation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "E-bill", exact: true }).click();
  await page.locator('[aria-label="Choose energy readings CSV"]').setInputFiles({
    name: "invalid-readings.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("timestamp,energy_kwh\n2026-10-16T08:15:00,0.5\n"),
  });
  await expect(page.getByText("Rejected", { exact: true })).toBeVisible();
  await expect(page.getByText(/explicit UTC offset/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Generate e-bill PDF" })).toBeDisabled();
});
