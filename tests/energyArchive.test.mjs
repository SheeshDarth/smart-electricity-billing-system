import test from "node:test";
import assert from "node:assert/strict";
import {
  createEnergyArchive,
  ENERGY_ARCHIVE_FORMAT,
  ENERGY_ARCHIVE_SCHEMA_VERSION,
  MAX_ENERGY_ARCHIVE_BYTES,
  inspectEnergyArchive,
  parseEnergyArchive,
} from "../src/domain/energyArchive.mjs";

const COLLECTIONS = [
  "organizations", "sites", "areas", "assets", "meters", "adapters",
  "measurements", "tariffs", "billingRuns", "insights", "interventions",
];

function emptyArchive() {
  return {
    format: ENERGY_ARCHIVE_FORMAT,
    schemaVersion: ENERGY_ARCHIVE_SCHEMA_VERSION,
    exportedAt: "2026-10-20T12:00:00.000Z",
    organizations: [], sites: [], areas: [], assets: [], meters: [],
    adapters: [], measurements: [], tariffs: [], billingRuns: [],
    insights: [], interventions: [],
  };
}

function measurement(overrides = {}) {
  return {
    eventId: "event-1", siteId: "site-1", meterId: "meter-1",
    schemaVersion: 1, measuredAt: "2026-10-20T12:15:00Z",
    kind: "interval_energy", unit: "Wh", value: 500, quality: "valid",
    intervalStart: "2026-10-20T12:00:00Z",
    intervalEnd: "2026-10-20T12:15:00Z",
    sourceRecordRef: "source-row-1", ...overrides,
  };
}

function rawArchive(overrides = {}) {
  const hasMeasurements = Array.isArray(overrides.measurements) && overrides.measurements.length > 0;
  return JSON.stringify({
    ...emptyArchive(),
    ...(hasMeasurements ? { sites: [{ id: "site-1" }], meters: [{ id: "meter-1" }] } : {}),
    ...overrides,
  });
}

function assertInvalid(text, pattern) {
  assert.throws(
    () => parseEnergyArchive(text),
    (error) => error instanceof TypeError && pattern.test(error.message),
  );
}

test("creates an empty archive with all required collections", () => {
  const archive = parseEnergyArchive(createEnergyArchive());
  assert.equal(archive.format, ENERGY_ARCHIVE_FORMAT);
  assert.equal(archive.schemaVersion, ENERGY_ARCHIVE_SCHEMA_VERSION);
  assert.ok(Number.isFinite(Date.parse(archive.exportedAt)));
  for (const name of COLLECTIONS) assert.deepEqual(archive[name], []);
});

test("round-trips record data and preserves extra source fields", () => {
  const input = {
    exportedAt: "2026-10-20T12:00:00+05:30",
    sites: [{ id: "site-1", name: "Synthetic office" }],
    meters: [{ id: "meter-1", siteId: "site-1", name: "Synthetic meter" }],
    measurements: [measurement({ sourceMetadata: { adapter: "twin", sequence: 7 } })],
  };
  const parsed = parseEnergyArchive(createEnergyArchive(input));
  assert.equal(parsed.exportedAt, input.exportedAt);
  assert.deepEqual(parsed.sites, input.sites);
  assert.deepEqual(parsed.measurements, input.measurements);
});

test("accepts snake_case aliases for supported measurement fields", () => {
  const row = {
    event_id: "event-snake", site_id: "site-1", meter_id: "meter-1",
    schema_version: 1, measured_at: "2026-10-20T12:15:00+05:30",
    kind: "interval_energy", unit: "Wh", value: 500, quality: "valid",
    interval_start: "2026-10-20T12:00:00+05:30",
    interval_end: "2026-10-20T12:15:00+05:30",
  };
  assert.deepEqual(parseEnergyArchive(rawArchive({ measurements: [row] })).measurements, [row]);
});

test("rejects non-string input and malformed JSON", () => {
  assert.throws(() => parseEnergyArchive(null), /input must be JSON text/);
  assertInvalid("{", /document is not valid JSON/);
});

test("rejects a non-object root and unsupported format or schema version", () => {
  assertInvalid("[]", /root must be an object/);
  assertInvalid(rawArchive({ format: "other.format" }), /unsupported format identifier/);
  assertInvalid(rawArchive({ schemaVersion: 2 }), /unsupported schema version/);
});

test("requires an explicit and parseable export timezone", () => {
  assertInvalid(rawArchive({ exportedAt: "2026-10-20T12:00:00" }), /exportedAt must include an explicit timezone offset/);
  assertInvalid(rawArchive({ exportedAt: "not-a-dateZ" }), /exportedAt must include an explicit timezone offset/);
});

test("requires every collection to be an array of records", () => {
  const missing = emptyArchive();
  delete missing.meters;
  assertInvalid(JSON.stringify(missing), /meters must be an array/);
  assertInvalid(rawArchive({ sites: {} }), /sites must be an array/);
  assertInvalid(rawArchive({ sites: [null] }), /sites entries must be objects/);
  assertInvalid(rawArchive({ sites: ["site-1"] }), /sites entries must be objects/);
});

test("validates measurement identity fields and object shape", () => {
  assertInvalid(rawArchive({ measurements: [null] }), /measurements entries must be objects/);
  assertInvalid(rawArchive({ measurements: [{}] }), /measurements\[0\] event ID must be a non-empty string/);
  assertInvalid(rawArchive({ measurements: [measurement({ eventId: " " })] }), /event ID must be a non-empty string/);
  assertInvalid(rawArchive({ measurements: [measurement({ siteId: "" })] }), /site ID must be a non-empty string/);
  assertInvalid(rawArchive({ measurements: [measurement({ meterId: "" })] }), /meter ID must be a non-empty string/);
});

test("requires positive integer measurement schema versions", () => {
  assertInvalid(rawArchive({ measurements: [measurement({ schemaVersion: 0 })] }), /schema version must be a positive integer/);
  assertInvalid(rawArchive({ measurements: [measurement({ schemaVersion: 1.5 })] }), /schema version must be a positive integer/);
});

test("requires measurement timestamps with an explicit valid timezone", () => {
  assertInvalid(rawArchive({ measurements: [measurement({ measuredAt: "2026-10-20T12:15:00" })] }), /measuredAt must include an explicit timezone offset/);
  assertInvalid(rawArchive({ measurements: [measurement({ measuredAt: "2026-99-20T12:15:00Z" })] }), /measuredAt must include an explicit timezone offset/);
});

test("rejects unsupported kind, blank unit, and unsupported quality", () => {
  assertInvalid(rawArchive({ measurements: [measurement({ kind: "temperature" })] }), /unsupported measurement kind/);
  assertInvalid(rawArchive({ measurements: [measurement({ unit: " " })] }), /unit must be a non-empty string/);
  assertInvalid(rawArchive({ measurements: [measurement({ quality: "unknown" })] }), /unsupported quality/);
});

test("requires finite numeric measurement values", () => {
  assertInvalid(rawArchive({ measurements: [measurement({ value: "500" })] }), /value must be finite/);
  const overflow = rawArchive({ measurements: [measurement()] }).replace('"value":500', '"value":1e400');
  assertInvalid(overflow, /value must be finite/);
});

test("requires interval timestamps in increasing order", () => {
  assertInvalid(rawArchive({ measurements: [measurement({ intervalStart: "2026-10-20T12:00:00" })] }), /intervalStart must include an explicit timezone offset/);
  assertInvalid(rawArchive({ measurements: [measurement({ intervalStart: "2026-10-20T12:15:00Z" })] }), /intervalStart must be before intervalEnd/);
  assertInvalid(rawArchive({ measurements: [measurement({ intervalStart: "2026-10-20T12:20:00Z" })] }), /intervalStart must be before intervalEnd/);
});

test("collects all validation problems in one complete failure report", () => {
  const text = rawArchive({ measurements: [
    measurement({ value: "not numeric" }),
    measurement({ eventId: "event-2", measuredAt: "2026-10-20T12:15:00" }),
  ] });
  const report = inspectEnergyArchive(text);
  assert.equal(report.valid, false);
  assert.equal(report.archive, null);
  assert.ok(report.issues.some((issue) => /measurements\[0\] value must be finite/.test(issue)));
  assert.ok(report.issues.some((issue) => /measurements\[1\] measuredAt/.test(issue)));
  assert.deepEqual(report.counts.measurements, 2);
});

test("rejects duplicate record identifiers and dangling cross-record references", () => {
  const archive = emptyArchive();
  archive.sites = [{ id: "site-1" }, { id: "site-1" }];
  archive.meters = [{ id: "meter-1", siteId: "missing-site" }];
  archive.measurements = [measurement({ siteId: "missing-site" })];
  const report = inspectEnergyArchive(JSON.stringify(archive));
  assert.equal(report.valid, false);
  assert.ok(report.issues.some((issue) => /sites\[1\] duplicates identifier site-1/.test(issue)));
  assert.ok(report.issues.some((issue) => /meters\[0\] references unknown site missing-site/.test(issue)));
  assert.ok(report.issues.some((issue) => /measurements\[0\] references unknown site missing-site/.test(issue)));
  assert.throws(() => parseEnergyArchive(JSON.stringify(archive)), /duplicates identifier/);
});

test("enforces the 10 MiB UTF-8 limit while parsing and creating", () => {
  const oversizedText = JSON.stringify({ ...emptyArchive(), note: "x".repeat(MAX_ENERGY_ARCHIVE_BYTES + 1) });
  assert.throws(() => parseEnergyArchive(oversizedText), /exceeds the 10 MiB size limit/);
  assert.throws(
    () => createEnergyArchive({ sites: [{ description: "x".repeat(MAX_ENERGY_ARCHIVE_BYTES + 1) }] }),
    /exceeds the 10 MiB size limit/,
  );
});

test("rejects invalid creation options, circular rows, and invalid records", () => {
  assert.throws(() => createEnergyArchive(null), /creation options must be an object/);
  assert.throws(() => createEnergyArchive({ sites: {} }), /sites must be an array/);
  const circular = {};
  circular.self = circular;
  assert.throws(() => createEnergyArchive({ sites: [circular] }), /records must be JSON-serializable/);
  assert.throws(
    () => createEnergyArchive({ measurements: [measurement({ value: Number.NaN })] }),
    /value must be finite/,
  );
});
