export const ENERGY_ARCHIVE_FORMAT = "wattwise.energy-archive";
export const ENERGY_ARCHIVE_SCHEMA_VERSION = 1;
export const MAX_ENERGY_ARCHIVE_BYTES = 10 * 1024 * 1024;

const COLLECTIONS = ["organizations", "sites", "areas", "assets", "meters", "adapters", "measurements", "tariffs", "billingRuns", "insights", "interventions"];
const KINDS = new Set(["interval_energy", "cumulative_energy", "power", "voltage", "current"]);
const QUALITIES = new Set(["valid", "suspect", "invalid", "quarantined"]);
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function fail(message) {
  throw new TypeError("Invalid energy archive: " + message);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function field(record, camel, snake) {
  return record[camel] ?? record[snake];
}

function requireText(value, label) {
  if (typeof value !== "string" || value.trim() === "") fail(label + " must be a non-empty string");
}

function requireTimestamp(value, label) {
  if (typeof value !== "string" || !TIMESTAMP.test(value) || !Number.isFinite(Date.parse(value))) {
    fail(label + " must include an explicit timezone offset");
  }
  return Date.parse(value);
}

function validateMeasurement(row, index) {
  const label = "measurements[" + index + "]";
  if (!isRecord(row)) fail(label + " must be an object");
  requireText(field(row, "eventId", "event_id"), label + " event ID");
  requireText(field(row, "siteId", "site_id"), label + " site ID");
  requireText(field(row, "meterId", "meter_id"), label + " meter ID");
  const version = field(row, "schemaVersion", "schema_version");
  if (!Number.isInteger(version) || version < 1) fail(label + " schema version must be a positive integer");
  requireTimestamp(field(row, "measuredAt", "measured_at"), label + " measuredAt");
  if (!KINDS.has(row.kind)) fail(label + " has an unsupported measurement kind");
  requireText(row.unit, label + " unit");
  if (typeof row.value !== "number" || !Number.isFinite(row.value)) fail(label + " value must be finite");
  if (!QUALITIES.has(row.quality)) fail(label + " has an unsupported quality");
  if (row.kind === "interval_energy") {
    const start = requireTimestamp(field(row, "intervalStart", "interval_start"), label + " intervalStart");
    const end = requireTimestamp(field(row, "intervalEnd", "interval_end"), label + " intervalEnd");
    if (start >= end) fail(label + " intervalStart must be before intervalEnd");
  }
}

function validateArchive(value) {
  if (!isRecord(value)) fail("root must be an object");
  if (value.format !== ENERGY_ARCHIVE_FORMAT) fail("unsupported format identifier");
  if (value.schemaVersion !== ENERGY_ARCHIVE_SCHEMA_VERSION) fail("unsupported schema version");
  requireTimestamp(value.exportedAt, "exportedAt");
  for (const name of COLLECTIONS) {
    if (!Array.isArray(value[name])) fail(name + " must be an array");
    if (value[name].some((row) => !isRecord(row))) fail(name + " entries must be objects");
  }
  value.measurements.forEach(validateMeasurement);
  return value;
}

function checkSize(text) {
  if (new TextEncoder().encode(text).byteLength > MAX_ENERGY_ARCHIVE_BYTES) fail("document exceeds the 10 MiB size limit");
}

export function parseEnergyArchive(text) {
  if (typeof text !== "string") fail("input must be JSON text");
  checkSize(text);
  let value;
  try { value = JSON.parse(text); } catch { fail("document is not valid JSON"); }
  return validateArchive(value);
}

export function createEnergyArchive(input = {}) {
  if (!isRecord(input)) fail("creation options must be an object");
  const archive = { format: ENERGY_ARCHIVE_FORMAT, schemaVersion: ENERGY_ARCHIVE_SCHEMA_VERSION, exportedAt: input.exportedAt ?? new Date().toISOString() };
  for (const name of COLLECTIONS) {
    const rows = input[name] ?? [];
    if (!Array.isArray(rows)) fail(name + " must be an array");
    archive[name] = rows;
  }
  let text;
  try { text = JSON.stringify(archive, null, 2); } catch { fail("records must be JSON-serializable"); }
  if (typeof text !== "string") fail("could not serialize archive");
  checkSize(text);
  parseEnergyArchive(text);
  return text;
}
