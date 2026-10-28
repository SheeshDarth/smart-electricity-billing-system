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

function validateMeasurement(row, index, issues) {
  const label = "measurements[" + index + "]";
  if (!isRecord(row)) { issues.push(label + " must be an object"); return; }
  const checkText = (value, name) => {
    if (typeof value !== "string" || value.trim() === "") issues.push(label + " " + name + " must be a non-empty string");
  };
  checkText(field(row, "eventId", "event_id"), "event ID");
  checkText(field(row, "siteId", "site_id"), "site ID");
  checkText(field(row, "meterId", "meter_id"), "meter ID");
  const version = field(row, "schemaVersion", "schema_version");
  if (!Number.isInteger(version) || version < 1) issues.push(label + " schema version must be a positive integer");
  if (!timestampValid(field(row, "measuredAt", "measured_at"))) issues.push(label + " measuredAt must include an explicit timezone offset");
  if (!KINDS.has(row.kind)) issues.push(label + " has an unsupported measurement kind");
  checkText(row.unit, "unit");
  if (typeof row.value !== "number" || !Number.isFinite(row.value)) issues.push(label + " value must be finite");
  if (!QUALITIES.has(row.quality)) issues.push(label + " has an unsupported quality");
  if (row.kind === "interval_energy") {
    const start = timestampValue(field(row, "intervalStart", "interval_start"));
    const end = timestampValue(field(row, "intervalEnd", "interval_end"));
    if (!Number.isFinite(start)) issues.push(label + " intervalStart must include an explicit timezone offset");
    if (!Number.isFinite(end)) issues.push(label + " intervalEnd must include an explicit timezone offset");
    if (Number.isFinite(start) && Number.isFinite(end) && start >= end) issues.push(label + " intervalStart must be before intervalEnd");
  }
}

function timestampValue(value) {
  return typeof value === "string" && TIMESTAMP.test(value) && Number.isFinite(Date.parse(value)) ? Date.parse(value) : NaN;
}

function timestampValid(value) {
  return Number.isFinite(timestampValue(value));
}

function validateReferences(value, issues) {
  const ids = Object.fromEntries(COLLECTIONS.map((name) => [name, new Set()]));
  for (const name of COLLECTIONS) {
    if (!Array.isArray(value[name])) continue;
    value[name].forEach((row, index) => {
      if (!isRecord(row)) return;
      const id = name === "measurements" ? field(row, "eventId", "event_id") : row.id;
      if (typeof id !== "string" || !id.trim()) {
        issues.push(name + "[" + index + "] " + (name === "measurements" ? "event ID" : "id") + " must be a non-empty string");
      } else if (ids[name].has(id)) {
        issues.push(name + "[" + index + "] duplicates identifier " + id);
      } else ids[name].add(id);
    });
  }

  const refs = [
    ["sites", "organizationId", "organization_id", "organizations", "organization"],
    ["areas", "organizationId", "organization_id", "organizations", "organization"],
    ["areas", "siteId", "site_id", "sites", "site"],
    ["assets", "organizationId", "organization_id", "organizations", "organization"],
    ["assets", "siteId", "site_id", "sites", "site"],
    ["assets", "areaId", "area_id", "areas", "area"],
    ["meters", "organizationId", "organization_id", "organizations", "organization"],
    ["meters", "siteId", "site_id", "sites", "site"],
    ["meters", "assetId", "asset_id", "assets", "asset"],
    ["adapters", "organizationId", "organization_id", "organizations", "organization"],
    ["adapters", "siteId", "site_id", "sites", "site"],
    ["adapters", "meterId", "meter_id", "meters", "meter"],
    ["measurements", "siteId", "site_id", "sites", "site"],
    ["measurements", "meterId", "meter_id", "meters", "meter"],
    ["measurements", "adapterId", "adapter_id", "adapters", "adapter"],
    ["tariffs", "organizationId", "organization_id", "organizations", "organization"],
    ["tariffs", "siteId", "site_id", "sites", "site"],
    ["billingRuns", "organizationId", "organization_id", "organizations", "organization"],
    ["billingRuns", "siteId", "site_id", "sites", "site"],
    ["billingRuns", "tariffId", "tariff_id", "tariffs", "tariff"],
    ["insights", "organizationId", "organization_id", "organizations", "organization"],
    ["insights", "siteId", "site_id", "sites", "site"],
    ["interventions", "organizationId", "organization_id", "organizations", "organization"],
    ["interventions", "siteId", "site_id", "sites", "site"],
    ["interventions", "insightId", "insight_id", "insights", "insight"],
  ];
  for (const [collection, camel, snake, target, label] of refs) {
    if (!Array.isArray(value[collection])) continue;
    value[collection].forEach((row, index) => {
      if (!isRecord(row)) return;
      const reference = field(row, camel, snake);
      if (reference !== undefined && reference !== null && !ids[target].has(reference)) {
        issues.push(collection + "[" + index + "] references unknown " + label + " " + reference);
      }
    });
  }
}

function validateArchive(value, issues) {
  if (!isRecord(value)) { issues.push("root must be an object"); return; }
  if (value.format !== ENERGY_ARCHIVE_FORMAT) issues.push("unsupported format identifier");
  if (value.schemaVersion !== ENERGY_ARCHIVE_SCHEMA_VERSION) issues.push("unsupported schema version");
  if (!timestampValid(value.exportedAt)) issues.push("exportedAt must include an explicit timezone offset");
  for (const name of COLLECTIONS) {
    if (!Array.isArray(value[name])) {
      issues.push(name + " must be an array");
      continue;
    }
    value[name].forEach((row, index) => {
      if (!isRecord(row)) issues.push(name + " entries must be objects (" + name + "[" + index + "] must be an object)");
    });
  }
  if (Array.isArray(value.measurements)) value.measurements.forEach((row, index) => validateMeasurement(row, index, issues));
  validateReferences(value, issues);
}

function checkSize(text) {
  if (new TextEncoder().encode(text).byteLength > MAX_ENERGY_ARCHIVE_BYTES) fail("document exceeds the 10 MiB size limit");
}

export function inspectEnergyArchive(text) {
  const issues = [];
  if (typeof text !== "string") return { valid: false, issues: ["input must be JSON text"], counts: null };
  if (new TextEncoder().encode(text).byteLength > MAX_ENERGY_ARCHIVE_BYTES) {
    return { valid: false, issues: ["document exceeds the 10 MiB size limit"], counts: null };
  }
  let value;
  try { value = JSON.parse(text); } catch {
    return { valid: false, issues: ["document is not valid JSON"], counts: null };
  }
  validateArchive(value, issues);
  const counts = isRecord(value) ? Object.fromEntries(COLLECTIONS.map((name) => [name, Array.isArray(value[name]) ? value[name].length : null])) : null;
  return { valid: issues.length === 0, issues, counts, archive: issues.length === 0 ? value : null };
}

export function parseEnergyArchive(text) {
  const result = inspectEnergyArchive(text);
  if (!result.valid) fail(result.issues[0] ?? "validation failed");
  return result.archive;
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
