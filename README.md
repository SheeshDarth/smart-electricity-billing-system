# Wattwise: electricity visibility and bill evidence

Wattwise is a working product name for an early-stage TypeScript browser prototype exploring electricity usage, data quality, tariff-based cost estimates, and reviewable evidence. The initial buyer hypothesis is a small multi-site property or business operator; this need has not been validated through interviews or a live pilot.

This repository is a synthetic demonstration, not a deployed monitoring service, utility billing system, payment processor, or certified meter platform.

## What this prototype includes

- A React/TypeScript browser portfolio of synthetic sites and meters, with scenario controls for spikes, stale data, duplicates, counter resets, invalid units, and tariff changes.
- Shared measurement validation that distinguishes interval energy from cumulative registers, normalizes supported units, detects duplicate event IDs in a batch, quarantines unverified counter resets, and does not turn missing intervals into zero.
- A deterministic flat-rate and time-of-use cost estimator with effective dates, timezone context, and visible assumptions. Results are estimates, not official bills.
- A workflow view tracing sample events through validation, site summaries, a signal, human review, and simulated verification.
- A JSON snapshot of the selected synthetic walkthrough. It is not a complete measurement-history export or migration package.
- A versioned energy archive parser/serializer with dedicated validation tests and a 10 MiB input limit. It remains a domain utility, not connected to the UI, database, or import/export workflow.
- An additive Supabase schema for organizations, roles, sites, meters, readings, tariffs, billing runs, insights, and interventions. It has not been applied to any hosted project.
- Pull-request CI for Node checks, a built-demo HTTP smoke check, local Supabase migration, pgTAP, database lint, and stack cleanup.

All readings and outcomes are synthetic. INR rates and tariff IDs are illustrative. No real savings, AI diagnosis, live hardware interoperability, or regulatory compliance is claimed.

## Run locally

Requirements: Node.js 22 or newer and npm. CI checks Node.js 22 and 24.

```sh
npm ci
npm run dev
```

Open the local Vite URL. Choose a site and scenario, then open Workflow to follow the event trace. Use View data lineage for source, timestamp, quality, tariff, and calculation context. The evidence JSON control saves the current synthetic walkthrough.

See the [digital twin demo guide](docs/digital-twin-demo-guide.md) for scenario details.

## Quality checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run smoke:demo
```

The demo smoke check serves the built site locally without Supabase credentials and verifies that the HTML shell and JavaScript bundle respond. It is an HTTP packaging check, not an automated browser interaction test. The GitHub Actions workflow also starts a disposable local Supabase stack, applies migrations, runs database tests and lint, then stops the stack. These checks do not validate a hosted database or production deployment. [PR CI run 57](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/39590374920) passed on Node 22 and 24 and passed the disposable database checks.

## Optional Supabase configuration

The browser twin runs without Supabase. The inherited `/login`, `/admin`, and `/user` routes are legacy billing screens and are not part of the current demo flow; they still expect the old application tables. To exercise them, configure a buyer-owned Supabase project with the appropriate schema and environment variables. Never place a service-role key in browser code or this repository.

The new migration is additive and does not convert the legacy billing tables. Repository history and any external backend still require separate review before transfer or sale.

## Product and engineering notes

- [Product scope and pilot gates](docs/product-scope.md)
- [Architecture and data contract](docs/architecture.md)
- [Implementation roadmap](docs/roadmap.md)
- [Feature and readiness matrix](docs/feature-status.md)
- [Energy archive format v1](docs/energy-archive.md)
- [Source adapter contract](docs/adapter-contract.md)
- [Market landscape and differentiation hypothesis](docs/market-landscape.md)
- [Buyer due-diligence checklist](docs/buyer-readiness.md)
- [Marketplace listing copy draft and readiness gates](docs/marketplace-listing-draft.md)

The listing document is factual draft copy only. The repository is currently public, the external Supabase state and full rights position are unverified, and PR #5 is not merged to `main`. Complete those checks and use the intended private snapshot before publishing any marketplace offer or setting its price.

Schneider Electric is included in the market landscape as an established competitor. A previously explored Schneider-linked concept was rejected and is not the product direction. The industrial site in the browser remains synthetic demonstration content only.

## Important limits

- No live meter, gateway, DLMS/COSEM, OPC UA, MQTT, or vendor adapter is implemented.
- The twin does not represent a specific board, control a device, or replace hardware-in-the-loop and site validation.
- The rule signal is deterministic. No trained AI model, LLM service, or GPU workload is included.
- The sample tariff is not jurisdiction-specific. Production billing requires validated tariff rules, taxes and fees, timezone and daylight-boundary behavior, rounding, and local review.
- The new schema has local CI coverage, but hosted deployment, complete authorization review, recovery, and production readiness remain open.
- The legacy payment flag and bill document flow are demo code, not payment processing or production invoicing.
- GitHub currently reports this repository as public and has no license metadata. Repository history, checked-in records, external backend state, ownership, licenses, and contributor rights need review before marketplace claims or transfer.
- Automated tests pass in CI, but test coverage percentage is not currently measured.

Long-term resilience comes from replaceable adapters and providers, versioned schemas, portable data, and deterministic calculations. No board, protocol, cloud, AI model, or framework can credibly be promised to last 30–40 years.
