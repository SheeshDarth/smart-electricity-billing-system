# Feature and readiness matrix

Status snapshot: 21 October 2026, branch codex/archive-demo-readiness. Implemented means code exists in this repository; it does not mean deployed, certified, validated with live equipment, or ready for customer data.

## Product capability status

| Capability | Status | Evidence and limit |
|---|---|---|
| Browser site and meter views | Synthetic demo | Uses illustrative home, office, and industrial records; only electricity usage and cost examples are in scope. |
| Source-to-dashboard workflow | Local simulation | Twin readings pass through in-process validation; there is no production ingestion API, queue, or persistent stream. |
| Measurement normalization | Implemented domain slice | Schema validation, supported unit conversion, quality outcomes, batch event-ID deduplication, and cumulative-register delta helper in src/domain/energyModel.mjs. No durable idempotency or register history. |
| Data freshness and quality | Demo and domain checks | Stale, duplicate, reset, invalid-unit, and spike cases are simulated. No live monitoring or operational alert delivery. |
| Flat/time-of-use estimate | Implemented deterministic domain logic | Effective date, currency, timezone, tariff version, interval allocation, and incomplete/gap rejection are handled. It is an estimate, not an official bill. |
| Tariff coverage | Incomplete for production | Taxes, fixed/demand charges, adjustments, meter multipliers, net-metering, jurisdiction rounding, and daylight-saving validation remain open. |
| Utility bill comparison | Planned | Bill-to-estimate variance, reconciliation workflow, document input, and reviewer evidence are not implemented. |
| Human review and outcome | Synthetic workflow | The browser demonstrates a local decision and simulated verification. It does not create a persistent intervention or prove savings. |
| Energy archive schema v1 | Implemented domain utility | src/domain/energyArchive.mjs validates required top-level arrays and basic measurement fields, and serializes at most 10 MiB. It has no UI/database integration, entity relation checks, import transaction, or dedicated tests. |
| Supabase multi-tenant schema | CI validated locally | Additive migrations and 27 pgTAP assertions pass on a clean local stack, covering tenant reads and representative role write boundaries. No hosted database has been migrated. |
| Database lint and cleanup | CI validated | Local schema lint and always-run Supabase stack cleanup passed in [CI run 48](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/39563511978). |
| Authentication and authorization | Not production validated | RLS tests are not a complete CRUD/policy audit. Legacy UI routes retain old application assumptions. |
| Live meter adapters | Not implemented | No DLMS/COSEM, OPC UA, MQTT, vendor API, gateway, or hardware-in-the-loop integration. |
| AI, GPU, or LLM service | Not implemented | No model, inference provider, evaluation dataset, AI diagnosis, or GPU dependency. Monitoring and cost domain logic do not require AI. |
| Payments and authoritative invoices | Not implemented | Legacy payment flags and document screens are demo code; there is no payment processor or official invoice workflow. |
| Deployment and operations | Not packaged for production | Hosting, monitoring, incident response, backups, recovery objectives, retention, and service-level commitments remain undefined. |

## Target and non-target

The initial buyer hypothesis is multi-site property or business operators who need a trustworthy view of usage, reading quality, and cost variance. It has not been validated by interviews or a pilot. The first evaluation scenario should use a few meters, one explicit tariff, an incomplete/stale data case, and a bill comparison when that planned feature exists.

The product is not a utility AMI/DISCOM replacement, smart-home controller, payment system, industrial optimization suite, or AI-savings product. The Schneider-linked concept was rejected. Schneider Electric products remain listed only as a competitor in the market landscape. Industrial records in the demo are illustrative, not a roadmap commitment.

## Buyer-safe description today

> A synthetic browser prototype for electricity readings and tariff-based cost estimates, with in-process data-quality handling, a scenario workflow, an additive Supabase schema, and a versioned JSON archive utility. It is not a deployed billing service or live meter platform.

Do not claim production authorization, live interoperability, jurisdiction-ready billing, bill upload/reconciliation, AI diagnostics, verified savings, compliance certification, or sale-ready data privacy.

## Gates before a customer pilot

1. Validate buyer and pain through interviews; select one segment and document accessible meter and bill data.
2. Complete an end-to-end bill comparison using test documents, stable tariff inputs, explicit variance treatment, and privacy/retention controls.
3. Add archive reference-integrity checks, duplicate/conflict behavior, rollback/transaction boundaries, compatibility rules, and production import design.
4. Expand RLS coverage to the full allowed/denied CRUD matrix and migration upgrade/recovery cases.
5. Validate tariff behavior for timezones/daylight transitions, boundaries, rounding, and customer-specific charges before presenting a production amount.
6. Prototype a real source adapter only after buyer/equipment selection; verify identity binding, replay, ordering, timestamps, units, disconnection, and recovery.
7. Conduct security, privacy, ownership, dependency-license, repository-history, external-backend, backup/restore, and operational review before handling live readings or bills.

Related detail: [product scope](product-scope.md), [architecture](architecture.md), [energy archive format](energy-archive.md), [roadmap](roadmap.md), [market landscape](market-landscape.md), [buyer due diligence](buyer-readiness.md), [source adapter contract](adapter-contract.md), and [demo guide](digital-twin-demo-guide.md).
