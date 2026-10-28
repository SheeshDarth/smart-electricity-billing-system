import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const screenshots = resolve("docs/assets/ebill-walkthrough");
const sampleCsv = resolve("public/sample-energy-readings.csv");

test("CSV upload → validation → estimate → comparison → PDF download", async ({ page }) => {
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

  await page.getByText(/View calculation detail/).click();
  await expect(page.getByRole("columnheader", { name: /Rate \/ kWh \(INR\)/ })).toBeVisible();
  await expect(page.getByText("csv-row:2")).toBeVisible();
  await expect(page.getByText("0.280000 kWh")).toBeVisible();
  await expect(page.getByText("INR 2.240000", { exact: true })).toBeVisible();

  const [calculationDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download full calculation CSV" }).click(),
  ]);
  expect(calculationDownload.suggestedFilename()).toBe("wattwise-energy-calculation.csv");
  const calculationCsv = (await readFile(await calculationDownload.path(), "utf8")).replace(/^\uFEFF/, "");
  expect(calculationCsv).toContain('"interval","csv-row:2","DEMO-0001"');
  expect(calculationCsv).toContain('"0.28","kWh","configured-default","0.280000"');
  expect(calculationCsv).toContain('"summary"');
  expect(calculationCsv).toContain('"21.76","2.720","8","0"');

  const supplierTotal = page.getByLabel("Supplier-stated bill total (optional)");
  await supplierTotal.fill("25.00");
  await page.getByLabel("I confirmed that the supplier-stated amount covers the same period shown above.").check();
  await expect(page.getByRole("button", { name: "Generate e-bill PDF" })).toBeEnabled();
  await page.screenshot({ path: resolve(screenshots, "02-estimate-comparison.png"), fullPage: true });

  await page.getByRole("button", { name: "Generate e-bill PDF" }).click();
  await expect(page.getByText("E-bill estimate ready")).toBeVisible();
  await expect(page.getByText(/Variance:.*-₹3\.24/)).toBeVisible();
  await page.screenshot({ path: resolve(screenshots, "03-bill-variance.png"), fullPage: true });

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download PDF" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^wb-\d{14}-[a-z0-9]{5}\.pdf$/i);
  const pdf = await readFile(await download.path());
  const pdfText = pdf.toString("latin1");
  expect(pdfText).toMatch(/^%PDF-1\.4/);
  expect(pdfText).toContain("INR 21.76");
  expect(pdfText).toContain("INR -3.24");
  expect(pdfText).toContain("NOT AN OFFICIAL UTILITY INVOICE");
  await expect(page.getByRole("status")).toContainText("E-bill PDF downloaded");
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

test("replacing a CSV clears the previous supplier-period confirmation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "E-bill", exact: true }).click();

  const fileInput = page.locator('[aria-label="Choose energy readings CSV"]');
  await fileInput.setInputFiles(sampleCsv);
  const supplierTotal = page.getByLabel("Supplier-stated bill total (optional)");
  const confirmation = page.getByLabel("I confirmed that the supplier-stated amount covers the same period shown above.");
  await supplierTotal.fill("25.00");
  await confirmation.check();
  await expect(confirmation).toBeChecked();

  await fileInput.setInputFiles({
    name: "different-period.csv",
    mimeType: "text/csv",
    buffer: Buffer.from([
      "timestamp,meter_id,energy_kwh,interval_start,event_id",
      "2026-10-17T08:15:00+05:30,MTR-DEMO-041,0.50,2026-10-17T08:00:00+05:30,NEXT-0001",
      "",
    ].join("\n")),
  });

  await expect(page.getByText("different-period.csv")).toBeVisible();
  await expect(supplierTotal).toHaveValue("");
  await expect(confirmation).not.toBeChecked();
  await expect(confirmation).toBeDisabled();
  await expect(page.getByRole("button", { name: "Generate e-bill PDF" })).toBeEnabled();
});
