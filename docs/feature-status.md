# Feature and readiness matrix

Status snapshot: 16 October 2026, branch `codex/cross-sector-energy-intelligence`. This is an implementation inventory for reviewers and buyers. “Implemented” means present in this repository; it does not mean production validated, deployed, certified, or supported against live equipment.

## Product capability status

| Capability | Current status | Evidence / limit |
|---|---|---|
| Portfolio and site profiles | **Synthetic demo** | Browser twin shows home, office, and industrial examples. Values and site records are illustrative. |
| Source-to-dashboard workflow | **Local simulation** | Twin runs sample events through in-process checks and displays their outcomes. There is no production ingestion endpoint or persistent stream. |
| Hardware abstraction | **Design direction** | No board, ESP32, relay, or physical device is required by the demo. No field gateway or live meter adapter is implemented. |
| Canonical measurement handling | **Implemented domain slice** | Schema-1 validation, supported unit conversion, quality quarantine, in-batch event-ID deduplication, and cumulative-register delta helper live in `src/domain/energyModel.mjs`. Durable idempotency and register history are absent. |
| Data freshness and quality | **Demo and domain checks** | The twin illustrates stale, duplicate, reset, and spike scenarios. It does not monitor a live source or implement operational alert delivery. |
| Cost estimate | **Deterministic estimate** | Flat and time-of-use paths use tariff currency, version, timezone, and effective window; incomplete gaps and overlaps are rejected. This is not a jurisdiction-ready billing engine. |
| Time-of-use boundaries | **Partial** | The estimate selects a tariff by the interval's start hour. It does not split an interval that crosses a tariff boundary or validate all tariff-period overlap cases. |
| Official bills and payments | **Legacy/demo only** | The inherited login/admin/user screens depend on the old Supabase schema. Payment state is not a payment processor and the new migration does not convert that schema. |
| Industrial energy per good unit | **Illustrative scenario** | Watt2Yield is used as a product reference for context, throughput/quality guardrails, operator decisions, and matched-period verification. No measured factory data or savings claim exists. |
| Action and savings verification | **Simulated evidence loop** | The twin demonstrates a human decision and simulated before/after state. It does not prove causality or measured savings. |
| AI, GPU, or LLM analysis | **Not implemented** | No trained model, inference service, GPU dependency, model evaluation, or LLM flow exists. Core demo and estimate code do not require them. |
| Multi-tenant database | **Schema draft** | Additive Supabase migration defines a cross-sector foundation. It has not been applied to a hosted database or adversarially tested for tenant isolation. |
| Authentication and authorization | **Not production validated** | Legacy routes use the existing Supabase client and old data expectations. Frontend route checks are not a server-side authorization boundary. |
| Data export/import | **Not implemented** | No portable measurement history migration/export workflow is included yet. |
| Real integrations | **Not implemented** | DLMS/COSEM, OPC UA, MQTT, vendor APIs, gateway and hardware-in-the-loop integrations remain future work. See [source adapter contract](adapter-contract.md). |
| Automated checks | **Starter CI and domain tests** | Node built-in tests cover selected domain behaviors; CI runs lint, typecheck, tests, and production build. UI, migration, RLS, and live integration paths are not covered by those tests. |
| Deployment and operations | **Not packaged for production** | The repository has a local Vite demo and setup notes. No supported production hosting, monitoring, backup, incident, or service-level commitment is defined. |

## Profile matrix

| Profile | What a reviewer can see now | Context required before a real metric or recommendation |
|---|---|---|
| Home | Synthetic consumption pattern, cost estimate, and portfolio/site navigation. | Real meter readings and interval semantics; applicable tariff and billing rules; generation/storage signals before reporting imports, exports, or self-consumption. |
| Office/building | Synthetic site and meter view, freshness and comparisons in the demo workflow. | Meter-to-area mapping, floor area and occupancy definitions, timezone, operating schedule, and comparable periods before normalization or benchmarking. |
| Industrial | Watt2Yield-inspired sample connecting energy with operating/output context and a human-reviewed intervention story. | Meter-to-machine/line mapping, machine state, cycle boundaries, good/reject counts, product/load mix, throughput and quality guardrails, and matched baseline periods before energy-per-good-unit or savings claims. |

Shared screens do not make the three sectors equally validated. Use a metric only when the underlying context and data quality are present; show “unknown” or “incomplete” when they are not.

## Buyer-safe description today

> A browser-based, synthetic cross-sector energy monitoring prototype with an in-process measurement normalization and deterministic cost-estimate module, a Watt2Yield-inspired industrial example, and starter CI/domain tests.

Do not describe this snapshot as utility AMI, a deployed multi-tenant service, a production billing or payment platform, live hardware interoperability, AI-powered diagnostics, certified compliance, or a proven energy-savings product.

## Release gates before a pilot

1. Run from a clean checkout with no seller-owned credentials; make the core demo deterministic and clearly synthetic.
2. Test the full tariff contract, including intervals that cross TOU boundaries, daylight/timezone behavior, effective-date boundaries, missing tariff coverage, and rounding rules.
3. Add UI behavior tests and database migration/RLS tests using separate synthetic tenants; fix access boundaries before loading customer data.
4. Apply schema migrations to a disposable buyer-owned environment; verify rollback/recovery and export/import semantics.
5. Implement one real connector for identified equipment only after validating permissions, source mapping, units, timestamps, replay, and failure behavior.
6. Obtain site-specific evidence before presenting industrial performance or savings; preserve throughput and quality guardrails alongside energy metrics.
7. Complete ownership, dependency-license, repository-history, external-backend, privacy, and operational-readiness review before marketplace claims or transfer.

Related detail: [architecture](architecture.md), [implementation roadmap](roadmap.md), [market landscape](market-landscape.md), [buyer due diligence](buyer-readiness.md), and [adapter contract](adapter-contract.md).
