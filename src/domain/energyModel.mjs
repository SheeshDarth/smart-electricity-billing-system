const UNIT_SCALE = { Wh: 0.001, kWh: 1, W: 1, kW: 1000, V: 1, A: 1 };
const TYPE_UNITS = {
  interval_energy: ["Wh", "kWh"],
  cumulative_energy: ["Wh", "kWh"],
  power: ["W", "kW"],
  voltage: ["V"],
  current: ["A"],
};
const CALCULATION_VERSION = "flat-estimate-v1";

export function normalizeMeasurement(input) {
  const errors = [];
  if (!input || typeof input !== "object") return { status: "invalid", errors: ["record must be an object"] };
  if (!input.eventId || typeof input.eventId !== "string") errors.push("eventId is required");
  if (!input.siteId || !input.meterId) errors.push("siteId and meterId are required");
  if (input.schemaVersion !== 1) errors.push("unsupported schemaVersion");
  if (!Number.isFinite(input.value)) errors.push("value must be finite");
  if (!(input.kind in TYPE_UNITS)) errors.push("unsupported measurement kind");
  if (!(input.unit in UNIT_SCALE)) errors.push("unsupported unit");
  if (input.kind in TYPE_UNITS && !TYPE_UNITS[input.kind].includes(input.unit)) errors.push("unit does not match measurement kind");
  if (!input.quality || !["valid", "suspect", "invalid"].includes(input.quality)) errors.push("quality must be valid, suspect, or invalid");
  if (!Number.isFinite(Date.parse(input.measuredAt))) errors.push("measuredAt must be a valid timestamp");
  if (input.kind === "cumulative_energy" && input.value < 0) errors.push("cumulative register cannot be negative");
  if (input.kind === "interval_energy" && (!Number.isFinite(Date.parse(input.intervalStart)) || !Number.isFinite(Date.parse(input.intervalEnd)))) errors.push("interval bounds are required");
  if (input.kind === "interval_energy" && Date.parse(input.intervalEnd) <= Date.parse(input.intervalStart)) errors.push("intervalEnd must be after intervalStart");
  if (errors.length) return { status: "invalid", errors };
  const normalized = { ...input, value: input.value * UNIT_SCALE[input.unit], unit: input.kind === "power" ? "W" : ["interval_energy", "cumulative_energy"].includes(input.kind) ? "kWh" : input.unit };
  if (input.quality !== "valid") return { status: "quarantined", errors: ["quality is not valid"], value: normalized };
  return { status: "valid", errors: [], value: normalized };
}

export function deduplicateEvents(events) {
  const seen = new Set();
  const accepted = [];
  const duplicates = [];
  for (const event of events) {
    if (!event || !event.eventId) { duplicates.push({ event, reason: "missing eventId" }); continue; }
    if (seen.has(event.eventId)) { duplicates.push({ event, reason: "duplicate eventId" }); continue; }
    seen.add(event.eventId);
    accepted.push(event);
  }
  return { accepted, duplicates };
}

export function cumulativeDelta(previous, current, maxRegister = null) {
  if (!Number.isFinite(previous.value) || !Number.isFinite(current.value)) return { status: "quarantined", reason: "register values must be finite" };
  if (Date.parse(current.measuredAt) <= Date.parse(previous.measuredAt)) return { status: "quarantined", reason: "current reading is not later than previous reading" };
  if (current.value >= previous.value) return { status: "valid", delta: current.value - previous.value, rollover: false };
  if (Number.isFinite(maxRegister) && maxRegister >= previous.value && current.value >= 0) {
    return { status: "valid", delta: maxRegister - previous.value + 1 + current.value, rollover: true };
  }
  return { status: "quarantined", reason: "register decreased; reset or rollover is unverified" };
}

function getRate(interval, tariff, hourFormatter) {
  if (!Array.isArray(tariff.timeOfUse) || tariff.timeOfUse.length === 0) return tariff.ratePerKwh;
  const hour = Number(hourFormatter.format(new Date(interval.intervalStart)));
  const period = tariff.timeOfUse.find((item) => item.startHour < item.endHour ? hour >= item.startHour && hour < item.endHour : hour >= item.startHour || hour < item.endHour);
  return period ? period.ratePerKwh : null;
}

export function estimateEnergyCost(readings, tariff, options = {}) {
  if (!Array.isArray(readings) || readings.length === 0) return { status: "incomplete", reason: "no readings supplied" };
  if (!tariff || !tariff.currency || !tariff.version || !tariff.timezone) return { status: "incomplete", reason: "tariff identity, currency, version, and timezone are required" };
  const deduped = deduplicateEvents(readings);
  const normalized = deduped.accepted.map(normalizeMeasurement);
  if (normalized.some((item) => item.status !== "valid" || item.value.kind !== "interval_energy")) return { status: "incomplete", reason: "one or more readings are invalid, quarantined, or not interval energy", duplicatesIgnored: deduped.duplicates.length };
  const intervals = normalized.map((item) => item.value).sort((a, b) => Date.parse(a.intervalStart) - Date.parse(b.intervalStart));
  const effectiveFrom = tariff.effectiveFrom ? Date.parse(tariff.effectiveFrom) : -Infinity;
  const effectiveTo = tariff.effectiveTo ? Date.parse(tariff.effectiveTo) : Infinity;
  const usesTimeOfUse = Array.isArray(tariff.timeOfUse) && tariff.timeOfUse.length > 0;
  let hourFormatter = null;
  if (usesTimeOfUse) {
    try {
      hourFormatter = new Intl.DateTimeFormat("en-GB", { timeZone: tariff.timezone, hour: "2-digit", hourCycle: "h23" });
    } catch {
      return { status: "incomplete", reason: "tariff timezone is invalid", duplicatesIgnored: deduped.duplicates.length };
    }
  }
  for (let index = 0; index < intervals.length; index += 1) {
    const item = intervals[index];
    const start = Date.parse(item.intervalStart);
    const end = Date.parse(item.intervalEnd);
    if (index > 0) {
      const previousEnd = Date.parse(intervals[index - 1].intervalEnd);
      if (start > previousEnd) return { status: "incomplete", reason: "a gap exists between readings; missing energy is not treated as zero", duplicatesIgnored: deduped.duplicates.length };
      if (start < previousEnd) return { status: "incomplete", reason: "reading intervals overlap", duplicatesIgnored: deduped.duplicates.length };
    }
    if (start < effectiveFrom || end > effectiveTo) return { status: "incomplete", reason: "reading interval is outside the tariff effective window", duplicatesIgnored: deduped.duplicates.length };
  }
  if (Number.isFinite(options.expectedIntervalCount) && intervals.length !== options.expectedIntervalCount) return { status: "incomplete", reason: "expected interval count was not received", duplicatesIgnored: deduped.duplicates.length };
  if (!Number.isFinite(tariff.ratePerKwh) && !usesTimeOfUse) return { status: "incomplete", reason: "tariff rate is missing" };
  let total = 0;
  let energyKwh = 0;
  for (const interval of intervals) {
    const rate = getRate(interval, tariff, hourFormatter);
    if (!Number.isFinite(rate)) return { status: "incomplete", reason: "no tariff component covers an interval", duplicatesIgnored: deduped.duplicates.length };
    energyKwh += interval.value;
    total += interval.value * rate;
  }
  return { status: "estimated", total: Math.round((total + Number.EPSILON) * 100) / 100, energyKwh: Math.round((energyKwh + Number.EPSILON) * 1000) / 1000, currency: tariff.currency, tariffVersion: tariff.version, calculationVersion: CALCULATION_VERSION, duplicatesIgnored: deduped.duplicates.length, readingCount: intervals.length };
}

export function runDigitalTwinScenario(scenario, meterId = "MTR-I-033", siteId = "plant") {
  const base = { schemaVersion: 1, siteId, meterId, kind: "interval_energy", unit: "Wh", quality: "valid", measuredAt: "2026-10-16T08:30:00Z", intervalStart: "2026-10-16T08:15:00Z", intervalEnd: "2026-10-16T08:30:00Z", sourceAdapter: "browser-digital-twin", sourceRecordRef: "twin://session-01" };
  const event = { ...base, eventId: "EVT-SIM-1038", value: scenario === "spike" ? 760 : 620 };
  if (scenario === "stale") return { status: "stale", accepted: [], quarantined: [], duplicates: [], missingIsZero: false, tariffVersion: "IN-DEMO-1.4" };
  if (scenario === "reset") {
    const delta = cumulativeDelta({ value: 8412.3, measuredAt: "2026-10-16T08:00:00Z" }, { value: 1.7, measuredAt: "2026-10-16T08:15:00Z" });
    return { status: "quarantined", accepted: [], quarantined: [delta], duplicates: [], missingIsZero: false, tariffVersion: "IN-DEMO-1.4" };
  }
  const batch = scenario === "duplicate" ? [event, { ...event }] : [event];
  const unique = deduplicateEvents(batch);
  const checked = unique.accepted.map(normalizeMeasurement);
  const quarantined = checked.filter((item) => item.status !== "valid");
  return { status: quarantined.length ? "quarantined" : unique.duplicates.length ? "deduplicated" : "valid", accepted: checked.filter((item) => item.status === "valid"), quarantined, duplicates: unique.duplicates, missingIsZero: false, tariffVersion: scenario === "tariff" ? "IN-DEMO-1.5" : "IN-DEMO-1.4" };
}
