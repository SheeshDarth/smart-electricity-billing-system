# Feature and readiness matrix

Status snapshot: 28 October 2026. “Implemented” means code exists in the repository; it does not mean deployed, certified, validated with live equipment, or ready for customer data. PRs #6 and #7 are merged. Current code commit `ab6da4a` passed Node 22/24, four Chromium workflows, migration, database lint, and pgTAP in [CI run 40633652147](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40633652147).

## Product capability status

| Capability | Status | Evidence and limit |
|---|---|---|
| Browser site and meter views | Synthetic demo | Illustrative home, office, and industrial records; no live sites or meters. |
| Source-to-dashboard workflow | Local simulation | Twin readings pass through in-process validation; no production ingestion API, queue, or persistent stream. |
| Measurement normalization | Implemented domain slice | Schema validation, supported unit conversion, quality outcomes, batch event-ID deduplication, and cumulative-register delta helper. No durable idempotency or register history. |
| Data freshness and quality | Demo and domain checks | Spike, stale, duplicate, reset, and invalid-unit cases are simulated. No live monitoring or alert delivery. |
| Flat/time-of-use estimate | Implemented deterministic domain logic | Effective date, currency, timezone, tariff version, interval allocation, and incomplete/gap rejection. A multi-version tariff helper now splits intervals at effective boundaries. Results remain estimates. |
| CSV reading preview | Implemented local-only workflow | Column mapping, explicit-offset timestamps, interval-energy unit checks, duplicate/conflict handling, row-level outcomes, 5 MiB/50,000-row limits. No upload, persistence, cumulative-register conversion, or cross-session idempotency. |
| Tariff and data-quality cases | Expanded domain test coverage | Tests cover DST spring-forward/fall-back, tariff version boundaries/gaps/overlaps, rounding, duplicate and out-of-order readings, overlapping intervals, and reset validation. Jurisdiction-specific charges and production tariff verification remain open. |
| E-bill PDF | Implemented estimate document | Generated locally from validated interval readings and selected flat or two-band local-hour tariff. Shows period, tariff/calculation versions, usage, charge, duplicate count, and exclusions; disclaims official invoice/amount due. |
| Supplier-stated bill comparison | Implemented manual comparison | Reviewer enters an amount and confirms same-period coverage. PDF shows estimate-minus-stated-total variance. No invoice parsing or persisted reconciliation history. |
| Human review and outcome | Synthetic workflow | Local decision and simulated verification only; no persistent intervention or proven savings. |
| Energy archive v1 | Local export and validated summary | Browser exports synthetic linked records and validates a complete selected JSON archive. Reports all detected issues/counts and refuses partial import. No Supabase persistence, authentication, signature, full non-measurement schemas, or transactional production import. |
| Supabase multi-tenant schema | Additive migration; expanded RLS suite passed in PR #8 CI | Role/table reads, representative writes, cross-organization denials, and membership changes pass against disposable tenants. Hosted project remains uninspected. |
| Database lint and cleanup | Passed in PR #8 CI | Disposable migration, schema lint, pgTAP, and stack cleanup passed. Hosted projects are not involved. |
| Demo packaging | HTTP smoke and Chromium walkthrough passed in CI run 40633652147 | Four E2E tests cover flat and time-of-use estimates, local-hour boundary allocation, calculation CSV, PDF disclosure, invalid-row blocking, and comparison reset. [Current screenshot artifact](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40633652147/artifacts/12792527679) is retained for 30 days. |
| E-bill calculation trace | Implemented | Expandable view maps up to 12 priced segments to source references; full CSV preserves source-interval bounds, segment bounds, tariff period/rate, source value/unit origin, and summary. PDF records a time-of-use schedule without a fabricated flat rate. |
| Domain coverage | Measured locally 28 October 2026 | Node reports 91.79% lines, 77.43% branches, 99.05% functions across four domain modules only. No UI, SQL, or whole-repository coverage claim. |
| Authentication and authorization | Not production validated | RLS remains a draft schema. Tests are synthetic and not a full deployed security audit. Legacy routes retain old application assumptions. |
| Live meter adapters | Not implemented | No DLMS/COSEM, OPC UA, MQTT, vendor API, gateway, or hardware-in-the-loop integration. |
| AI, GPU, or LLM service | Not implemented | No model, inference provider, evaluation dataset, AI diagnosis, or GPU dependency. Monitoring and costs do not require AI. |
| Payments and authoritative invoices | Not implemented | Unused simulated card-entry modal removed; legacy billing flags remain explicitly demo-only. No payment processor or official invoice. |
| Deployment and operations | Not packaged for production | Hosting, monitoring, incident response, backup/recovery objectives, retention, and service-level commitments remain undefined. |

## Target and non-target

The initial buyer hypothesis is multi-site property or business operators who need a trustworthy view of usage, reading quality, and bill variance. It has not been validated through interviews, customer evidence, or a live pilot. See the [interview guide](buyer-validation-interview-guide.md).

The prototype is not a utility AMI/DISCOM replacement, smart-home controller, payment system, industrial optimization suite, or AI-savings product. The Schneider-linked concept was rejected. Schneider Electric appears only as a competitor; industrial demo records are illustrative.

## Buyer-safe description

> Wattwise is an early-stage browser prototype with synthetic energy scenarios and a local CSV-to-e-bill estimate workflow. It validates interval-energy rows, calculates an explicit flat-tariff estimate, compares a reviewer-entered supplier total for a confirmed matching period, and generates a labelled PDF estimate. It also includes a local energy archive validator/exporter, domain tests, a draft additive Supabase schema, CI, and technical documentation. It is not a deployed billing service, official invoicing system, or live meter platform.

Do not claim production authorization, live interoperability, jurisdiction-ready billing, supplier-document parsing, automated reconciliation, AI diagnostics, verified savings, compliance certification, or production security.

## Listing blockers

1. The GitHub repository remains public. Keep it that way until external-project and rights reviews are complete; then change visibility and refresh DataVendor's estimate.
2. The pattern-based history scan found one historical Supabase anonymous client key matching its historical project URL. The external project has not been reviewed.
3. Ownership/contributor rights, project license, third-party asset rights, and full legal license compatibility review are incomplete.
4. No operator interviews or customer pilot have validated the buyer hypothesis.
5. The 27 October 2026 npm audit reports zero known vulnerabilities after the dependency updates; re-run the audit before listing because advisories change.

See [marketplace listing draft](marketplace-listing-draft.md) and [buyer due diligence](buyer-readiness.md) for detailed evidence and blockers.
