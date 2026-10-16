# Architecture and data contract

Date: 16 October 2026. This document separates code that exists on the feature branch from future architecture. It does not claim that a production ingestion service or live device connector has been deployed.

## Current implementation status

| Capability | Status in this branch |
|---|---|
| Browser digital twin for home, office, and industrial profiles | Implemented with synthetic records |
| Spike, stale source, duplicate event, counter reset, and tariff scenarios | Implemented in the twin; duplicate and reset pass through canonical validation functions |
| Interval/cumulative distinction, unit normalization, duplicate suppression, reset quarantine, flat/TOU cost estimate | Implemented in src/domain/energyModel.mjs with deterministic tests |
| Cross-sector relational schema and tenant role policies | Migration drafted; not applied to any hosted project and not yet validated against a live Supabase instance |
| Real meter/gateway adapters, authenticated ingestion API, production dashboard persistence | Not implemented |
| AI inference, causal attribution, machine control, official utility billing or payments | Not implemented |

## Architecture direction

The browser twin is the first source implementation. Future protocol adapters should feed the same versioned event contract and validation logic rather than creating per-device dashboard or billing code paths.

~~~mermaid
flowchart LR
  subgraph Implemented now
    T[Browser digital twin] --> V[Canonical validation module]
    V --> Q[Quality and deduplication outcome]
    Q --> D[Portfolio and site demo]
    D --> E[Explainable rule and tariff estimate]
    E --> H[Human review decision]
    H --> S[Simulated verification]
  end
  subgraph Future adapters and services
    DL[DLMS or vendor adapter] -. planned .-> API[Versioned ingestion API]
    OPC[OPC UA or site connector] -. planned .-> API
    MQTT[Other authenticated source] -. planned .-> API
    API -. planned .-> V2[Server-side quality gate]
    V2 -. planned .-> DB[(Portable canonical store)]
    DB -. planned .-> PORT[Portfolio and history views]
    DB -. planned .-> BILL[Deterministic tariff engine]
    DB -. optional .-> AI[Replaceable inference provider]
    PORT --> EVT[Evidence and intervention record]
    BILL --> EVT
    AI --> EVT
    EVT --> H2[Human approval]
    H2 --> MV[Matched before/after measurement]
    MV --> EVT
  end
~~~

DLMS/COSEM and OPC UA are candidate integration boundaries, not implemented integrations. Hardware and protocols are adapter concerns. The durable product contract is the versioned data and evidence trail.

## Canonical measurement envelope

The migration stores these concepts independently of a device vendor:

- organization_id, site_id, optional area/asset, meter_id, and optional adapter_id establish ownership and hierarchy.
- schema_version, stable event_id, optional sequence_id, source_record_ref, and provenance allow replay-safe ingestion and later explanation.
- measured_at is source event time in UTC; received_at is when the platform accepted it. Site timezone is separate display and tariff context.
- kind distinguishes interval_energy, cumulative_energy, power, voltage, and current. Interval bounds are stored only when known.
- value and unit retain an explicit physical unit. Normalization does not erase the source record reference.
- quality is valid, suspect, invalid, or quarantined. Invalid and suspect records must remain diagnosable without entering cost totals.

The current demo module supports Wh/kWh energy, W/kW power, V, and A. It rejects unsupported kind/unit combinations. Cumulative readings are differenced separately: a decrease is quarantined unless a configured register maximum proves rollover. The application must never silently treat a gap, invalid reading, or stale source as zero.

The database applies a unique key to organization_id plus event_id as an idempotency backstop. A production ingestion service must also authenticate sources, validate payload size and schema version, bound timestamps, handle out-of-order arrivals, and record replay outcomes.

## Tariff and cost contract

Tariffs are effective-dated, carry currency and timezone, and store components as structured data. Billing runs retain the tariff version and calculation version. The deterministic estimate function currently supports a flat rate and time-of-day hour bands; it rejects missing/overlapping intervals, readings outside the tariff effective window, incomplete expected interval counts, unsupported records, and uncovered time-of-use periods. It returns an estimated or incomplete outcome and does not create payment state.

The UI's ₹8/kWh example is synthetic. Production tariff support still needs demand charges, taxes, fixed charges, jurisdiction-specific rounding, daylight-saving boundaries, meter multipliers, export/netting rules, corrections, and review by the customer or utility. AI and generative models must never set a billed amount.

## Tenant access model

The additive Supabase migration defines organizations, organization_members, sites, areas, assets, meters, source_adapters, measurements, tariffs, billing_runs, insights, and interventions. Membership roles are owner, admin, operator, and viewer. RLS policies provide organization-scoped reads, operator-scoped operational writes, admin-scoped configuration, and append-only measurement behavior for authenticated users. Service-role keys must stay server-side.

This SQL is a starting point, not a completed security audit. Apply it to a clean disposable Supabase project, inspect generated SQL, run cross-tenant read/write tests, verify role changes and deletion behavior, then add migration coverage before using it with customer data. The legacy billing tables and screens are not migrated by this schema.

## Watt2Yield evidence loop

The Schneider/Watt2Yield project informs the industrial example: compare energy with good output, show the deviation and its evidence, let an operator choose the action, then verify a matched period while checking throughput and quality. The cross-sector core uses the same discipline but varies context by site:

- Home: consumption patterns and optional generation/storage only when those signals exist.
- Office/building: area or occupancy normalization only when source context is present and comparable.
- Industrial: energy per good unit only when energy, cycle/output, good count, and reject context are available.

An alert is not a machine diagnosis; correlation is not a verified saving. Any future model insight must carry its input window, model/rule version, confidence or uncertainty, and evidence. Savings need matched pre/post windows plus throughput and quality guardrails.

## Optional AI and 30–40 year resilience

Monitoring, data exports, deterministic cost calculation, and history must continue when AI is disabled or unavailable. Future inference belongs behind a provider boundary that can run on CPU, GPU, edge, or hosted compute. The product should record model/runtime versions, evaluate on chronologically separated and separate-site data, track false alerts and detection delay, compare candidate models with the current baseline, and support rollback. LLMs may summarize stored evidence but must not invent a fault or control equipment.

No specific board, protocol, cloud, model, or framework can credibly be promised for 30–40 years. Long-lived value comes from open export formats, schema versions and migrations, replaceable adapters, stable identifiers, deterministic historical calculations, and a tested recovery path.

## Security and operational boundaries

- The root demo needs no seller-owned backend or secret.
- Supabase client URL/key are read from environment variables. .env.example contains placeholders; publishable/anon keys are browser-safe but still require correct RLS.
- The GitHub repository is currently public. This change does not change visibility, inspect external database state, revoke a key, or clean historical commits.
- No physical control, relay operation, payment processing, or production bill is connected.
- Export/import formats, backup/restore, production auth, audit logging, rate limits, retention, privacy review, and deployment automation remain future work.
