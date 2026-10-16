import test from "node:test";
import assert from "node:assert/strict";
import { cumulativeDelta, deduplicateEvents, estimateEnergyCost, normalizeMeasurement, runDigitalTwinScenario } from "../src/domain/energyModel.mjs";

const makeReading = (overrides = {}) => ({
  eventId: "event-1", siteId: "site-1", meterId: "meter-1", schemaVersion: 1,
  measuredAt: "2026-10-16T00:15:00Z", kind: "interval_energy", unit: "Wh", value: 500,
  quality: "valid", intervalStart: "2026-10-16T00:00:00Z", intervalEnd: "2026-10-16T00:15:00Z",
  sourceAdapter: "test", ...overrides,
});
const flatTariff = { currency: "INR", timezone: "Asia/Kolkata", version: "test-1", effectiveFrom: "2026-01-01T00:00:00Z", effectiveTo: "2027-01-01T00:00:00Z", ratePerKwh: 8 };
const touTariff = {
  ...flatTariff,
  ratePerKwh: undefined,
  timeOfUse: [
    { startHour: 0, endHour: 8, ratePerKwh: 4 },
    { startHour: 8, endHour: 18, ratePerKwh: 10 },
    { startHour: 18, endHour: 0, ratePerKwh: 6 },
  ],
};

test("normalizes Wh to kWh while preserving the source record", () => {
  const input = makeReading();
  const result = normalizeMeasurement(input);
  assert.equal(result.status, "valid");
  assert.equal(result.value.value, 0.5);
  assert.equal(result.value.unit, "kWh");
  assert.equal(result.value.sourceValue, 500);
  assert.equal(input.value, 500);
});

test("rejects a unit that does not match the measurement kind", () => {
  const result = normalizeMeasurement(makeReading({ unit: "W" }));
  assert.equal(result.status, "invalid");
  assert.match(result.errors.join(" "), /unit does not match/);
});

test("deduplicates by stable event ID and reports suppressed events", () => {
  const first = makeReading();
  const result = deduplicateEvents([first, { ...first }]);
  assert.equal(result.accepted.length, 1);
  assert.equal(result.duplicates.length, 1);
});

test("quarantines a counter reset unless a maximum register proves rollover", () => {
  const previous = { value: 998, measuredAt: "2026-10-16T00:00:00Z" };
  const current = { value: 3, measuredAt: "2026-10-16T00:15:00Z" };
  assert.equal(cumulativeDelta(previous, current).status, "quarantined");
  assert.deepEqual(cumulativeDelta(previous, current, 999), { status: "valid", delta: 5, rollover: true });
});

test("calculates a flat-tariff estimate from contiguous intervals", () => {
  const second = makeReading({ eventId: "event-2", measuredAt: "2026-10-16T00:30:00Z", intervalStart: "2026-10-16T00:15:00Z", intervalEnd: "2026-10-16T00:30:00Z" });
  const result = estimateEnergyCost([makeReading(), second], flatTariff);
  assert.equal(result.status, "estimated");
  assert.equal(result.energyKwh, 1);
  assert.equal(result.total, 8);
  assert.equal(result.calculationVersion, "tariff-estimate-v2");
});

test("does not zero-fill a missing interval", () => {
  const later = makeReading({ eventId: "event-2", measuredAt: "2026-10-16T00:45:00Z", intervalStart: "2026-10-16T00:30:00Z", intervalEnd: "2026-10-16T00:45:00Z" });
  const result = estimateEnergyCost([makeReading(), later], flatTariff);
  assert.equal(result.status, "incomplete");
  assert.match(result.reason, /not treated as zero/);
});

test("uses the tariff timezone to select a time-of-use component", () => {
  const morning = makeReading({ intervalStart: "2026-10-16T03:00:00Z", intervalEnd: "2026-10-16T03:15:00Z", measuredAt: "2026-10-16T03:15:00Z" });
  assert.equal(estimateEnergyCost([morning], touTariff).total, 5);
});

test("splits energy across a local time-of-use boundary", () => {
  const reading = makeReading({ value: 1000, intervalStart: "2026-10-16T02:15:00Z", intervalEnd: "2026-10-16T02:45:00Z", measuredAt: "2026-10-16T02:45:00Z" });
  const result = estimateEnergyCost([reading], touTariff);
  assert.equal(result.status, "estimated");
  assert.equal(result.total, 7);
  assert.equal(result.breakdown.length, 2);
  assert.deepEqual(result.breakdown.map((part) => part.ratePerKwh), [4, 10]);
});

test("rejects overlapping time-of-use tariff periods", () => {
  const tariff = { ...touTariff, timeOfUse: [{ startHour: 0, endHour: 12, ratePerKwh: 4 }, { startHour: 11, endHour: 23, ratePerKwh: 10 }] };
  const result = estimateEnergyCost([makeReading()], tariff);
  assert.equal(result.status, "incomplete");
  assert.match(result.reason, /overlap/);
});

test("does not price intervals outside the tariff effective window", () => {
  const tariff = { ...flatTariff, effectiveFrom: "2026-10-16T00:05:00Z" };
  const result = estimateEnergyCost([makeReading()], tariff);
  assert.equal(result.status, "incomplete");
  assert.match(result.reason, /outside the tariff effective window/);
});

test("withholds an estimate when the expected interval count is incomplete", () => {
  const result = estimateEnergyCost([makeReading()], flatTariff, { expectedIntervalCount: 2 });
  assert.equal(result.status, "incomplete");
  assert.match(result.reason, /expected interval count/);
});

test("quarantines an invalid-unit digital-twin scenario before cost calculation", () => {
  const result = runDigitalTwinScenario("invalid-unit");
  assert.equal(result.status, "quarantined");
  assert.equal(result.accepted.length, 0);
  assert.equal(result.quarantined.length, 1);
  assert.equal(result.quarantined[0].status, "invalid");
});

test("simulates stale, duplicate, reset, and tariff scenarios without inventing zeros", () => {
  assert.equal(runDigitalTwinScenario("stale").status, "stale");
  assert.equal(runDigitalTwinScenario("duplicate").status, "deduplicated");
  assert.equal(runDigitalTwinScenario("reset").status, "quarantined");
  assert.equal(runDigitalTwinScenario("tariff").tariffVersion, "IN-DEMO-1.5");
  assert.equal(runDigitalTwinScenario("stale").missingIsZero, false);
});
