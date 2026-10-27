# Feature and readiness matrix

Status snapshot: 27 October 2026. “Implemented” means code exists in the repository; it does not mean deployed, certified, validated with live equipment, or ready for customer data. PRs #6 and #7 are merged. The current `codex/remaining-readiness` changes still need their own CI run.

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
| E-bill PDF | Implemented estimate document | Generated locally from validated interval readings and selected flat tariff. Shows period, tariff/calculation versions, usage, charge, duplicate count, and exclusions; disclaims official invoice/amount due. |
| Supplier-stated bill comparison | Implemented manual comparison | Reviewer enters an amount and confirms same-period coverage. PDF shows estimate-minus-stated-total variance. No invoice parsing or persisted reconciliation history. |
| Human review and outcome | Synthetic workflow | Local decision and simulated verification only; no persistent intervention or proven savings. |
| Energy archive v1 | Local export and validated summary | Browser exports synthetic linked records and validates a complete selected JSON archive. Reports all detected issues/counts and refuses partial import. No Supabase persistence, authentication, signature, full non-measurement schemas, or transactional production import. |
| Supabase multi-tenant schema | Additive migration; expanded RLS suite pending current CI | Existing merged CI passed the original test set. The current branch expands role/table read/write and cross-organization/membership checks; hosted project remains uninspected. |
| Database lint and cleanup | Previously CI validated; current branch pending | Prior clean local migration/lint/test/cleanup passed in CI. Confirm this branch's expanded pgTAP result before describing it as passing. |
| Demo packaging | Existing HTTP smoke plus new browser E2E | HTTP smoke checks built assets. Current branch adds two Chromium tests for valid CSV/e-bill comparison and invalid-row blocking; passed locally, branch CI pending. |
| Domain coverage | Measured on current branch | Node reports 91.47% lines, 77.34% branches, 98.90% functions across four domain modules only. No UI, SQL, or whole-repository coverage claim. |
| Authentication and authorization | Not production validated | RLS remains a draft schema. Tests are synthetic and not a full deployed security audit. Legacy routes retain old application assumptions. |
| Live meter adapters | Not implemented | No DLMS/COSEM, OPC UA, MQTT, vendor API, gateway, or hardware-in-the-loop integration. |
| AI, GPU, or LLM service | Not implemented | No model, inference provider, evaluation dataset, AI diagnosis, or GPU dependency. Monitoring and costs do not require AI. |
| Payments and authoritative invoices | Not implemented | Unused simulated card-entry modal removed; legacy billing flags remain explicitly demo-only. No payment processor or official invoice. |
| Deployment and operations | Not packaged for production | Hosting, monitoring, incident response, backup/recovery objectives, retention, and service-level commitments remain undefined. |

## Target and non-target

The initial buyer hypothesis is multi-site property or business operators who need a trustworthy view of usage, reading quality, and bill variance. It has not been validated through interviews or a live pilot. The [interview guide](buyer-validation-interview-guide.md) is prepared; no operator outreach has happened.

The prototype is not a utility AMI/DISCOM replacement, smart-home controller, payment system, industrial optimization suite, or AI-savings product. The Schneider-linked concept was rejected. Schneider Electric appears only as a competitor; industrial demo records are illustrative.

## Buyer-safe description

> Wattwise is an early-stage browser prototype with synthetic energy scenarios and a local CSV-to-e-bill estimate workflow. It validates interval-energy rows, calculates an explicit flat-tariff estimate, compares a reviewer-entered supplier total for a confirmed matching period, and generates a labelled PDF estimate. It also includes a local energy archive validator/exporter, domain tests, a draft additive Supabase schema, CI, and technical documentation. It is not a deployed billing service, official invoicing system, or live meter platform.

Do not claim production authorization, live interoperability, jurisdiction-ready billing, supplier-document parsing, automated reconciliation, AI diagnostics, verified savings, compliance certification, or production security.

## Listing blockers

1. The GitHub repository remains public. Keep it that way until external-project and rights reviews are complete; then change visibility and refresh DataVendor's estimate.
2. The pattern-based history scan found one historical Supabase anonymous client key matching its historical project URL. The external project has not been reviewed.
3. Ownership/contributor rights, project license, third-party asset rights, and full legal license compatibility review are incomplete.
4. No operator interviews or customer pilot have validated the buyer hypothesis.
5. Current readiness branch CI, especially the expanded database suite, still needs to pass.
6. The current npm audit reports 9 advisories (7 moderate, 2 high) after safe semver updates.

See [marketplace listing draft](marketplace-listing-draft.md) and [buyer due diligence](buyer-readiness.md) for detailed evidence and blockers.
