# Implementation gates and validation plan

This roadmap records implemented work and remaining pilot/sale gates. Status is as of 19 October 2026. Product validation interviews and hosted-project security checks have not been performed. CI on PR #4 applies the additive migration to a fresh local Supabase stack, passes 27 pgTAP assertions, and passes Node 22/24 lint, typecheck, unit tests, and production builds.

## Phase 0 — Validate buyer and use case (not started)

The first product promise is: for organizations monitoring multiple locations, consolidate heterogeneous energy readings, show data quality and cost assumptions, explain unusual usage, and record whether an operator action changed the outcome. Home, office, and industrial examples share the data and workflow core, but do not pretend to share every business rule.

Before extending sector scope:

1. Interview 2–3 home energy users, 2–3 building/facility operators, and 2–3 industrial energy or production operators (6–9 total). Do not collect names, meter IDs, bills, or confidential production data unless necessary and explicitly consented.
2. Ask what sources they use, what decisions they make, what they distrust, which context is already available, and how they judge a successful intervention.
3. Record the job, current workaround, buyer, data access, trust barrier, purchase trigger, and evidence needed. Use unknown where there is no evidence.
4. Select one initial buyer profile and one demo/pilot scenario only after interviews. Keep the other sector profiles illustrative until demand is evidenced.

**Exit gate:** one shared pain point has evidence from at least one target profile; a buyer, decision, required data, and success measure are stated. A cross-sector product story is retained only if interviews support shared workflow demand.

### Interview prompts

- Walk through the last time you noticed unexpectedly high energy use. What data did you inspect and what did you do next?
- Which meter, building, machine, shift, output, tariff, and quality data can you access today? Who owns it?
- What makes you trust or reject a baseline or alert? How many false alerts are tolerable?
- If a suggested action changes energy use, what else must remain stable before you call it a saving?
- What security, privacy, uptime, integration, procurement, or compliance conditions prevent a trial?
- Who would sponsor and pay for a pilot, and what evidence would justify continuing?

## Phase 1 — Make the prototype safe to evaluate (partially implemented)

**Implemented here:** replaced the starter README, removed the Lovable runtime injection from the HTML shell, moved Supabase browser configuration to environment variables, ignored local env files, added a placeholder env template, and made the root demo synthetic and backend-independent. Added tests and pull-request CI scaffolding.

**Still required:**

- Review full Git history, current GitHub visibility, Lovable ownership/transfer terms, dependency licenses, checked-in data, and commit contributors before making a sale or exclusivity statement.
- Inspect the external Supabase project, policies, backups, logs, and records with its owner. The code change cannot establish that external data is private or deleted.
- The new migration does not convert old billing tables. Decide whether legacy login/admin/user screens are retained, migrated, or removed before a production handoff.
- Validate that authorization is enforced server-side for every legacy table and API. Frontend route checks are not an authorization boundary.

**Exit gate:** a clean clone runs the twin with no seller credentials; a separate disposable database proves expected RLS behavior; ownership and data scope are documented.

## Phase 2 — Establish the common model (partially implemented)

**Implemented here:** a version-1 measurement envelope, unit normalization, event ID deduplication, cumulative-register reset quarantine, effective-dated tariff estimation, and an additive multi-tenant SQL schema with roles and indexes.

**Still required:**

- CI applies the migration to a clean local Supabase stack and passes 27 pgTAP assertions across all 12 energy platform tables. No hosted database has been migrated. Add a rollback/upgrade strategy before production use.
- Add explicit fixtures and tests for invalid ranges, impossible/future timestamps, unit conversion, counter resets and configured rollovers, sequence gaps, late/out-of-order events, schema version rejection, daylight boundaries, tariff boundary crossings, and precision/rounding.
- Add export/import schema and round-trip tests preserving timestamps, units, event IDs, quality, tariff version, and provenance.
- Extend RLS coverage to a full allowed/denied CRUD matrix for every role and table. Current pgTAP checks tenant-scoped reads for all 12 tables and representative viewer/operator/admin/owner write boundaries, including membership removal and last-owner protection.
- Decide retention, raw event policy, correction events, deletion/export obligations, and partitioning based on measured workload.

**Exit gate:** clean local migration and the tested tenant-read/representative-write boundaries pass in CI. The full gate remains open until a broader CRUD matrix, rollback/upgrade, and export/import round-trip checks also pass.

## Phase 3 — Complete the browser digital twin (implemented as synthetic demo)

The portfolio, home/office/industrial profiles, source-to-verification workflow, and fault controls are present. Twin events use the versioned measurement module; duplicates and resets exercise explicit validation outcomes.

**Still required:**

- Verify every scenario against a visible outcome and test the browser interaction at narrow and wide viewports.
- Make the event detail view show raw source fields, normalized fields, quality reasons, calculation inputs, and provenance on demand.
- Add replay, out-of-order, invalid unit/range, clock drift, disconnect/reconnect, and missing-interval scenarios.
- Keep every simulation badge and simulated before/after result visible in exported screenshots and demo material.

**Exit gate:** scenarios are deterministic, share the same validation path, and never imply a physical meter or actual savings.

## Phase 4 — Portfolio metrics and cost estimates (partially implemented)

The domain module supports deterministic flat and time-of-day estimates; the UI uses a synthetic flat-rate fixture. A cost estimate is not an authoritative bill.

**Still required:**

- Connect charts and period summaries to persisted interval readings, not display-only constants.
- Build a reading-to-cost drill-down showing accepted interval IDs, rejected/missing intervals, conversions, tariff component, effective date, currency, timezone, calculation version, and rounding.
- Add tariff slabs, fixed/demand charges, export/net metering and jurisdiction rules only for a validated customer and after domain review.
- Support multiple meters and organization/site access with persisted user roles; do not infer floor-area or production normalization when context is missing.
- Replace hard-coded synthetic summary cards with calculated fixture outputs and tests so every displayed subtotal reconciles.

**Exit gate:** portfolio, site, and exported estimate reconcile to the same validated readings and tariff version, or are visibly incomplete.

## Phase 5 — Watt2Yield-inspired evidence loop (simulation only today)

The UI presents industrial energy per good unit, reference, quality/throughput guardrails, operator decision buttons, and a simulated label. It does not yet implement matched before/after measurement or claim an intervention saved energy.

**Next implementation:** cycle/session identity; machine state and product/load context; good/reject counts; baseline window; anomaly evidence; likely contributing factors with uncertainty; operator decision and notes; matched post-action window; throughput/reject guardrails; measured versus modeled versus simulated outcome types.

**Exit gate:** one real pilot demonstrates an explainable signal, recorded operator decision, matched comparison, and stable throughput/quality. Synthetic data cannot satisfy this gate.

## Phase 6 — Evaluate optional AI (not implemented)

Start with interpretable rules and robust statistical baselines. Add an inference provider only if it improves an agreed decision outcome on chronologically held-out sessions and separate sites. Evaluate baseline error/bias, anomaly precision/recall, false alerts per day or cycle, detection delay, model/site drift, latency, runtime cost, and privacy. Record input window, model/runtime version, uncertainty, and rollback. Monitoring and cost calculations must work with the provider unavailable. Do not use an LLM to diagnose a machine or alter a bill.

**Exit gate:** evaluation protocol and results are reproducible; model improves the agreed baseline; operator understands evidence and uncertainty; rollback is tested.

## Phase 7 — Security, deployment, and buyer package (partially implemented)

**Implemented here:** CI workflow, README, architecture/data-contract notes, due-diligence checklist, roadmap, tests, sample synthetic workflow, and environment template. PR #4 CI applies the database migration and passes 27 pgTAP assertions plus Node 22/24 checks.

**Still required:** broaden RLS CRUD coverage; add migration rollback/upgrade checks; accessibility and browser interaction review; dependency/SBOM/license review; security and secret/history review; a clean deployment recipe; backup/export/restore; API/adapter contract; and a feature matrix with implemented/planned/unknown labels. Fill DataVendor fields only from verified outputs and reviewed private-data state.

## Release and pilot decision gates

Do not present this branch as production-ready until all are true:

- A new reviewer can run the demo from a clean checkout without the seller's backend, account, or credentials.
- Tests, typecheck, lint, and production build pass in CI.
- Tenant RLS tests prove isolation and role boundaries against the migrated schema.
- Every dashboard cost and insight traces to data, tariff/rule/model version, and provenance.
- Missing, duplicate, late, reset, and invalid measurements have explicit outcomes.
- Pilot outcomes distinguish measured savings from estimates and preserve throughput/quality.
- Ownership, external data, licenses, and repository history have been reviewed.
