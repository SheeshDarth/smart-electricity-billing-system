# Source adapter contract

Status: design contract for future source adapters. The repository currently contains a browser digital twin and a normalization module; it does not expose a production ingestion API or implement a live meter, gateway, DLMS/COSEM, OPC UA, MQTT, or vendor connector.

## Boundary and data flow

An adapter translates a source-specific record into a versioned measurement envelope. The shared ingestion path should authenticate the source, validate the envelope, deduplicate it, normalize units, preserve provenance, then publish accepted data or quarantine it with a reason. Site dashboards and cost calculations consume canonical records and must not contain vendor-specific parsing logic.

`src/domain/energyModel.mjs` currently implements only part of that path: schema-1 validation, unit normalization, batch event-ID deduplication, a cumulative-register delta helper, and interval-energy estimates. The twin calls those functions locally. There is no network endpoint, durable event queue, adapter registry, source authentication, cross-batch idempotency store, or telemetry persistence.

## Canonical envelope: schema version 1

| Field | Type | Meaning |
|---|---|---|
| `schemaVersion` | integer | Must be `1` in the current module. |
| `eventId` | non-empty string | Stable idempotency key for one source event. Preserve it across retries. |
| `siteId`, `meterId` | non-empty strings | Canonical site and meter identifiers known to the receiving organization. |
| `measuredAt` | timestamp string | When the source says the measurement was made. Use RFC 3339 with an explicit UTC offset; UTC `Z` is preferred. |
| `kind` | enum | One of `interval_energy`, `cumulative_energy`, `power`, `voltage`, or `current`. |
| `value` | finite number | Value in the declared unit. Never encode missing data as zero. |
| `unit` | enum | Energy: `Wh` or `kWh`; power: `W` or `kW`; voltage: `V`; current: `A`. |
| `quality` | enum | `valid`, `suspect`, or `invalid`. Only valid records enter the current estimate path. |
| `intervalStart`, `intervalEnd` | timestamp strings | Required for interval energy; end must be later than start. |

Recommended provenance fields include `sourceAdapter`, `sourceRecordRef`, source sequence number, source clock/offset, received-at timestamp, source version, and raw-payload reference. The module preserves extra fields but does not validate these recommended fields or guarantee raw-payload storage. A trusted server should assign `receivedAt`; do not trust a device clock for server receipt time.

### Example interval event

```json
{
  "schemaVersion": 1,
  "eventId": "meter-17:seq-98421",
  "siteId": "site-042",
  "meterId": "meter-17",
  "measuredAt": "2026-10-16T10:15:00Z",
  "kind": "interval_energy",
  "value": 500,
  "unit": "Wh",
  "quality": "valid",
  "intervalStart": "2026-10-16T10:00:00Z",
  "intervalEnd": "2026-10-16T10:15:00Z",
  "sourceAdapter": "buyer-owned-adapter",
  "sourceRecordRef": "batch-2026-10-16/98421"
}
```

Normalization returns `{ status, errors, value }` for a single measurement. A valid 500 Wh interval becomes 0.5 kWh while the original input remains unchanged. A suspect or invalid quality is quarantined; malformed structure or units are invalid. These are in-process return values, not HTTP response codes.

## Event semantics and safe ingestion requirements

- **Interval energy** is energy over explicit bounds. The current tariff estimate requires intervals to be contiguous and rejects gaps and overlaps.
- **Cumulative energy** is a register value at a point in time. Compute deltas from ordered readings. A decrease is a reset unless a known register maximum proves rollover; the helper supports this check but does not maintain history.
- **Power, voltage, and current** are separate measurement kinds. Do not convert instantaneous power into interval energy without a documented integration window and method.
- **Duplicates:** the helper keeps the first event with a given `eventId` in one input batch. A production receiver must also persist idempotency keys across requests, sites, and restarts, with a documented retention window and collision scope.
- **Out-of-order and late events:** retain source and receipt timestamps, define a bounded reorder policy, and recalculate affected summaries transparently. The current estimator sorts intervals but does not manage a stream or late-arrival watermark.
- **Gaps and bad quality:** quarantine or mark summaries incomplete. Never fill missing readings with zero or silently bill from incomplete data.
- **Identity and tenancy:** authenticate each source, bind its credential to allowed organization/site/meter IDs server-side, and reject client-supplied ownership changes. The browser must not hold a service-role credential.
- **Retry behavior:** use exponential backoff with jitter for transient failures, preserve the same event ID on retry, and send permanent schema/identity failures to a reviewable dead-letter path. Do not retry authorization or validation failures indefinitely.
- **Provenance:** retain enough information to trace a displayed value to its source, normalization, quality decision, and calculation/tariff version. Define retention and privacy rules before storing raw payloads.

## Adapter interface to implement

A future adapter should be an independently testable boundary with operations equivalent to:

1. **Configure** using buyer-owned secrets and explicit site/meter mapping.
2. **Read or receive** source records and preserve the raw source reference.
3. **Map** each source record to the schema-versioned envelope.
4. **Submit** a batch to the shared authenticated ingestion service with stable event IDs.
5. **Report** accepted, duplicate, quarantined, and rejected counts plus actionable errors, without logging credentials or sensitive payloads.

Keep transport-specific concerns (serial, file, HTTP, MQTT, OPC UA, DLMS/COSEM, or vendor SDK) outside the domain model. Select a protocol only for a validated buyer and supported equipment. Version adapter configuration and document its mapping, units, timestamp assumptions, retry behavior, and tested source versions.

## Readiness checklist for each real connector

- [ ] Supported source, model/version, site mapping, and data permissions are documented.
- [ ] Authentication, secret rotation, least privilege, TLS, and credential redaction are reviewed.
- [ ] Unit, interval/cumulative semantics, timestamp zone, clock drift, rollover, quality, and sequence behavior are verified against source documentation or captured samples.
- [ ] Duplicate, out-of-order, late, missing, malformed, reset, disconnect, reconnect, and replay cases have fixtures.
- [ ] Adapter output passes the canonical contract and cannot bypass tenant authorization or quality checks.
- [ ] Data volume, backpressure, replay, retention, export, and failure alerting have bounded operational behavior.
- [ ] Hardware-in-the-loop or vendor sandbox validation is completed where the source requires it.
- [ ] Claims name the tested connector and supported versions; no blanket interoperability claim is made.
