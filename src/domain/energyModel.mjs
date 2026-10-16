const UNIT_SCALE = Object.freeze({ Wh: 0.001, kWh: 1, W: 1, kW: 1000, V: 1, A: 1 });
const TYPE_UNITS = Object.freeze({
  interval_energy: ["Wh", "kWh"],
  cumulative_energy: ["Wh", "kWh"],
  power: ["W", "kW"],
  voltage: ["V"],
  current: ["A"],
});
const CALCULATION_VERSION = "tariff-estimate-v2";
const OFFSET_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i;

function parseTimestamp(value) {
  if (typeof value !== "string" || !OFFSET_TIMESTAMP.test(value)) return NaN;
  return Date.parse(value);
}

function hasOwn(record, key) {
  return Object.prototype.hasOwnProperty.call(record, key);
}

export function normalizeMeasurement(input) {
  const errors = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { status: "invalid", errors: ["record must be an object"] };
  }

  if (typeof input.eventId !== "string" || !input.eventId.trim()) errors.push("eventId is required");
  if (typeof input.siteId !== "string" || !input.siteId.trim() || typeof input.meterId !== "string" || !input.meterId.trim()) {
    errors.push("siteId and meterId are required");
  }
  if (input.schemaVersion !== 1) errors.push("unsupported schemaVersion");
  if (!Number.isFinite(input.value)) errors.push("value must be finite");

  const supportedKind = typeof input.kind === "string" && hasOwn(TYPE_UNITS, input.kind);
  const supportedUnit = typeof input.unit === "string" && hasOwn(UNIT_SCALE, input.unit);
  if (!supportedKind) errors.push("unsupported measurement kind");
  if (!supportedUnit) errors.push("unsupported unit");
  if (supportedKind && supportedUnit && !TYPE_UNITS[input.kind].includes(input.unit)) {
    errors.push("unit does not match measurement kind");
  }
  if (!['valid', 'suspect', 'invalid'].includes(input.quality)) {
    errors.push("quality must be valid, suspect, or invalid");
  }

  const measuredAt = parseTimestamp(input.measuredAt);
  if (!Number.isFinite(measuredAt)) errors.push("measuredAt must be RFC 3339 with an explicit UTC offset");
  if (input.kind === "cumulative_energy" && Number.isFinite(input.value) && input.value < 0) {
    errors.push("cumulative register cannot be negative");
  }
  if (input.kind === "interval_energy") {
    const intervalStart = parseTimestamp(input.intervalStart);
    const intervalEnd = parseTimestamp(input.intervalEnd);
    if (!Number.isFinite(intervalStart) || !Number.isFinite(intervalEnd)) {
      errors.push("interval bounds must be RFC 3339 timestamps with an explicit UTC offset");
    } else if (intervalEnd <= intervalStart) {
      errors.push("intervalEnd must be after intervalStart");
    }
    if (Number.isFinite(input.value) && input.value < 0) errors.push("interval energy cannot be negative");
  }
  if (errors.length) return { status: "invalid", errors };

  const canonicalUnit = input.kind === "power"
    ? "W"
    : ["interval_energy", "cumulative_energy"].includes(input.kind)
      ? "kWh"
      : input.unit;
  const normalized = {
    ...input,
    sourceValue: input.value,
    sourceUnit: input.unit,
    value: input.value * UNIT_SCALE[input.unit],
    unit: canonicalUnit,
  };
  if (input.quality !== "valid") {
    return { status: "quarantined", errors: ["quality is not valid"], value: normalized };
  }
  return { status: "valid", errors: [], value: normalized };
}

export function deduplicateEvents(events) {
  const seen = new Set();
  const accepted = [];
  const duplicates = [];
  if (!Array.isArray(events)) {
    return { accepted, duplicates: [{ event: events, reason: "events must be an array" }] };
  }
  for (const event of events) {
    if (!event || typeof event.eventId !== "string" || !event.eventId.trim()) {
      duplicates.push({ event, reason: "missing eventId" });
      continue;
    }
    if (seen.has(event.eventId)) {
      duplicates.push({ event, reason: "duplicate eventId" });
      continue;
    }
    seen.add(event.eventId);
    accepted.push(event);
  }
  return { accepted, duplicates };
}

export function cumulativeDelta(previous, current, maxRegister = null) {
  if (!previous || !current || !Number.isFinite(previous.value) || !Number.isFinite(current.value)) {
    return { status: "quarantined", reason: "register values must be finite" };
  }
  const previousAt = parseTimestamp(previous.measuredAt);
  const currentAt = parseTimestamp(current.measuredAt);
  if (!Number.isFinite(previousAt) || !Number.isFinite(currentAt)) {
    return { status: "quarantined", reason: "register timestamps must include a valid UTC offset" };
  }
  if (currentAt <= previousAt) return { status: "quarantined", reason: "current reading is not later than previous reading" };
  if (previous.value < 0 || current.value < 0) return { status: "quarantined", reason: "register values cannot be negative" };
  if (current.value >= previous.value) return { status: "valid", delta: current.value - previous.value, rollover: false };
  if (Number.isFinite(maxRegister) && maxRegister >= previous.value && current.value >= 0) {
    return { status: "valid", delta: maxRegister - previous.value + 1 + current.value, rollover: true };
  }
  return { status: "quarantined", reason: "register decreased; reset or rollover is unverified" };
}

function periodCoversHour(period, hour) {
  return period.startHour < period.endHour
    ? hour >= period.startHour && hour < period.endHour
    : hour >= period.startHour || hour < period.endHour;
}

function localTimeParts(timestamp, formatter) {
  const parts = formatter.formatToParts(new Date(timestamp));
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
}

function nextLocalHourBoundary(timestamp, formatter) {
  const parts = localTimeParts(timestamp, formatter);
  const millisecond = timestamp % 1000;
  const elapsed = (60 - parts.minute) * 60_000 - parts.second * 1000 - millisecond;
  return timestamp + elapsed;
}

function getRateAt(timestamp, tariff, formatter) {
  if (!Array.isArray(tariff.timeOfUse) || tariff.timeOfUse.length === 0) return tariff.ratePerKwh;
  const { hour } = localTimeParts(timestamp, formatter);
  const period = tariff.timeOfUse.find((item) => periodCoversHour(item, hour));
  return period ? period.ratePerKwh : null;
}

function validateTariff(tariff) {
  if (!tariff || typeof tariff !== "object") return "tariff is required";
  if (typeof tariff.currency !== "string" || !/^[A-Z]{3}$/.test(tariff.currency)) return "tariff currency must be a three-letter code";
  if (typeof tariff.version !== "string" || !tariff.version.trim()) return "tariff version is required";
  if (typeof tariff.timezone !== "string" || !tariff.timezone.trim()) return "tariff timezone is required";

  const effectiveFrom = tariff.effectiveFrom ? parseTimestamp(tariff.effectiveFrom) : -Infinity;
  const effectiveTo = tariff.effectiveTo ? parseTimestamp(tariff.effectiveTo) : Infinity;
  if (Number.isNaN(effectiveFrom) || Number.isNaN(effectiveTo) || effectiveFrom >= effectiveTo) {
    return "tariff effective window is invalid";
  }

  if (tariff.timeOfUse !== undefined && !Array.isArray(tariff.timeOfUse)) return "time-of-use periods must be an array";
  const periods = Array.isArray(tariff.timeOfUse) ? tariff.timeOfUse : [];
  if (periods.length === 0 && (!Number.isFinite(tariff.ratePerKwh) || tariff.ratePerKwh < 0)) {
    return "tariff rate must be a finite non-negative number";
  }
  for (const period of periods) {
    if (!period || !Number.isInteger(period.startHour) || !Number.isInteger(period.endHour)
      || period.startHour < 0 || period.startHour > 23 || period.endHour < 0 || period.endHour > 23
      || period.startHour === period.endHour) {
      return "each time-of-use period needs distinct integer hours from 0 through 23";
    }
    if (!Number.isFinite(period.ratePerKwh) || period.ratePerKwh < 0) {
      return "each time-of-use rate must be a finite non-negative number";
    }
  }
  for (let hour = 0; hour < 24; hour += 1) {
    if (periods.filter((period) => periodCoversHour(period, hour)).length > 1) {
      return "time-of-use periods overlap";
    }
  }
  try {
    new Intl.DateTimeFormat("en-GB", {
      timeZone: tariff.timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
  } catch {
    return "tariff timezone is invalid";
  }
  return null;
}

export function estimateEnergyCost(readings, tariff, options = {}) {
  if (!Array.isArray(readings) || readings.length === 0) {
    return { status: "incomplete", reason: "no readings supplied" };
  }
  const tariffError = validateTariff(tariff);
  if (tariffError) return { status: "incomplete", reason: tariffError };

  const deduped = deduplicateEvents(readings);
  if (deduped.accepted.length === 0) {
    return { status: "incomplete", reason: "no events with a usable event ID", duplicatesIgnored: deduped.duplicates.length };
  }
  const normalized = deduped.accepted.map(normalizeMeasurement);
  if (normalized.some((item) => item.status !== "valid" || item.value.kind !== "interval_energy")) {
    return {
      status: "incomplete",
      reason: "one or more readings are invalid, quarantined, or not interval energy",
      duplicatesIgnored: deduped.duplicates.length,
    };
  }
  const intervals = normalized.map((item) => item.value)
    .sort((a, b) => parseTimestamp(a.intervalStart) - parseTimestamp(b.intervalStart));
  const effectiveFrom = tariff.effectiveFrom ? parseTimestamp(tariff.effectiveFrom) : -Infinity;
  const effectiveTo = tariff.effectiveTo ? parseTimestamp(tariff.effectiveTo) : Infinity;
  let hourFormatter;
  try {
    hourFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: tariff.timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
  } catch {
    return { status: "incomplete", reason: "tariff timezone is invalid", duplicatesIgnored: deduped.duplicates.length };
  }

  for (let index = 0; index < intervals.length; index += 1) {
    const item = intervals[index];
    const start = parseTimestamp(item.intervalStart);
    const end = parseTimestamp(item.intervalEnd);
    if (index > 0) {
      const previousEnd = parseTimestamp(intervals[index - 1].intervalEnd);
      if (start > previousEnd) {
        return { status: "incomplete", reason: "a gap exists between readings; missing energy is not treated as zero", duplicatesIgnored: deduped.duplicates.length };
      }
      if (start < previousEnd) {
        return { status: "incomplete", reason: "reading intervals overlap", duplicatesIgnored: deduped.duplicates.length };
      }
    }
    if (start < effectiveFrom || end > effectiveTo) {
      return { status: "incomplete", reason: "reading interval is outside the tariff effective window", duplicatesIgnored: deduped.duplicates.length };
    }
  }
  if (options.expectedIntervalCount !== undefined
    && (!Number.isInteger(options.expectedIntervalCount) || options.expectedIntervalCount < 0)) {
    return { status: "incomplete", reason: "expected interval count must be a non-negative integer", duplicatesIgnored: deduped.duplicates.length };
  }
  if (Number.isInteger(options.expectedIntervalCount) && intervals.length !== options.expectedIntervalCount) {
    return { status: "incomplete", reason: "expected interval count was not received", duplicatesIgnored: deduped.duplicates.length };
  }

  let total = 0;
  let energyKwh = 0;
  const breakdown = [];
  for (const interval of intervals) {
    const intervalStart = parseTimestamp(interval.intervalStart);
    const intervalEnd = parseTimestamp(interval.intervalEnd);
    const duration = intervalEnd - intervalStart;
    let cursor = intervalStart;
    while (cursor < intervalEnd) {
      const rate = getRateAt(cursor, tariff, hourFormatter);
      if (!Number.isFinite(rate)) {
        return { status: "incomplete", reason: "no tariff component covers an interval segment", duplicatesIgnored: deduped.duplicates.length };
      }
      const nextBoundary = tariff.timeOfUse?.length ? nextLocalHourBoundary(cursor, hourFormatter) : intervalEnd;
      const segmentEnd = Math.min(intervalEnd, nextBoundary);
      if (!Number.isFinite(segmentEnd) || segmentEnd <= cursor) {
        return { status: "incomplete", reason: "could not resolve a tariff-hour boundary", duplicatesIgnored: deduped.duplicates.length };
      }
      const segmentEnergy = interval.value * ((segmentEnd - cursor) / duration);
      const segmentCost = segmentEnergy * rate;
      breakdown.push({
        eventId: interval.eventId,
        start: new Date(cursor).toISOString(),
        end: new Date(segmentEnd).toISOString(),
        energyKwh: Math.round((segmentEnergy + Number.EPSILON) * 1_000_000) / 1_000_000,
        ratePerKwh: rate,
        cost: Math.round((segmentCost + Number.EPSILON) * 1_000_000) / 1_000_000,
      });
      energyKwh += segmentEnergy;
      total += segmentCost;
      cursor = segmentEnd;
    }
  }

  return {
    status: "estimated",
    total: Math.round((total + Number.EPSILON) * 100) / 100,
    energyKwh: Math.round((energyKwh + Number.EPSILON) * 1_000) / 1_000,
    currency: tariff.currency,
    tariffVersion: tariff.version,
    calculationVersion: CALCULATION_VERSION,
    duplicatesIgnored: deduped.duplicates.length,
    readingCount: intervals.length,
    breakdown,
    allocationAssumption: tariff.timeOfUse?.length
      ? "Energy in each interval is allocated by elapsed time at local-hour tariff boundaries."
      : "Flat tariff applied to validated interval energy.",
  };
}

export function runDigitalTwinScenario(scenario, meterId = "MTR-I-033", siteId = "plant") {
  const base = {
    schemaVersion: 1,
    siteId,
    meterId,
    kind: "interval_energy",
    unit: scenario === "invalid-unit" ? "W" : "Wh",
    quality: "valid",
    measuredAt: "2026-10-16T08:30:00Z",
    intervalStart: "2026-10-16T08:15:00Z",
    intervalEnd: "2026-10-16T08:30:00Z",
    sourceAdapter: "browser-digital-twin",
    sourceRecordRef: "twin://session-01",
  };
  const event = { ...base, eventId: "EVT-SIM-1038", value: scenario === "spike" ? 760 : 620 };
  if (scenario === "stale") {
    return { status: "stale", accepted: [], quarantined: [], duplicates: [], missingIsZero: false, tariffVersion: "IN-DEMO-1.4" };
  }
  if (scenario === "reset") {
    const delta = cumulativeDelta(
      { value: 8412.3, measuredAt: "2026-10-16T08:00:00Z" },
      { value: 1.7, measuredAt: "2026-10-16T08:15:00Z" },
    );
    return { status: "quarantined", accepted: [], quarantined: [delta], duplicates: [], missingIsZero: false, tariffVersion: "IN-DEMO-1.4" };
  }
  const batch = scenario === "duplicate" ? [event, { ...event }] : [event];
  const unique = deduplicateEvents(batch);
  const checked = unique.accepted.map(normalizeMeasurement);
  const quarantined = checked.filter((item) => item.status !== "valid");
  return {
    status: quarantined.length ? "quarantined" : unique.duplicates.length ? "deduplicated" : "valid",
    accepted: checked.filter((item) => item.status === "valid"),
    quarantined,
    duplicates: unique.duplicates,
    missingIsZero: false,
    tariffVersion: scenario === "tariff" ? "IN-DEMO-1.5" : "IN-DEMO-1.4",
  };
}
