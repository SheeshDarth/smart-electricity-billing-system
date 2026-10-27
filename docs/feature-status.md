# Feature and readiness matrix

Status snapshot: 27 October 2026, after adding the local e-bill estimate workflow. “Implemented” means code exists in the repository; it does not mean deployed, certified, validated with live equipment, or ready for customer data.

## Product capability status

| Capability | Status | Evidence and limit |
|---|---|---|
| Browser site and meter views | Synthetic demo | Illustrative home, office, and industrial records; no live sites or meters. |
| Source-to-dashboard workflow | Local simulation | Twin readings pass through in-process validation; there is no production ingestion API, queue, or persistent stream. |
| Measurement normalization | Implemented domain slice | Schema validation, supported unit conversion, quality outcomes, batch event-ID deduplication, and cumulative-register delta helper in `src/domain/energyModel.mjs`. No durable idempotency or register history. |
| Data freshness and quality | Demo and domain checks | Spike, stale, duplicate, reset, and invalid-unit cases are simulated. There is no live monitoring or operational alert delivery. |
| Flat/time-of-use estimate | Implemented deterministic domain logic | Effective date, currency, timezone, tariff version, interval allocation, and incomplete/gap rejection are handled. Results are estimates, not official bills. |
| CSV reading preview | Implemented local-only workflow | Column mapping, explicit-offset timestamps, interval-energy unit checks, duplicate/conflict handling, row-level outcomes, 5 MiB file limit, and 50,000-row limit. No upload, persistence, cumulative-register conversion, or cross-session idempotency. |
| Tariff coverage | Incomplete for production | Taxes, fixed/demand charges, adjustments, meter multipliers, net-metering, jurisdiction rounding, and daylight-saving validation remain open. |
| E-bill PDF | Implemented estimate document | Generated locally from validated interval readings and the selected flat tariff. Shows the reading period, tariff and calculation versions, usage, charge, duplicate count, and excluded charge classes; explicitly disclaims official invoice or amount-due status. |
| Supplier-stated bill comparison | Implemented manual comparison | Reviewer enters an amount and confirms it covers the same period. The PDF shows estimate-minus-stated-total variance; there is no supplier-document parsing, official bill validation, or persisted reconciliation record. |
| Human review and outcome | Synthetic workflow | The browser demonstrates a local decision and simulated verification. It does not create a persistent intervention or prove savings. |
| Energy archive schema v1 | Implemented domain utility; CI tested | `src/domain/energyArchive.mjs` validates the envelope and basic measurement fields, preserves unknown fields, and enforces a 10 MiB limit. Dedicated parser/serializer tests pass in PR CI. There is no entity relation check, UI/database integration, or transactional import/export. |
| Supabase multi-tenant schema | CI validated locally | Additive migrations and 27 pgTAP assertions pass on a clean local stack, covering tenant reads and representative role write boundaries. No hosted database has been migrated. |
| Database lint and cleanup | CI validated | Local schema lint and always-run Supabase stack cleanup pass in [default-branch CI run](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40476121240). |
| Demo packaging | CI smoke checked | Built HTML shell and JavaScript bundle are served without Supabase credentials. This is an HTTP packaging check, not browser interaction coverage. |
| Test coverage percentage | Not measured | Automated tests exist and pass, but coverage instrumentation/reporting is not configured. Do not claim a percentage. |
| Authentication and authorization | Not production validated | RLS tests are not a complete CRUD/policy audit. Legacy UI routes retain old application assumptions. |
| Live meter adapters | Not implemented | No DLMS/COSEM, OPC UA, MQTT, vendor API, gateway, or hardware-in-the-loop integration. |
| AI, GPU, or LLM service | Not implemented | No model, inference provider, evaluation dataset, AI diagnosis, or GPU dependency. Monitoring and cost logic do not require AI. |
| Payments and authoritative invoices | Not implemented | Legacy payment flags and document screens remain demo code; the new E-bill is an estimate only. There is no payment processor or official invoice workflow. |
| Deployment and operations | Not packaged for production | Hosting, monitoring, incident response, backups, recovery objectives, retention, and service-level commitments remain undefined. |

## Target and non-target

The initial buyer hypothesis is multi-site property or business operators who need a trustworthy view of usage, reading quality, and cost variance. This has not been validated through interviews or a live pilot.

The prototype is not a utility AMI/DISCOM replacement, smart-home controller, payment system, industrial optimization suite, or AI-savings product. The Schneider-linked concept was rejected. Schneider Electric appears only as a competitor in the market landscape; industrial demo records are illustrative.

## Buyer-safe description

> Wattwise is an early-stage browser prototype with synthetic energy scenarios and a local CSV-to-e-bill estimate workflow. It validates interval-energy rows, calculates a configurable flat-tariff estimate, supports a reviewer-entered supplier-total comparison, and generates a clearly labelled PDF. The repository also includes domain tests, CI, an additive Supabase schema draft, and technical documentation. It is not a deployed billing service, official invoicing system, or live meter platform.

Do not claim production authorization, live interoperability, jurisdiction-ready billing, supplier-document parsing, automated reconciliation, AI diagnostics, verified savings, compliance certification, or production security.

## Current listing blockers

1. GitHub reports the repository as **public**. The repository will remain public while product improvements are in progress. Before the final private-supply listing, make the intended snapshot private, verify access, and re-run DataVendor's estimator; public-repository estimates do not establish private-supply eligibility.
2. No customer pilot or buyer interviews have validated the multi-site property/business hypothesis.
3. Git history, checked-in records, external backend state, ownership, contributor rights, generated content, and dependency licenses have not been fully reviewed.
4. The external Supabase project's data and configuration are unknown from this repository review.
5. Coverage percentage is not measured. Report passing tests and CI; do not enter a guessed coverage number.

See [marketplace listing draft](marketplace-listing-draft.md) for copy and the field-by-field evidence checklist.

## Gates before a customer pilot

1. Validate buyer and pain through interviews; select one segment and document accessible meter and bill data.
2. Validate the CSV-to-e-bill workflow with buyer-approved formats, representative tariffs, explicit coverage and variance treatment, and privacy/retention controls.
3. Add archive reference-integrity checks, duplicate/conflict behavior, rollback/transaction boundaries, compatibility rules, and production import design.
4. Expand RLS coverage to the full allowed/denied CRUD matrix and migration upgrade/recovery cases.
5. Validate tariff behavior for timezones/daylight transitions, boundaries, rounding, and customer-specific charges before presenting a production amount.
6. Prototype a real source adapter only after buyer/equipment selection; verify identity binding, replay, ordering, timestamps, units, disconnection, and recovery.
7. Conduct security, privacy, ownership, dependency-license, repository-history, external-backend, backup/restore, and operational review before handling live readings or bills.

Related detail: [product scope](product-scope.md), [architecture](architecture.md), [energy archive format](energy-archive.md), [roadmap](roadmap.md), [market landscape](market-landscape.md), [buyer due diligence](buyer-readiness.md), [source adapter contract](adapter-contract.md), and [demo guide](digital-twin-demo-guide.md).
