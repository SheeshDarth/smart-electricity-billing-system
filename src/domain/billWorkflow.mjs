import { estimateEnergyCost, normalizeMeasurement } from "./energyModel.mjs";

export const MAX_ENERGY_CSV_BYTES = 5 * 1024 * 1024;
export const MAX_ENERGY_CSV_ROWS = 50_000;

const OFFSET_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i;
const ENERGY_UNITS = new Map([["wh", "Wh"], ["kwh", "kWh"]]);

function parseCsv(text) {
  if (typeof text !== "string") throw new TypeError("CSV input must be text");
  if (new TextEncoder().encode(text).byteLength > MAX_ENERGY_CSV_BYTES) {
    throw new TypeError("CSV file exceeds the 5 MiB limit");
  }

  const source = text.replace(/^\uFEFF/, "");
  const records = [];
  let record = [];
  let cell = "";
  let quoted = false;
  let quoteClosed = false;

  const pushCell = () => {
    record.push(cell);
    cell = "";
    quoteClosed = false;
  };
  const pushRecord = () => {
    pushCell();
    if (record.some((value) => value.trim() !== "")) records.push(record);
    record = [];
  };

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
          quoteClosed = true;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (quoteClosed && char !== "," && char !== "\r" && char !== "\n" && !/\s/.test(char)) {
      throw new TypeError("CSV contains characters after a closing quote");
    }
    if (char === '"' && cell.length === 0 && !quoteClosed) {
      quoted = true;
    } else if (char === ",") {
      pushCell();
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      pushRecord();
    } else if (!quoteClosed) {
      cell += char;
    }
  }

  if (quoted) throw new TypeError("CSV has an unterminated quoted field");
  if (cell.length > 0 || record.length > 0 || quoteClosed) pushRecord();
  if (records.length < 2) throw new TypeError("CSV needs a header and at least one data row");

  const headers = records[0].map((value) => value.trim());
  if (headers.some((value) => value === "")) throw new TypeError("CSV headers cannot be blank");
  const normalizedHeaders = headers.map((value) => value.toLocaleLowerCase());
  if (new Set(normalizedHeaders).size !== headers.length) {
    throw new TypeError("CSV headers must be unique");
  }
  if (records.length - 1 > MAX_ENERGY_CSV_ROWS) {
    throw new TypeError("CSV exceeds the 50,000 row limit");
  }

  return { headers, records: records.slice(1) };
}

function columnIndex(headers, name, required, label) {
  if (!name) {
    if (required) throw new TypeError("Choose a CSV column for " + label);
    return -1;
  }
  const index = headers.indexOf(name);
  if (index < 0 && required) throw new TypeError("The selected " + label + " column is unavailable");
  return index;
}

function parseExplicitTimestamp(value, label) {
  if (typeof value !== "string" || !OFFSET_TIMESTAMP.test(value.trim())) {
    throw new TypeError(label + " must include an explicit UTC offset, such as Z or +05:30");
  }
  const timestamp = Date.parse(value.trim());
  if (!Number.isFinite(timestamp)) throw new TypeError(label + " is not a valid timestamp");
  return new Date(timestamp).toISOString();
}

function parseNumber(value, label) {
  const trimmed = String(value ?? "").trim();
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) {
    throw new TypeError(label + " must be a non-negative decimal number without thousands separators");
  }
  const number = Number(trimmed);
  if (!Number.isFinite(number)) throw new TypeError(label + " must be finite");
  return number;
}

function rowError(rowNumber, message) {
  return { rowNumber, status: "rejected", reason: message, reading: null };
}

export function inspectEnergyCsv(text) {
  const table = parseCsv(text);
  return { headers: table.headers, dataRowCount: table.records.length };
}

export function suggestEnergyCsvMapping(headers) {
  const normalized = headers.map((header) => ({ header, key: header.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "") }));
  const find = (names) => normalized.find((entry) => names.includes(entry.key))?.header ?? "";
  return {
    timestamp: find(["timestamp", "measuredat", "datetime", "dateandtime", "time", "endtime"]),
    value: find(["value", "energy", "energykwh", "kwh", "consumption", "reading"]),
    meterId: find(["meterid", "meter", "meternumber", "deviceid"]),
    unit: find(["unit", "energyunit"]),
    intervalStart: find(["intervalstart", "starttime", "periodstart"]),
    eventId: find(["eventid", "recordid", "readingid"]),
  };
}

export function parseEnergyCsv(text, options = {}) {
  const { headers, records } = parseCsv(text);
  const mapping = options.mapping ?? {};
  const timestampIndex = columnIndex(headers, mapping.timestamp, true, "interval end timestamp");
  const valueIndex = columnIndex(headers, mapping.value, true, "energy value");
  const meterIndex = columnIndex(headers, mapping.meterId, false, "meter identifier");
  const unitIndex = columnIndex(headers, mapping.unit, false, "unit");
  const intervalStartIndex = columnIndex(headers, mapping.intervalStart, false, "interval start");
  const eventIdIndex = columnIndex(headers, mapping.eventId, false, "event identifier");
  const intervalMinutes = Number(options.intervalMinutes ?? 15);
  if (!Number.isInteger(intervalMinutes) || intervalMinutes < 1 || intervalMinutes > 1440) {
    throw new TypeError("Interval length must be a whole number from 1 to 1,440 minutes");
  }
  if (typeof options.siteId !== "string" || !options.siteId.trim()) {
    throw new TypeError("A site must be selected before importing readings");
  }
  const fallbackMeterId = String(options.fallbackMeterId ?? "").trim();
  const defaultUnit = ENERGY_UNITS.get(String(options.defaultUnit ?? "").toLocaleLowerCase());
  if (unitIndex < 0 && !defaultUnit) throw new TypeError("Choose a default energy unit");

  const rows = records.map((values, index) => {
    const rowNumber = index + 2;
    if (values.length > headers.length) return rowError(rowNumber, "Row has more values than the header");
    try {
      const timestamp = parseExplicitTimestamp(values[timestampIndex] ?? "", "Interval end timestamp");
      const measuredAt = timestamp;
      const meterId = meterIndex >= 0
        ? String(values[meterIndex] ?? "").trim()
        : fallbackMeterId;
      if (!meterId) throw new TypeError("Meter identifier is blank");
      const unitText = unitIndex >= 0 ? String(values[unitIndex] ?? "").trim() : "";
      const unit = unitIndex >= 0
        ? unitText ? ENERGY_UNITS.get(unitText.toLocaleLowerCase()) : undefined
        : defaultUnit;
      if (!unit) throw new TypeError("Energy unit must be Wh or kWh");
      const value = parseNumber(values[valueIndex], "Energy value");
      const intervalStart = intervalStartIndex >= 0
        ? parseExplicitTimestamp(values[intervalStartIndex] ?? "", "Interval start timestamp")
        : new Date(Date.parse(timestamp) - intervalMinutes * 60_000).toISOString();
      if (Date.parse(intervalStart) >= Date.parse(timestamp)) {
        throw new TypeError("Interval start must be earlier than interval end");
      }
      const suppliedEventId = eventIdIndex >= 0 ? String(values[eventIdIndex] ?? "").trim() : "";
      const eventId = suppliedEventId || "csv-row-" + rowNumber;
      const reading = {
        schemaVersion: 1,
        siteId: options.siteId,
        meterId,
        eventId,
        measuredAt,
        kind: "interval_energy",
        unit,
        value,
        quality: "valid",
        intervalStart,
        intervalEnd: timestamp,
        sourceAdapter: "local-csv-import",
        sourceRecordRef: "csv-row:" + rowNumber,
      };
      const normalized = normalizeMeasurement(reading);
      if (normalized.status !== "valid") {
        throw new TypeError(normalized.errors.join("; "));
      }
      return { rowNumber, status: "accepted", reason: "", reading: normalized.value };
    } catch (error) {
      return rowError(rowNumber, error instanceof Error ? error.message : "Row could not be parsed");
    }
  });

  const intervalGroups = new Map();
  for (const row of rows) {
    if (row.status !== "accepted") continue;
    const reading = row.reading;
    const key = [reading.meterId, reading.intervalStart, reading.intervalEnd].join("|");
    if (!intervalGroups.has(key)) intervalGroups.set(key, []);
    intervalGroups.get(key).push(row);
  }
  for (const group of intervalGroups.values()) {
    if (group.length < 2) continue;
    const firstValue = group[0].reading.value;
    if (group.every((row) => row.reading.value === firstValue)) {
      for (const duplicate of group.slice(1)) {
        duplicate.status = "duplicate";
        duplicate.reason = "Identical meter interval already appears earlier in this file";
      }
    } else {
      for (const conflict of group) {
        conflict.status = "rejected";
        conflict.reason = "Conflicting values were supplied for the same meter interval";
        conflict.reading = null;
      }
    }
  }

  const eventGroups = new Map();
  for (const row of rows) {
    if (row.status !== "accepted") continue;
    const eventId = row.reading.eventId;
    if (!eventGroups.has(eventId)) eventGroups.set(eventId, []);
    eventGroups.get(eventId).push(row);
  }
  for (const group of eventGroups.values()) {
    if (group.length < 2) continue;
    for (const conflict of group) {
      conflict.status = "rejected";
      conflict.reason = "Event identifier is reused for multiple readings";
      conflict.reading = null;
    }
  }

  const readings = rows.filter((row) => row.status === "accepted").map((row) => row.reading);
  const summary = {
    total: rows.length,
    accepted: rows.filter((row) => row.status === "accepted").length,
    duplicates: rows.filter((row) => row.status === "duplicate").length,
    rejected: rows.filter((row) => row.status === "rejected").length,
  };
  return { headers, rows, readings, summary };
}

export function createEnergyBill(readings, tariff, details = {}) {
  if (!Array.isArray(readings) || readings.length === 0) {
    throw new TypeError("At least one validated interval is required to generate an e-bill");
  }
  const meterIds = new Set(readings.map((reading) => reading.meterId));
  const siteIds = new Set(readings.map((reading) => reading.siteId));
  if (meterIds.size !== 1 || siteIds.size !== 1) {
    throw new TypeError("An e-bill can contain readings from one site and one meter only");
  }
  const estimate = estimateEnergyCost(readings, tariff);
  if (estimate.status !== "estimated") {
    throw new TypeError("E-bill withheld: " + (estimate.reason ?? "estimate is incomplete"));
  }

  const ordered = [...readings].sort((left, right) => Date.parse(left.intervalStart) - Date.parse(right.intervalStart));
  const generatedAt = details.generatedAt ?? new Date().toISOString();
  const confirmed = details.supplierPeriodConfirmed === true;
  let supplierBillAmount = null;
  if (confirmed && details.supplierBillAmount !== undefined && details.supplierBillAmount !== null && details.supplierBillAmount !== "") {
    supplierBillAmount = Number(details.supplierBillAmount);
    if (!Number.isFinite(supplierBillAmount) || supplierBillAmount < 0) {
      throw new TypeError("Supplier-stated bill amount must be a non-negative number");
    }
    supplierBillAmount = Math.round((supplierBillAmount + Number.EPSILON) * 100) / 100;
  }
  if (supplierBillAmount !== null && !confirmed) {
    throw new TypeError("Confirm that the supplier bill covers the same period before comparing amounts");
  }
  const duplicatesIgnored = Number(details.duplicatesIgnored ?? estimate.duplicatesIgnored);
  if (!Number.isInteger(duplicatesIgnored) || duplicatesIgnored < estimate.duplicatesIgnored) {
    throw new TypeError("Duplicate count must be a non-negative integer");
  }

  const billReference = details.billReference
    ?? "WB-" + generatedAt.replace(/[^0-9]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
  return {
    documentType: "wattwise-energy-estimate",
    documentVersion: 1,
    classification: details.classification ?? "user-uploaded-csv",
    billReference,
    generatedAt,
    siteName: String(details.siteName ?? "Energy site"),
    customerName: String(details.customerName ?? ""),
    meterId: ordered[0].meterId,
    periodStart: ordered[0].intervalStart,
    periodEnd: ordered[ordered.length - 1].intervalEnd,
    timezone: tariff.timezone,
    currency: estimate.currency,
    energyKwh: estimate.energyKwh,
    energyCharge: estimate.total,
    readingCount: estimate.readingCount,
    duplicatesIgnored,
    tariffVersion: estimate.tariffVersion,
    ratePerKwh: Number(tariff.ratePerKwh),
    calculationVersion: estimate.calculationVersion,
    allocationAssumption: estimate.allocationAssumption,
    supplierBillAmount,
    variance: supplierBillAmount === null ? null : Math.round((estimate.total - supplierBillAmount + Number.EPSILON) * 100) / 100,
    estimatedOnly: true,
    chargesExcluded: ["taxes", "fixed charges", "demand charges", "arrears", "export credits"],
  };
}
