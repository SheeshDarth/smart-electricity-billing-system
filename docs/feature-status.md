# Feature and readiness matrix

Status snapshot: 19 October 2026, PR #4 branch codex/phase2-db-rls-validation. “Implemented” means present in this repository; it does not mean production validated, deployed, certified, or supported against live equipment. CI run #34 validates the local migration, RLS suite, and Node checks; no hosted Supabase database was changed.

## Product capability status

| Capability | Current status | Evidence and limit |
|---|---|---|
| Portfolio and site profiles | **Synthetic demo** | Browser twin shows home, office, and industrial examples. Values and site records are illustrative. |
| Source-to-dashboard workflow | **Local simulation** | Sample events pass through in-process checks and are visible in the workflow. There is no production ingestion endpoint or persistent stream. |
| Hardware abstraction | **Design direction** | No board, ESP32, relay, or physical device is required by the demo. No field gateway or live meter adapter is implemented. |
| Canonical measurement handling | **Implemented domain slice** | Schema-1 validation, supported unit conversion, quality quarantine, in-batch event-ID deduplication, and a cumulative-register delta helper live in src/domain/energyModel.mjs. Durable idempotency and register history are absent. |
| Data freshness and quality | **Demo and domain checks** | The twin illustrates stale, duplicate, reset, invalid-unit, and spike scenarios. It does not monitor live sources or deliver operational alerts. |
| Cost estimate | **Deterministic estimate** | Flat and time-of-use paths use tariff currency, version, timezone, and effective window. Gaps, overlaps, and uncovered tariff segments are rejected. Output is an estimate, not a jurisdiction-ready bill. |
| Time-of-use boundaries | **Implemented with validation gaps** | The calculator allocates interval energy by elapsed time and splits at local-hour boundaries. Tests now cover a boundary split and overlapping periods. Daylight-saving transitions, production tariff catalogs, and jurisdiction-specific rules still need validation. |
| Official bills and payments | **Legacy/demo only** | Inherited login/admin/user screens depend on the old Supabase schema. Payment state is not a payment processor, and the new migration does not convert that schema. |
| Industrial energy per good unit | **Illustrative scenario** | Watt2Yield informs context, throughput/quality guardrails, operator decisions, and matched-period verification. No measured factory data or savings claim exists. |
| Action and savings verification | **Simulated evidence loop** | The twin demonstrates a human decision and simulated before/after state. It does not prove causality or measured savings. |
| AI, GPU, or LLM analysis | **Not implemented** | No trained model, inference service, GPU dependency, model evaluation, or LLM flow exists. Core demo and estimate code do not require them. |
| Multi-tenant database | **CI validated locally** | Fresh local Supabase migration passes in CI run #34. 27 pgTAP assertions cover tenant-scoped reads on all 12 tables and representative viewer/operator/admin/owner write boundaries. No hosted project was migrated; full CRUD/policy matrix and rollback remain open. |
| Authentication and authorization | **Not production validated** | Legacy routes retain old application assumptions. Frontend route checks are not a server-side authorization boundary. |
| Evidence export | **Synthetic snapshot only** | The UI exports selected scenario, twin results, estimate, operator decision, and timestamp as JSON. Measurement-history export/import and buyer migration are not implemented. |
| Real integrations | **Not implemented** | DLMS/COSEM, OPC UA, MQTT, vendor APIs, gateways, and hardware-in-the-loop integrations remain future work. See [source adapter contract](adapter-contract.md). |
| Automated checks | **CI passing for current checks** | PR #4 CI run #34 passes Node 22/24 lint, typecheck, domain tests, production build, local Supabase migration, and 27 pgTAP assertions. UI interaction, full RLS CRUD matrix, export/import, daylight-boundary, and live integration remain uncovered. |
| Deployment and operations | **Not packaged for production** | The repository has a local Vite demo and setup notes. Supported hosting, monitoring, backup, incident, and service-level commitments are undefined. |

## Profile matrix

| Profile | What a reviewer can see now | Context required before a real metric or recommendation |
|---|---|---|
| Home | Synthetic consumption pattern, cost estimate, and portfolio/site navigation. | Real meter readings and interval semantics; applicable tariff and billing rules; generation/storage signals before reporting imports, exports, or self-consumption. |
| Office/building | Synthetic site and meter view, freshness, and comparisons in the demo workflow. | Meter-to-area mapping, floor area and occupancy definitions, timezone, operating schedule, and comparable periods before normalization or benchmarking. |
| Industrial | Watt2Yield-inspired sample connecting energy with operating/output context and a human-reviewed intervention story. | Meter-to-machine/line mapping, machine state, cycle boundaries, good/reject counts, product/load mix, throughput and quality guardrails, and matched baseline periods before energy-per-good-unit or savings claims. |

Shared screens do not mean the three sectors are equally validated. Use a metric only when the required context and data quality are present; show unknown or incomplete when they are not.

## Buyer-safe description today

> A browser-based, synthetic cross-sector energy monitoring prototype with in-process measurement normalization, deterministic cost estimates, a scenario evidence export, a Watt2Yield-inspired industrial example, and CI-validated local migration/RLS tests.

Do not describe this snapshot as utility AMI, a deployed multi-tenant service, a production billing or payment platform, live hardware interoperability, AI-powered diagnostics, certified compliance, or a proven energy-savings product.

## Release gates before a pilot

1. Run from a clean checkout with no seller-owned credentials; keep the core demo deterministic and clearly synthetic.
2. Validate the full tariff contract, including intervals crossing TOU boundaries, daylight-saving and timezone behavior, effective-date boundaries, missing tariff coverage, precision, and rounding.
3. Add UI behavior tests and expand role-based database CRUD coverage; the clean local migration and current 27-assertion RLS suite pass in CI.
4. Apply migrations to a disposable buyer-owned environment; verify rollback, recovery, and portable export/import semantics.
5. Implement a real connector only for identified equipment and validate permissions, source mapping, units, timestamps, replay, and failure behavior.
6. Obtain site-specific evidence before presenting industrial performance or savings; preserve throughput and quality guardrails alongside energy metrics.
7. Complete ownership, dependency-license, repository-history, external-backend, privacy, and operational-readiness review before marketplace claims or transfer.

Related detail: [architecture](architecture.md), [implementation roadmap](roadmap.md), [market landscape](market-landscape.md), [buyer due diligence](buyer-readiness.md), [adapter contract](adapter-contract.md), and [digital-twin demo guide](digital-twin-demo-guide.md).
