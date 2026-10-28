import test from "node:test";
import assert from "node:assert/strict";
import { createEnergyBillPdf } from "../src/domain/ebillPdf.mjs";

const bill = {
  documentType: "wattwise-energy-estimate",
  estimatedOnly: true,
  billReference: "WB-TEST-001",
  generatedAt: "2026-10-27T12:00:00.000Z",
  siteName: "North Tower",
  customerName: "",
  meterId: "MTR-TEST-1",
  periodStart: "2026-10-16T02:30:00.000Z",
  periodEnd: "2026-10-16T03:30:00.000Z",
  timezone: "Asia/Kolkata",
  currency: "INR",
  energyKwh: 1.25,
  energyCharge: 10,
  readingCount: 5,
  duplicatesIgnored: 1,
  tariffVersion: "DEMO-FLAT-1",
  ratePerKwh: 8,
  calculationVersion: "tariff-estimate-v2",
  classification: "synthetic-demo",
  supplierBillAmount: 11.5,
  variance: -1.5,
};

test("generates a structurally complete PDF with estimate and scope disclosures", () => {
  const bytes = createEnergyBillPdf(bill);
  const pdf = new TextDecoder().decode(bytes);
  assert.match(pdf, /^%PDF-1\.4/);
  assert.match(pdf, /\/Type \/Catalog/);
  assert.match(pdf, /\/Type \/Page\b/);
  assert.match(pdf, /ELECTRICITY E-BILL  \|  ESTIMATE/);
  assert.match(pdf, /NOT AN OFFICIAL UTILITY INVOICE/);
  assert.match(pdf, /taxes, fixed\/demand charges, arrears, and export credits are excluded/i);
  assert.match(pdf, /Supplier-stated total/);
  assert.match(pdf, /%%EOF\s*$/);

  const xref = Number(pdf.match(/startxref\n(\d+)/)?.[1]);
  assert.equal(pdf.slice(xref, xref + 4), "xref");
});

test("rejects a document that could be mistaken for an official or non-estimated bill", () => {
  assert.throws(() => createEnergyBillPdf({ ...bill, estimatedOnly: false }), /estimated e-bill is required/);
  assert.throws(() => createEnergyBillPdf({ ...bill, documentType: "official-utility-bill" }), /estimated e-bill is required/);
});

test("prints the two-band tariff schedule in a time-of-use estimate without NaN rates", () => {
  const bytes = createEnergyBillPdf({
    ...bill,
    tariffMode: "time-of-use",
    ratePerKwh: null,
    tariffComponents: [
      { name: "Peak", startHour: 6, endHour: 22, ratePerKwh: 10 },
      { name: "Off-peak", startHour: 22, endHour: 6, ratePerKwh: 5 },
    ],
  });
  const pdf = new TextDecoder().decode(bytes);
  assert.match(pdf, /Energy charge by time-of-use tariff/);
  assert.match(pdf, /Tariff band: Peak 06:00-22:00 @ INR 10\.0000\/kWh/);
  assert.match(pdf, /Tariff band: Off-peak 22:00-06:00 @ INR 5\.0000\/kWh/);
  assert.doesNotMatch(pdf, /NaN/);
});
