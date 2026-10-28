# Architecture and data contract

Status snapshot: 27 October 2026. This document distinguishes implemented prototype code from proposed production architecture. Nothing here implies a live meter deployment, hosted database migration, or utility-grade billing service.

## Product boundary

The first product hypothesis is electricity visibility and bill evidence for multi-site property or business operators. It should help a reviewer understand what readings were received, whether they are usable, what tariff assumptions produce an estimate, and how that estimate compares with a submitted bill. This buyer problem remains unvalidated. Home and office examples in the browser are synthetic; industrial content is demonstration material only. The rejected Schneider-linked concept is not a product requirement.

The first release should be read-only for physical data sources. It must not control relays, breakers, or machinery. Billing calculations remain deterministic and explainable. AI is optional future work, never the source of billed totals.

## Implementation status

| Capability | Current status |
|---|---|
| Browser portfolio and digital-twin scenarios | Synthetic demo; no live source |
| Measurement normalization and tariff estimates | Domain module with deterministic tests |
| Authentication, persistence, and tenant authorization | Not included | The current application is a local browser prototype; it has no backend or server-side authorization. |
| Versioned JSON energy archive | Local synthetic export and validated preview; duplicate IDs and known cross-record references are checked; no database persistence or transactional production import. |
| Authenticated ingestion API, persistent production dashboards, live meter adapters | Not implemented |
| Official utility invoices, payment processing, device control, AI inference | Not implemented |

## Data flow

The demo exercises a local synthetic source through the same measurement validation and deterministic estimate logic used by its domain utilities. A future source adapter must enter through a server-side authenticated ingestion boundary; it must never bypass schema, quality, or tenant checks.

```mermaid
flowchart LR
  SRC[Meter file, vendor feed, or digital twin] --> AD[Replaceable source adapter]
  AD --> ING[Versioned ingestion boundary]
  ING --> VAL[Schema, identity, timestamp, and unit validation]
  VAL --> Q{Quality outcome}
  Q -->|accepted| REC[Canonical reading record]
  Q -->|rejected or quarantined| ERR[Reasoned review queue]
  REC --> VIEW[Site and portfolio usage view]
  REC --> COST[Deterministic tariff estimate]
  BILL[Submitted utility bill] --> CMP[Bill comparison evidence]
  COST --> CMP
  VIEW --> CMP
  CMP --> HUM[Human review and notes]
  HUM --> EXP[Portable archive and audit trail]
```

## Canonical measurement envelope

The domain module describes energy data independently of a specific board or vendor. The core fields are:

- Organization, site, optional area/asset, meter, and optional adapter identifiers define hierarchy and ownership.
- Schema version, stable event ID, and optional source sequence/reference support reproducibility and duplicate detection.
- Measured-at is event time with an explicit offset; received-at is a separate server timestamp. The site timezone is configuration for display and tariff evaluation.
- Kind distinguishes interval energy, cumulative energy, power, voltage, and current. Bounds are required for interval-energy measurements.
- Value and unit retain physical meaning. Supported domain conversions currently include Wh/kWh, W/kW, V, and A.
- Quality is valid, suspect, invalid, or quarantined. Missing, stale, invalid, and incomplete readings must never be silently interpreted as zero.

The domain validator handles supported kinds/units, finite values, timestamps, duplicate IDs within one batch, and cumulative counter deltas. A decrease is quarantined unless a configured register maximum explains rollover. It does not provide durable cross-request idempotency, source authentication, a reorder buffer, or persistent raw-payload storage. The twin makes selected fault scenarios visible but does not prove the same behavior against hardware.

## Tariff estimate and bill comparison

Tariffs need currency, timezone, effective dates, billing period, and explicit charge components. The current deterministic estimator supports flat and time-of-use examples and returns a cost estimate with calculation details. It can split an interval across local-hour tariff boundaries and rejects gaps, overlaps, missing coverage, and incomplete expected interval sets. It is not a jurisdiction-ready invoice calculation.

A future bill comparison should preserve the uploaded or entered bill amount, bill period, source document reference, tariff version, reading window, calculated estimate, variance, and reviewer notes. It must label the result as a comparison or estimate, not an authoritative charge. Any document handling needs privacy, retention, access, and deletion rules before accepting real customer bills.

Production tariff work still requires customer-specific review of fixed and demand charges, taxes/fees, adjustments, net metering, meter multipliers, precision/rounding, timezones/daylight transitions, billing cutoffs, and correction workflows. AI must not change bill totals.

## Portable archive contract

The current utility exports and revalidates a JSON document with format identifier wattwise.energy-archive and schema version 1. It requires arrays for organizations, sites, areas, assets, meters, adapters, measurements, tariffs, billing runs, insights, and interventions. Measurement entries receive basic checks for identifiers, schema version, timestamp offset, kind, unit, finite value, quality, and interval bounds. The parser limits input to 10 MiB.

This is an early serialization boundary, not a complete interchange specification: entity-specific schemas and relationships are not fully checked; there is no import transaction, database mapping, migration path, cryptographic signature, or dedicated test suite yet. Before external use, document field semantics and compatibility policy, add round-trip and malformed-input tests, protect sensitive bill data, and decide how forward-compatible unknown fields are handled.

## Persistence and access boundary

The current application has no user accounts, database, server-side authorization, or persistent records. CSV readings, estimates, and review decisions remain in the browser session. The former account pages, database client, schema, migrations, and role-policy tests were removed from the active project.

Before a production pilot, select a buyer-approved backend and identity provider, define tenant and role boundaries, then implement and independently test every read and write path, migration/rollback, backup/restore, storage access, and owner recovery. The current UI must not be treated as proof of a secure multi-tenant service.

## Replaceability and longevity

Keep vendor transport, identity mapping, measurement normalization, tariff calculation, storage, and presentation behind stable interfaces. Preserve raw/source references alongside normalized values. Version schemas and migrations, publish an export contract, and test import/recovery. Add a new protocol only for identified equipment and validated buyer demand; DLMS/COSEM, OPC UA, MQTT, and vendor APIs are candidate options, not current features.

Monitoring, historical calculations, exports, and cost estimates should remain useful if an AI provider or cloud service is unavailable. Future AI can be evaluated behind a provider interface with model/runtime version, input window, uncertainty, measured accuracy, and rollback. No specific board, protocol, hosting provider, model family, or framework can credibly be guaranteed for 30–40 years.

## Security and operational limits

- The browser demo has no backend credentials or connected production service.
- A historical anonymous backend key remains in earlier public Git revisions; removing the integration from the current tree does not revoke that key or inspect/delete its hosted project. See [history scan](history-secret-scan.md).
- No physical control, payment processor, production invoice, or live adapter is connected.
- Real readings or bills require access controls, retention/deletion rules, encryption, audit logs, incident response, and customer-approved hosting before a pilot.
- The repository still needs history, checked-in-data, contributor ownership, dependency license, historical backend project, and transfer review before sale claims.
