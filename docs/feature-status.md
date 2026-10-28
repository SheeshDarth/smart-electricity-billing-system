# Feature and readiness matrix

Status snapshot: 28 October 2026. “Implemented” means code exists in the repository; it does not mean deployed, certified, validated with live equipment, or ready for customer data. PRs #6, #7, and #8 are merged. PR #8's latest run [40635970820](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40635970820) passed Node 22/24 and browser checks after the database integration was removed. This branch adds the interactive workflow animation; lint, typecheck, production build, and all five Chromium tests pass locally, but this revision still needs PR CI.

## Product capability status

| Capability | Status | Evidence and limit |
|---|---|---|
| Browser site and meter views | Synthetic demo | Illustrative home, office, and industrial records; no live sites or meters. |
| Source-to-dashboard workflow | Interactive local simulation | A seven-stage browser animation shows virtual source, in-process validation, quality gate, site view, estimate, human review, and simulated verification. Playback is manual when reduced motion is requested. No production ingestion API, queue, or persistent stream. |
| Measurement normalization | Implemented domain slice | Schema validation, supported unit conversion, quality outcomes, batch event-ID deduplication, and cumulative-register delta helper. No durable idempotency or register history. |
| Data freshness and quality | Demo and domain checks | Spike, stale, duplicate, reset, and invalid-unit cases are simulated. No live monitoring or alert delivery. |
| Flat/time-of-use estimate | Implemented deterministic domain logic | Effective date, currency, timezone, tariff version, interval allocation, and incomplete/gap rejection. A multi-version tariff helper now splits intervals at effective boundaries. Results remain estimates. |
| CSV reading preview | Implemented local-only workflow | Column mapping, explicit-offset timestamps, interval-energy unit checks, duplicate/conflict handling, row-level outcomes, 5 MiB/50,000-row limits. Files are not sent to a server; readings are not persisted; cumulative-register conversion and cross-session idempotency are not implemented. |
| Tariff and data-quality cases | Expanded domain test coverage | Tests cover DST spring-forward/fall-back, tariff version boundaries/gaps/overlaps, rounding, duplicate and out-of-order readings, overlapping intervals, and reset validation. Jurisdiction-specific charges and production tariff verification remain open. |
| E-bill PDF | Implemented estimate document | Generated locally from validated interval readings and selected flat or two-band local-hour tariff. Shows period, tariff/calculation versions, usage, charge, duplicate count, and exclusions; disclaims official invoice/amount due. |
| Supplier-stated bill comparison | Implemented manual comparison | Reviewer enters an amount and confirms same-period coverage. PDF shows estimate-minus-stated-total variance. No invoice parsing or persisted reconciliation history. |
| Human review and outcome | Interactive local decision gate | Accept/Investigate/Defer choice gates the verification stage and is included in the synthetic evidence JSON. It exists in browser memory only; no account, persisted audit trail, physical action, or proven savings. |
| Energy archive v1 | Local export and validated summary | Browser exports synthetic linked records and validates a complete selected JSON archive. Reports all detected issues/counts and refuses partial import. No backend persistence, authentication, signature, full non-measurement schemas, or transactional production import. |
| Authentication, persistence, and tenant security | Not included | Legacy database-backed routes, client integration, schema, and migrations were removed. No application database is currently connected. |
| Demo packaging | HTTP smoke and four e-bill Chromium workflows passed in PR #8 CI run 40635970820; all five current Chromium tests pass locally 28 October 2026 | This branch adds the interactive workflow test and screenshot. Run CI on this revision before claiming the new case passed on CI. The previous artifact contains four e-bill screenshots. |
| E-bill calculation trace | Implemented | Expandable view maps up to 12 priced segments to source references; full CSV preserves source-interval bounds, segment bounds, tariff period/rate, source value/unit origin, and summary. PDF records a time-of-use schedule without a fabricated flat rate. |
| Domain coverage | Measured locally 28 October 2026 | Node reports 91.79% lines, 77.43% branches, 99.05% functions across four domain modules only. No UI, SQL, or whole-repository coverage claim. |
| Live meter adapters | Not implemented | No DLMS/COSEM, OPC UA, MQTT, vendor API, gateway, or hardware-in-the-loop integration. |
| AI, GPU, or LLM service | Not implemented | No model, inference provider, evaluation dataset, AI diagnosis, or GPU dependency. Monitoring and costs do not require AI. |
| Payments and authoritative invoices | Not included | The previous simulated payment and legacy invoice routes were removed. No payment processor or official invoice is present. |
| Deployment and operations | Not packaged for production | Hosting, monitoring, incident response, backup/recovery objectives, retention, and service-level commitments remain undefined. |

## Target and non-target

The initial buyer hypothesis is multi-site property or business operators who need a trustworthy view of usage, reading quality, and bill variance. It has not been validated through interviews, customer evidence, or a live pilot. See the [interview guide](buyer-validation-interview-guide.md).

The prototype is not a utility AMI/DISCOM replacement, smart-home controller, payment system, industrial optimization suite, or AI-savings product. The Schneider-linked concept was rejected. Schneider Electric appears only as a competitor; industrial demo records are illustrative.

## Buyer-safe description

> Wattwise is an early-stage browser prototype with synthetic energy scenarios, an animated workflow with a browser-only review decision, and a local CSV-to-e-bill estimate workflow. It validates interval-energy rows, calculates an explicit flat or time-of-use estimate, compares a reviewer-entered supplier total for a confirmed matching period, and generates a labelled PDF estimate. It also includes a local energy archive validator/exporter, domain tests, pull-request CI, and technical documentation. It has no authentication, database, persistent storage, or live meter connection, and is not a deployed billing service or official invoicing system.

Do not claim production authorization, live interoperability, jurisdiction-ready billing, supplier-document parsing, automated reconciliation, AI diagnostics, verified savings, compliance certification, or production security.

## Listing blockers

1. The GitHub repository remains public. Keep it that way until external-project and rights reviews are complete; then change visibility and refresh DataVendor's estimate.
2. The current application no longer includes the former database integration, but a historical anonymous client key remains in Git history. A local restored backup showed four `auth.users` rows and zero rows in the five former application tables; user fields and the separate Storage backup remain unreviewed, and the old project's key status/decommissioning remains unconfirmed.
3. Ownership/contributor rights, project license, third-party asset rights, and full legal license compatibility review are incomplete.
4. No operator interviews or customer pilot have validated the buyer hypothesis.
5. The 27 October 2026 npm audit reports zero known vulnerabilities after the dependency updates; re-run the audit before listing because advisories change.

See [marketplace listing draft](marketplace-listing-draft.md) and [buyer due diligence](buyer-readiness.md) for detailed evidence and blockers.
