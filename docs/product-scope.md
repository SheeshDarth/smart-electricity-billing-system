# Product scope: electricity visibility and bill evidence

Status: working recommendation, updated 27 October 2026. Buyer demand has not been validated through interviews or a live pilot. Three short research notes were sent to publicly listed property/facility operations business contacts; replies and interviews are pending. Implemented prototype behavior is separated from proposed scope.

## Product decision

Focus the next product on electricity data quality, transparent cost estimates, and bill review for a small organization managing several buildings or sites. Property operators and multi-site small businesses are the starting buyer hypothesis; validate the buyer before expanding scope.

The user journey: import readings, see which readings are trusted or missing, calculate an estimate from a versioned tariff, compare it with a supplier bill, investigate the difference, and record the reviewer outcome. Every total must show its evidence.

This is a narrower extension of the existing billing prototype than a broad energy-intelligence platform. It does not promise utility-grade billing, automatic savings, a particular hardware lifetime, or support for every meter and tariff.

## What exists today

- A browser demo with synthetic site and meter scenarios.
- Domain code validates measurement kinds and units, normalizes supported units, deduplicates event IDs, quarantines unproven cumulative-register resets, and rejects missing intervals instead of treating them as zero.
- Deterministic flat-rate and time-of-use estimates include tariff version, effective window, currency, timezone, and an interval breakdown.
- An additive Supabase schema covers organizations, sites, meters, readings, tariffs, billing runs, insights, and interventions. PR #8 CI passed the expanded role/table and cross-organization matrix, local migration, and database lint. No hosted database has been reviewed or migrated.
- A browser workflow and synthetic evidence snapshot. Legacy login/admin/user billing screens, bill document, and payment flag are not the new product workflow.
- The repository includes a versioned JSON archive with synthetic export and local whole-file validation summary. It checks IDs and known cross-record references and does not write imported records to the database.

All demo records and outcomes are synthetic. Passing local tests does not establish live support, tariff correctness, or production readiness.

## Required pilot capability set

| Capability | Minimum acceptance evidence | Current status |
|---|---|---|
| Organization, site, meter inventory | Navigate multiple sites and assign imports to a meter and timezone. | Relational schema foundation; no complete persisted workflow. |
| Reading import and source mapping | Preview CSV; map timestamp/value/unit/meter; validate before save; report accepted, duplicate, rejected, and missing rows; retain input reference. | Local CSV preview/estimate exists; it does not persist readings or retain cross-session records. |
| Data quality and provenance | Show measured time, source, conversion, quality, freshness, and quarantine reason; keep missing data missing. | Domain checks and synthetic workflow; no live monitoring. |
| Versioned tariff configuration | Store effective-dated tariff, currency, timezone, calculation version, and rounding with each estimate. | Flat and time-of-use logic exists; jurisdiction charges absent. |
| Cost estimate drill-down | Trace reading IDs, coverage, gaps, conversions, tariff components, and totals. | The e-bill UI shows coverage, accepted interval count, energy total, flat rate, and calculated charge; per-row cost drill-down and persistence remain incomplete. |
| Supplier bill comparison | Enter a supplier-stated amount and period; show usage and cost variance with coverage, without claiming diagnosis. | A local manual amount and estimate-minus-stated-total variance are included only after same-period confirmation. Document parsing and persistent reconciliation history are not implemented. |
| Exception review and audit trail | Reviewer records status, note, actor, and timestamp for each data or bill exception. | Synthetic intervention story/schema only. |
| Tenant and role boundaries | Test allowed and denied table access by role and tenant, including cross-organization writes and membership changes. | Expanded pgTAP matrix passed in PR #8 CI against disposable organizations. |
| Portable data | Parse/export an archive preserving IDs, timestamps, units, quality, tariff versions, and provenance. | Synthetic archive export and local validation/round-trip download exist; no database export/import. |
| Estimate and bill semantics | Label estimates, supplier amounts, and authoritative charges distinctly. | Demo estimate labeled; legacy payment flow unsuitable. |

## Proposed build order

### P0 — Secure and repeatable foundation

1. Keep a modular application; do not split into microservices until workload or team ownership requires it.
2. Keep the digital twin as a deterministic demo source. Route future imports and adapters through the same canonical measurement contract.
3. Require Node lint, type-check, domain tests, build, local migration, database lint, and pgTAP in pull-request CI.
4. Implement the versioned archive contract now; add a buyer-facing export/import flow with round-trip verification later.
5. Keep legacy tables and routes isolated, or migrate them as a separately reviewed task. Do not imply they use the new schema.

### P1 — First buyer-evaluable workflow

1. Add CSV import with dry-run preview, reusable source mapping, timezone/unit selection, duplicate handling, and row-level errors.
2. Persist source reference, original and normalized values/units, quality, received time, and schema version. Never archive secrets.
3. Build a site timeline for usage, freshness, missing intervals, invalid readings, and estimates from the same stored readings.
4. Configure flat and time-of-use tariffs. Keep tax, demand, fixed, export, and netting charges disabled until reviewed for the pilot jurisdiction.
5. Let a reviewer enter or import a supplier bill total and period. Present variance as reconciliation aid, not an official bill or payment request.
6. Add an exception queue for stale sources, missing intervals, unusual changes, estimate/bill variance, and invalid rows. Show evidence and preserve unknown cause.
7. Record review status, notes, actor, timestamp, and correction events. Do not silently alter source readings or control equipment.
8. Seed normal bill, missing interval, tariff change, duplicate import, and unexplained variance walkthroughs using synthetic data.

### P2 — Pilot-specific integration and operations

1. Select one real source only after a buyer supplies sample exports, meter details, access approval, and expected cadence. Implement only that adapter.
2. Add authenticated ingestion, replay-safe IDs, payload limits, timestamp bounds, retries, and observability before live streams.
3. Define buyer-owned deployment, backup/restore, retention, export/deletion, incident response, and data access procedures before customer data.
4. Expand RLS to a role-by-tenant CRUD matrix and check upgrades/rollback in a disposable environment; local CI is not a hosted security audit.
5. Validate tariffs with the buyer or responsible utility: effective dates, taxes, fees, meter multipliers, netting, daylight changes, and rounding.

### Later options only after evidence

- Add meter standards, vendor APIs, gateways, solar/storage sources, forecasts, or benchmarks only for a validated buyer and accessible data.
- Prefer rules-based alerts first. Measure false alerts and misses using human-reviewed cases before marketing anomaly detection.
- Add optional model inference only if it improves a measured operator decision. CPU, hosted, edge, or GPU is an implementation choice; estimates must work with AI off.

## Explicitly outside the first pilot

- Utility AMI/DISCOM replacement, meter certification, legal compliance claims, or every-jurisdiction tariff coverage.
- Payment collection, balances, payment processing, or payable invoices. The legacy payment flag is not payment processing.
- Physical switching, relay/breaker control, or autonomous equipment changes.
- A board as a product dependency, including ESP32. Hardware is a replaceable source choice for a later integration.
- Industrial energy-per-unit/productivity analysis until a separate buyer validates it and supplies trusted process context.
- AI/LLM/GPU as a selling point. This release has no trained model or validated AI outcomes.

## Workflow and visual demo

```mermaid
flowchart LR
  A[CSV export or simulated source] --> B[Column mapping and preview]
  B --> C[Schema, unit, timestamp, duplicate checks]
  C --> D[Canonical readings with quality and provenance]
  D --> E[Versioned tariff estimate]
  E --> F[Supplier bill comparison]
  F --> G[Exception review queue]
  G --> H[Human decision and audit note]
  H --> I[Portable evidence export]
```

Show inputs and outcomes at every stage. Scenario controls should include duplicate, invalid unit, counter reset, stale source, missing interval, and tariff change. A simulated action stays labeled as simulated. This is an application workflow, not a circuit diagram or a claim of deployed equipment.

## Pilot metrics

| Metric | Definition and purpose |
|---|---|
| Time to first trusted estimate | Time and human effort from sample file receipt to estimate with visible quality status; measures onboarding friction. |
| Interval completeness | Valid expected intervals divided by expected intervals; report unknown cadence separately. |
| Data freshness | Received time minus measured time by source and period. |
| Quarantine and duplicate rates | Counts and rates with reasons by source; reveals mapping and source issues. |
| Estimate-to-bill variance | Difference from supplier-stated amount/usage, displayed with coverage and tariff version. |
| Review usefulness | Reviewed exceptions marked useful, false alarm, already known, or unresolved; informs alert design. |
| Export recoverability | Whether a second environment parses the archive and reproduces records and calculation inputs. |

Do not set public targets before a pilot baseline. Do not report savings from synthetic or unmatched periods.

## Blockers and controls

| Blocker | Next action |
|---|---|
| Buyer and willingness to pay unvalidated | Interview likely multi-site property or business operators; select one buyer. |
| No live ingestion | Build CSV mapping first using customer-owned sample exports. |
| Legacy screens assume an older Supabase schema | Isolate and label them, or make migration/removal a separate decision. |
| Tariffs incomplete for real jurisdictions | Label outputs estimates, version inputs, and get domain review before paid use. |
| Current RLS writes tested representatively | Complete CRUD role/tenant matrix and upgrade/rollback checks. |
| Archive not connected to UI/database | Add dry-run, counts, integrity checks, and restore verification before customer migration. |
| No support, backups, or production deployment process | Define one buyer-owned pilot environment and ownership before onboarding. |
| Product claims can exceed evidence | Date claims and mark capabilities implemented, planned, or untested. |

## Longevity guardrails

- Preserve canonical, versioned records and stable IDs; store measured time in UTC and site timezone separately.
- Distinguish original from normalized values; version tariffs and calculations; make transformations explainable.
- Put each meter/vendor behind a replaceable adapter; add a standard only for a proven source requirement.
- Keep identity, site configuration, bills, and reviews relational; choose time-series storage or partitioning only after measuring workload.
- Keep inference optional and removable without breaking readings, exports, or deterministic costs.
- Treat formats, migrations, exports, backups, and restore procedures as durable contracts. Do not promise any board, protocol, cloud, model, or framework lasts 30–40 years.

## Competitive context

Public product documentation already describes energy charts, alerts, billing rules, integrations, and multi-site monitoring. The differentiation hypothesis is lower-friction movement from mixed source files to a trustworthy estimate and reviewable explanation of bill differences. This is not a proven moat; see [market landscape](market-landscape.md) and validate through interviews.
