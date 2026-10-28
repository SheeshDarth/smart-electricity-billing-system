import test from "node:test";
import assert from "node:assert/strict";
import {
  createEnergyBill,
  createEnergyCalculationCsv,
  inspectEnergyCsv,
  parseEnergyCsv,
  suggestEnergyCsvMapping,
} from "../src/domain/billWorkflow.mjs";
import { estimateEnergyCost } from "../src/domain/energyModel.mjs";

const tariff = {
  currency: "INR",
  timezone: "Asia/Kolkata",
  version: "DEMO-FLAT-1",
  ratePerKwh: 8,
  effectiveFrom: "2026-10-16T02:30:00.000Z",
  effectiveTo: "2026-10-16T04:31:00.000Z",
};

const validCsv = [
  "timestamp,meter_id,energy_kwh,interval_start,event_id",
  "2026-10-16T08:15:00+05:30,MTR-1,0.5,2026-10-16T08:00:00+05:30,E-1",
  "2026-10-16T08:30:00+05:30,MTR-1,0.5,2026-10-16T08:15:00+05:30,E-2",
].join("\n");

function parse(text = validCsv) {
  const headers = inspectEnergyCsv(text).headers;
  return parseEnergyCsv(text, {
    siteId: "site-1",
    fallbackMeterId: "MTR-FALLBACK",
    mapping: suggestEnergyCsvMapping(headers),
    intervalMinutes: 15,
    defaultUnit: "kWh",
  });
}

test("inspects a BOM CSV and maps offset timestamps to normalized interval readings", () => {
  const text = "\uFEFF" + validCsv;
  const result = parse(text);

  assert.deepEqual(result.summary, { total: 2, accepted: 2, duplicates: 0, rejected: 0 });
  assert.equal(result.readings[0].siteId, "site-1");
  assert.equal(result.readings[0].meterId, "MTR-1");
  assert.equal(result.readings[0].value, 0.5);
  assert.equal(result.readings[0].unit, "kWh");
  assert.equal(result.readings[0].sourceUnitOrigin, "configured-default");
  assert.equal(result.readings[0].intervalStart, "2026-10-16T02:30:00.000Z");

  const explicitUnit = [
    "timestamp,meter_id,value,unit,interval_start,event_id",
    "2026-10-16T08:15:00+05:30,MTR-1,500,Wh,2026-10-16T08:00:00+05:30,WH-1",
    "",
  ].join("\n");
  const explicit = parse(explicitUnit).readings[0];
  assert.equal(explicit.sourceValue, 500);
  assert.equal(explicit.sourceUnit, "Wh");
  assert.equal(explicit.sourceUnitOrigin, "csv-column");
  assert.equal(explicit.value, 0.5);
  assert.equal(explicit.unit, "kWh");
});

test("supports quoted CSV fields and reports an explicit mapping error", () => {
  const quoted = [
    '"timestamp","meter_id","energy_kwh","interval_start","event_id"',
    '"2026-10-16T08:15:00+05:30","MTR, 1","0.5","2026-10-16T08:00:00+05:30","E-1"',
  ].join("\n");
  const parsed = parse(quoted);
  assert.equal(parsed.readings[0].meterId, "MTR, 1");
  assert.throws(() => parseEnergyCsv(quoted, { siteId: "site-1", mapping: {} }), /Choose a CSV column/);
});

test("rejects timestamps without an explicit UTC offset and incompatible units", () => {
  const missingOffset = validCsv.replace("2026-10-16T08:15:00+05:30", "2026-10-16T08:15:00");
  const first = parse(missingOffset);
  assert.equal(first.summary.rejected, 1);
  assert.match(first.rows[0].reason, /explicit UTC offset/);

  const table = validCsv
    .replace("energy_kwh,interval_start", "energy_kwh,unit,interval_start")
    .replaceAll("MTR-1,0.5,", "MTR-1,0.5,W,");
  const headers = inspectEnergyCsv(table).headers;
  const result = parseEnergyCsv(table, {
    siteId: "site-1",
    mapping: suggestEnergyCsvMapping(headers),
    intervalMinutes: 15,
    defaultUnit: "kWh",
  });
  assert.equal(result.summary.rejected, 2);
});

test("rejects blank values in mapped meter, unit, and interval-start columns", () => {
  const blankMeter = validCsv.replace("MTR-1,0.5", ",0.5");
  const meterResult = parse(blankMeter);
  assert.equal(meterResult.summary.rejected, 1);
  assert.match(meterResult.rows[0].reason, /Meter identifier is blank/);

  const withUnits = validCsv
    .replace("energy_kwh,interval_start", "energy_kwh,unit,interval_start")
    .replaceAll("MTR-1,0.5,2026", "MTR-1,0.5,kWh,2026");
  const blankUnit = withUnits.replace("MTR-1,0.5,kWh,", "MTR-1,0.5,,");
  const unitHeaders = inspectEnergyCsv(blankUnit).headers;
  const unitResult = parseEnergyCsv(blankUnit, {
    siteId: "site-1",
    mapping: suggestEnergyCsvMapping(unitHeaders),
    intervalMinutes: 15,
    defaultUnit: "kWh",
  });
  assert.equal(unitResult.summary.rejected, 1);
  assert.match(unitResult.rows[0].reason, /Energy unit must be Wh or kWh/);

  const blankStart = validCsv.replace("2026-10-16T08:00:00+05:30", "");
  const startResult = parse(blankStart);
  assert.equal(startResult.summary.rejected, 1);
  assert.match(startResult.rows[0].reason, /Interval start timestamp must include an explicit UTC offset/);
});

test("suppresses identical duplicate intervals and rejects conflicting interval values", () => {
  const duplicateRow = "2026-10-16T08:15:00+05:30,MTR-1,0.5,2026-10-16T08:00:00+05:30,E-1";
  const duplicateResult = parse([validCsv, duplicateRow].join("\n"));
  assert.deepEqual(duplicateResult.summary, { total: 3, accepted: 2, duplicates: 1, rejected: 0 });

  const conflictingRow = "2026-10-16T08:15:00+05:30,MTR-1,0.7,2026-10-16T08:00:00+05:30,E-3";
  const conflict = [validCsv, conflictingRow].join("\n");
  const conflictResult = parse(conflict);
  assert.equal(conflictResult.summary.rejected, 2);
  assert.match(conflictResult.rows[0].reason, /Conflicting values/);
});

test("estimate refuses a gap rather than treating the missing interval as zero", () => {
  const gapCsv = validCsv.replace("2026-10-16T08:30:00+05:30,MTR-1,0.5,2026-10-16T08:15:00+05:30", "2026-10-16T08:45:00+05:30,MTR-1,0.5,2026-10-16T08:30:00+05:30");
  const result = parse(gapCsv);
  const estimate = estimateEnergyCost(result.readings, tariff);
  assert.equal(estimate.status, "incomplete");
  assert.match(estimate.reason, /gap exists/);
});

test("builds a traceable e-bill estimate and includes variance only for a confirmed matching period", () => {
  const result = parse();
  const bill = createEnergyBill(result.readings, tariff, {
    siteName: "North Tower",
    supplierBillAmount: "9.25",
    supplierPeriodConfirmed: true,
    generatedAt: "2026-10-27T12:00:00.000Z",
    billReference: "WB-TEST-001",
  });
  assert.equal(bill.documentType, "wattwise-energy-estimate");
  assert.equal(bill.billReference, "WB-TEST-001");
  assert.equal(bill.energyKwh, 1);
  assert.equal(bill.energyCharge, 8);
  assert.equal(bill.tariffMode, "flat");
  assert.equal(bill.ratePerKwh, 8);
  assert.equal(bill.supplierBillAmount, 9.25);
  assert.equal(bill.variance, -1.25);
  assert.deepEqual(bill.chargesExcluded, ["taxes", "fixed charges", "demand charges", "arrears", "export credits"]);

  const unconfirmed = createEnergyBill(result.readings, tariff, {
    supplierBillAmount: "9.25",
    supplierPeriodConfirmed: false,
  });
  assert.equal(unconfirmed.supplierBillAmount, null);
  assert.equal(unconfirmed.variance, null);
});

test("exports every calculation interval with source lineage and an estimate-only summary", () => {
  const duplicateRow = "2026-10-16T08:15:00+05:30,MTR-1,0.5,2026-10-16T08:00:00+05:30,E-3";
  const result = parse([validCsv, duplicateRow].join("\n"));
  const estimate = estimateEnergyCost(result.readings, tariff);
  const csv = createEnergyCalculationCsv(result.readings, estimate, { duplicatesIgnored: result.summary.duplicates });
  const content = csv.replace(/^\uFEFF/, "");

  assert.match(csv, /^\uFEFF"record_type","source_record_ref"/);
  assert.match(content, /"calculation_segment","csv-row:2","E-1","MTR-1"/);
  assert.match(content, /"2026-10-16T02:30:00\.000Z","2026-10-16T02:45:00\.000Z","2026-10-16T02:30:00\.000Z","2026-10-16T02:45:00\.000Z","Flat"/);
  assert.match(content, /"0\.5","kWh","configured-default","0\.500000"/);
  assert.match(content, /"calculation_segment","csv-row:3","E-2","MTR-1"/);
  assert.match(content, /"summary".*"INR".*"tariff-estimate-v2".*"8\.00".*"1\.000".*"2".*"1".*"true"/);
  assert.throws(() => createEnergyCalculationCsv(result.readings, { status: "incomplete" }), /completed estimate/);
});

test("creates a time-of-use e-bill and exports local-hour price segments with source interval lineage", () => {
  const csv = [
    "timestamp,meter_id,energy_kwh,interval_start,event_id",
    "2026-10-16T06:15:00+05:30,MTR-TOU,0.6,2026-10-16T05:45:00+05:30,TOU-1",
  ].join("\n");
  const result = parse(csv);
  const touTariff = {
    currency: "INR",
    timezone: "Asia/Kolkata",
    version: "DEMO-TOU-1",
    effectiveFrom: result.readings[0].intervalStart,
    effectiveTo: new Date(Date.parse(result.readings[0].intervalEnd) + 1).toISOString(),
    timeOfUse: [
      { name: "Peak", startHour: 6, endHour: 22, ratePerKwh: 10 },
      { name: "Off-peak", startHour: 22, endHour: 6, ratePerKwh: 5 },
    ],
  };
  const estimate = estimateEnergyCost(result.readings, touTariff);
  assert.equal(estimate.status, "estimated");
  assert.equal(estimate.total, 4.5);
  assert.deepEqual(estimate.breakdown.map((part) => [part.tariffPeriod, part.energyKwh, part.cost]), [
    ["Off-peak", 0.3, 1.5],
    ["Peak", 0.3, 3],
  ]);

  const bill = createEnergyBill(result.readings, touTariff, { generatedAt: "2026-10-27T12:00:00.000Z" });
  assert.equal(bill.tariffMode, "time-of-use");
  assert.equal(bill.ratePerKwh, null);
  assert.deepEqual(bill.tariffComponents.map((period) => period.name), ["Peak", "Off-peak"]);
  assert.equal(bill.energyCharge, 4.5);

  const csvOutput = createEnergyCalculationCsv(result.readings, estimate).replace(/^\uFEFF/, "");
  assert.match(csvOutput, /"calculation_segment".*"2026-10-16T00:15:00\.000Z","2026-10-16T00:45:00\.000Z","2026-10-16T00:15:00\.000Z","2026-10-16T00:30:00\.000Z","Off-peak"/);
  assert.match(csvOutput, /"Peak".*"0\.300000","10\.000000","3\.000000"/);
  assert.match(csvOutput, /"4\.50","0\.600"/);
});

test("prefixes spreadsheet formula markers in user-provided text cells", () => {
  const formulaCsv = validCsv.replaceAll("MTR-1", "=1+1").replace("E-1", "@SUM(A1)");
  const result = parse(formulaCsv);
  const estimate = estimateEnergyCost(result.readings, tariff);
  const csv = createEnergyCalculationCsv(result.readings, estimate);

  assert.match(csv, /"'=1\+1"/);
  assert.match(csv, /"'@SUM\(A1\)"/);
});

test("keeps one generated e-bill scoped to a single site and meter", () => {
  const result = parse();
  const mixedMeter = [...result.readings, { ...result.readings[1], eventId: "E-OTHER", meterId: "MTR-2" }];
  assert.throws(() => createEnergyBill(mixedMeter, tariff), /one site and one meter only/);

  const mixedSite = [...result.readings, { ...result.readings[1], eventId: "E-OTHER", siteId: "site-2" }];
  assert.throws(() => createEnergyBill(mixedSite, tariff), /one site and one meter only/);
});
