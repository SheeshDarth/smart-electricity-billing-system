# Implementation roadmap and release gates

Status snapshot: 27 October 2026. This roadmap replaces the earlier broad energy-intelligence direction with a focused electricity visibility and bill-evidence hypothesis. Buyer demand and willingness to pay have not been validated. No customer data or hosted Supabase project has been used in this work.

## Product outcome

A multi-site property or business operator should be able to import readings, understand which records are complete and trusted, calculate a transparent tariff-based estimate, compare it with a supplier-stated bill amount, investigate variances, and retain a review trail. This is a hypothesis, not a proven market need. The first pilot should be read-only and use synthetic or customer-approved sample data.

Core rules:

- Show source, measured time, received time when available, unit conversion, quality, tariff version, and calculation assumptions for every summary.
- Preserve unknown or missing as unknown. Never silently fill gaps with zero.
- Distinguish measured reading, calculated estimate, supplier-stated bill amount, and simulated example.
- Do not call a variance a fault or saving without evidence and comparable periods.
- Keep protocol, storage, hosting, and any AI provider replaceable. Do not promise a specific technology lasts decades.

## Current baseline

The application includes synthetic browser scenarios, measurement and tariff domain logic, additive Supabase migrations, a local CSV-to-e-bill estimate workflow, and a no-credentials demo. PRs #6 and #7 are merged; PR #8 adds Playwright coverage, broader domain cases, archive import/export validation, and expanded RLS matrix tests. Its Node 22/24, browser, database migration/lint, and pgTAP CI jobs passed. The e-bill slice validates interval-energy rows, calculates a flat tariff, supports a manually entered same-period supplier amount, and generates a PDF estimate. Files and bills are not persisted, and the PDF is not an official utility invoice. Live ingestion, supplier-document parsing, transactional archive import, and supported production deployment remain unimplemented.

## P0 — Keep evaluation safe and reproducible

### Work

1. Keep the root demo independent of seller-owned Supabase credentials and ensure a clean checkout can start from documented prerequisites.
2. Keep the inherited login/admin/user flows labeled as legacy until they are migrated separately or removed by an explicit decision.
3. Require npm install from lockfile, lint, typecheck, unit tests, production build, local Supabase migration, pgTAP, database lint, and always-run local stack cleanup on pull requests.
4. Add focused tests for the energy archive parser and serializer: valid minimal archive; bad format/version; missing collections; malformed measurement; missing timezone; invalid interval range; non-finite values; oversize input; round-trip preservation of fields.
5. Keep all screenshots and demo content labeled synthetic; verify the UI cannot imply that a simulated decision changed a real device.
6. Complete the repository sale-readiness review separately: Git history, checked-in data, dependency licenses, ownership/contributor rights, current repository visibility, Lovable terms, and external Supabase project state.

### Exit gate

Current status: PR #6 and PR #7 are merged; PR #8 remains an open draft and its CI passed. The branch locally passes 47 domain tests and two Playwright tests; measured coverage is 91.47% lines, 77.34% branches, and 98.90% functions across four domain modules. Repository history screening found a historical Supabase anonymous key. Three initial operator research notes were sent on 27 October 2026; replies and interviews are pending. Hosted project review, ownership/license review, and buyer validation remain open.

## P1 — Validate buyer, data access, and first scenario

### Work

1. Start with one buyer hypothesis: multi-site property operators or small businesses. Interview 3–5 relevant operators before choosing the segment; include a finance/billing stakeholder where possible.
2. Ask participants to walk through a recent unexpected bill or usage variance. Record current tools, decision, time spent, accessible exports, correction process, privacy constraints, buyer, purchase trigger, and acceptable onboarding effort.
3. Request synthetic or redacted sample formats only with permission. Do not collect account credentials, bank/payment data, or identifiable bill documents for discovery.
4. Make a dated competitor matrix covering source onboarding, missing-data handling, tariff assumptions, bill comparison, review trail, export, access control, and deployment. Use unknown when public evidence is absent.
5. Compare candidate MVP flows by business value, data access, privacy burden, validation cost, and integration risk. Choose one site type and one tariff jurisdiction for the first pilot after interviews.

### Exit gate

At least one repeated pain point has evidence from multiple interviews; the user, buyer, decision, data source, and success metric are explicit; a permissible sample file or equivalent synthetic fixture represents the selected flow. If bill reconciliation is not a priority, stop before building document processing.

## P2 — Build a safe reading import workflow

Current implementation: the browser provides local CSV column mapping, an interval-energy preview, row-level rejection and duplicate handling, file/row limits, and a synthetic example. It does not persist import batches, provide cross-upload idempotence, or store source files.

### Work

1. Start with CSV upload or local sample file. Avoid live streaming protocols until one buyer and source are chosen.
2. Provide a dry-run preview. Map timestamp, meter, value, unit, interval bounds, and source identifier; specify timezone and whether readings are interval energy or cumulative registers.
3. Validate file size, rows, timestamp offset, supported unit, finite value, interval bounds, meter mapping, duplicate ID, and expected cadence before persistence.
4. Return row-level accepted, duplicate, quarantined, and rejected outcomes with actionable reasons. Preserve the original file reference and row number; do not log sensitive full bill content.
5. Make retries idempotent across uploads. Keep import batch ID, mapping version, user, time, and source digest. Prevent an uploaded row from changing site ownership.
6. Render quality/freshness summaries from stored canonical records, including data coverage and explicit unknown periods.

### Exit gate

A second upload of the same file adds no duplicate energy; changed mappings are reviewable; invalid rows never enter totals; exports retain source lineage; user can see incomplete coverage without mistaking it for zero use.

## P3 — Deliver transparent estimate and bill-variance review

Current implementation: a single-meter e-bill PDF estimate uses validated interval-energy records and a user-configured flat tariff. It can include a reviewer-entered supplier total after same-period confirmation. Time-of-use tariffs in this workflow, supplier-document parsing, official invoice semantics, jurisdiction-specific components, and persistent review history remain open.

### Work

1. Use effective-dated tariffs with currency, timezone, billing period, calculation version, and explicit components. Begin with flat and time-of-use examples only.
2. Define billing cutoffs and supported interval cadence with the pilot user; split intervals across tariff boundaries only when the allocation assumption is displayed.
3. Show estimate drill-down: source rows and accepted coverage, conversions, missing/quarantined rows, tariff component, rounding, subtotal, and total.
4. Let the reviewer enter the bill period and supplier-stated amount manually for the first pilot. Add file parsing only after document privacy, retention, access, and error-correction needs are agreed.
5. Compare estimate and bill as a variance with clear sign and units. Never claim a cause automatically; route differences to a review queue with evidence and user notes.
6. Preserve source reading, tariff, calculation version, reviewer identity, timestamp, and correction history. Do not overwrite imported data silently.
7. Keep taxes, fixed/demand charges, export/netting, arrears, penalties, and jurisdiction-specific rules out until reviewed against a named customer and tariff source.

### Exit gate

An independent reviewer can reproduce the estimate from the displayed records and tariff; incomplete intervals affect coverage visibly; bill comparison labels the bill as supplier-stated and the estimate as calculated; corrections are auditable.

## P4 — Harden tenant boundaries and portability

### Work

1. Complete allowed/denied CRUD tests for each role on every tenant table, including cross-organization attempts, membership removal, and last-owner protection.
2. Test migrations from a clean database and supported previous version; define rollback, forward-fix, backup, restore, retention, deletion, and export procedures.
3. Complete the archive format contract: entity fields/relationships, IDs, timestamp semantics, unknown-field policy, compatibility rules, and privacy classification.
4. Add round-trip and corruption checks and a dry-run import report before exposing archive import to users. Apply import transactionally; never partially mutate live data without a recoverable record.
5. Validate secrets, role checks, row ownership, upload limits, rate limits, log redaction, and operational access before a live pilot.
6. Choose a buyer-owned pilot deployment and define monitoring, backup cadence, recovery objective, incident contacts, data processing/retention terms, and support boundaries.

### Exit gate

Tenant isolation and restore/import checks pass in a disposable buyer-like environment; no seller credential or database is required to run; archive round-trip reproduces IDs, units, timestamps, quality, tariff, and source references.

## P5 — Add one real adapter and operate a bounded pilot

### Work

1. Select a source only when a pilot buyer provides equipment or export documentation, sample records, data permission, and a responsible technical contact.
2. Keep the adapter replaceable and map source data to the versioned canonical envelope. Bind source credentials to allowed organization/site/meter IDs server-side.
3. Specify retry, duplicate, ordering, late-arrival, disconnect, replay, clock-drift, counter rollover, and recovery behavior. Use a durable idempotency store before streaming ingestion.
4. Validate the connector against fixtures and vendor sandbox or hardware-in-the-loop where required. Record exact source models/versions tested.
5. Start read-only. Measure onboarding effort, interval completeness, data freshness, duplicate/quarantine rate, estimate-to-bill variance, review usefulness, and support incidents.

### Exit gate

A named pilot source runs without bypassing tenant or quality checks; failure and recovery are visible; customer can export and restore data; pilot metrics have a baseline and an owner. Do not claim broad interoperability from one adapter.

## P6 — Evaluate optional analytics and AI

Begin with transparent rules and simple statistical baselines. Add an inference provider only if real or appropriately de-identified data supports an agreed decision outcome. Evaluate chronologically held-out periods and separate sites where possible. Track false alerts, missed events, detection delay, bias, uncertainty, drift, latency, runtime cost, and privacy. Compare against the non-AI baseline and provide disable/rollback controls. Any summary must point to stored readings and rule/model version. AI may not set a bill amount or operate equipment.

### Exit gate

Monitoring, estimates, exports, and history remain available when the AI service is off. A reproducible evaluation shows improvement on the buyer's agreed metric, with uncertainty and operational cost understood. GPU is an implementation choice, not a product requirement.

## Risks and controls

| Risk | Control |
|---|---|
| Buyer need is not distinct from existing dashboards or bill tools | Interview first; test file-to-evidence workflow against actual current process. |
| Bad timestamps, units, gaps, or cumulative resets produce misleading totals | Validate rows, preserve raw references, surface coverage, quarantine ambiguous records. |
| Tariff estimate diverges from actual bill | State assumptions/version, compare as estimate, validate only named jurisdiction and components. |
| Bill documents expose private account or location data | Begin with manual amount/period; define access, storage, retention, deletion, and redaction before upload. |
| Multi-tenant schema gives false confidence | Expand test matrix and review storage/API/server paths, migrations, backup, and recovery. |
| One integration locks product into a vendor | Keep adapters versioned and replaceable; build only for validated demand. |
| AI appears more certain than evidence supports | Keep optional, benchmark against rules, display uncertainty, avoid causal and savings claims. |
| Scope expands toward utility/industrial control | Keep first pilot read-only; gate new context by buyer evidence and safety requirements. |

## Success measures

Do not set public numerical targets before baseline measurement. Track time to first trusted estimate, valid interval coverage, data freshness, duplicate/quarantine rates, estimate-to-bill variance with tariff coverage, review outcomes, onboarding effort, export recovery, and security/support incidents. These measure product usefulness without implying that a synthetic demo proves energy savings.

For implemented status and exact limits, see [feature readiness](feature-status.md), [product scope](product-scope.md), and [architecture](architecture.md).
