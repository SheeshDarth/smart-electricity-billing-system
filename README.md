# Wattwise: cross-sector energy intelligence prototype

**Wattwise is a working product name.** This repository is being repositioned from a single smart-socket billing demo into a hardware-agnostic energy monitoring and evidence workflow. The current release is a browser simulation for buyer evaluation; it is not a utility billing product or a deployed meter platform.

## What works in this branch

- A portfolio view with synthetic home, office, and industrial sites.
- A browser digital twin with normal, usage-spike, stale-source, duplicate-event, counter-reset, and tariff-change scenarios. No board, ESP32, relay, or physical device is represented.
- A visible workflow from source event through schema/quality checks, normalized site data, a deterministic signal, a human decision, and a simulated verification state.
- A canonical measurement module that distinguishes interval energy from cumulative registers, normalizes supported units, suppresses duplicate event IDs, quarantines unverified counter resets, and refuses to turn missing intervals into zero.
- A deterministic tariff estimate function with effective windows and timezone-aware time-of-use periods. Its output is an estimate; it does not issue bills or decide payment state.
- A Supabase migration foundation for organizations, roles, sites, meters, readings, tariffs, billing runs, insights, and intervention evidence. It is additive and has not been applied to any hosted project.
- Pull-request CI for lint, TypeScript checks, domain tests, and the production build.

All visible readings and outcomes in the dashboard are synthetic. The ₹8/kWh demo rate and tariff IDs are illustrative. No measured saving, AI diagnosis, regulatory compliance, or real hardware interoperability is claimed.

## Run locally

Requirements: Node.js 22 or newer and npm. Node.js 24 LTS is the CI target.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Choose a site in the left portfolio panel, choose a twin scenario, then open **Workflow** to follow the event trace. Use **View data lineage** for source, timestamp, quality, tariff, and calculation context.

## Quality checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub Actions runs these checks for pull requests and pushes to [main. Tests use Node's built-in test runner and do not require a hosted database or credentials.

## Optional Supabase configuration

The browser digital twin starts without Supabase. The inherited /login, /admin, and /user routes are legacy billing screens; they are not part of the new demo flow and still expect the old application tables. To exercise them, create a buyer-owned Supabase project, review and apply the appropriate migrations, then copy .env.example to .env.local and enter that project's URL and browser-safe publishable/anon key. Never put a service-role key in the browser or in this repository.

The new migration creates the cross-sector schema only. It does not create or convert the legacy billing tables. The repository's current client no longer contains a project URL or key, but a repository-history and external-backend review is still required before sale or transfer.

## Product and architecture notes

- [Architecture and data contract](docs/architecture.md)
- [Implementation gates and validation plan](docs/roadmap.md)
- [Market landscape and differentiation hypothesis](docs/market-landscape.md)
- [Buyer due-diligence checklist](docs/buyer-readiness.md)

The industrial example follows the Watt2Yield project's evidence discipline: relate energy to good output when those signals exist, present a deviation with its context, ask an operator to decide, and verify a matched before/after period while guarding throughput and quality. The dashboard keeps this as an illustrative scenario; it does not reuse Schneider source code or assert factory savings.

## Important limits before a pilot or sale

- No live meter, DLMS/COSEM, OPC UA, MQTT, gateway, or device connector is implemented. Those are future adapter options, not supported features today.
- The twin exercises validation logic but is not a substitute for hardware-in-the-loop, site data, or safety testing.
- The rule signal is deterministic. There is no trained AI model, LLM dependency, GPU workload, or verified model evaluation in this release.
- The sample tariff is not jurisdiction-specific. Production billing needs tariff review, time-zone and daylight-boundary tests, taxes/fees, rounding rules, and local legal review.
- The migration's row-level security policies need execution against a clean Supabase instance and adversarial tenant-isolation tests before production use. No hosted database has been changed by this work.
- The original billing screens, payment flag, and bill document flow have not been converted into production payment or invoicing. Treat them as legacy demonstration code.
- The GitHub repository is currently public. Repository history, Supabase project state, checked-in records, contributor ownership, and any Lovable relationship need review before making an exclusivity or private-data claim.

The architecture targets replaceable sources, schema-versioned data, portable exports, deterministic cost calculation, and optional AI. A promise that a particular board, protocol, model, or hosting provider will last 30–40 years would be misleading.
