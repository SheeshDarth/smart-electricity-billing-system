# Wattwise: electricity visibility and bill evidence

Wattwise is a working product name for an early-stage TypeScript browser prototype exploring electricity usage, data quality, tariff-based cost estimates, and reviewable evidence. The initial buyer hypothesis is a small multi-site property or business operator; this need has not been validated through interviews or a live pilot.

This repository is a synthetic demonstration, not a deployed monitoring service, utility billing system, payment processor, or certified meter platform.

## What this prototype includes

- A React/TypeScript browser portfolio of synthetic sites and meters, with scenario controls for spikes, stale data, duplicates, counter resets, invalid units, and tariff changes.
- Shared measurement validation that distinguishes interval energy from cumulative registers, normalizes supported units, detects duplicate event IDs in a batch, quarantines unverified counter resets, and does not turn missing intervals into zero.
- A deterministic flat-rate and time-of-use cost estimator with effective dates, timezone context, and visible assumptions. Results are estimates, not official bills.
- An E-bill workspace that imports interval-energy CSV files locally, maps columns, validates each row, calculates an explicit flat tariff estimate, optionally compares a reviewer-entered supplier-stated total for a confirmed matching period, and downloads a PDF estimate.
- A synthetic sample CSV that lets a buyer generate an e-bill without a seller account, database, meter, or customer file.
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

Open the local Vite URL. Choose a site and scenario, then open Workflow to follow the event trace. Choose E-bill to load the synthetic sample or a local CSV, map the columns, review row outcomes, set the flat rate, and generate a PDF estimate. Use View data lineage for the digital-twin source, timestamp, quality, tariff, and calculation context.

See the [digital twin demo guide](docs/digital-twin-demo-guide.md) and [e-bill workflow guide](docs/ebill-generation.md) for walkthrough and CSV details.

## Quality checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run smoke:demo
```

The demo smoke check serves the built site locally without Supabase credentials and verifies that the HTML shell and JavaScript bundle respond. It is an HTTP packaging check, not an automated browser interaction test. The GitHub Actions workflow also starts a disposable local Supabase stack, applies migrations, runs database tests and lint, then stops the stack. These checks do not validate a hosted database or production deployment. [default-branch CI run](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40476121240) passed on Node 22 and 24 and passed the disposable database checks.

## Optional Supabase configuration

The browser twin runs without Supabase. The inherited `/login`, `/admin`, and `/user` routes are legacy billing screens and are not part of the current demo flow; they still expect the old application tables. To exercise them, configure a buyer-owned Supabase project with the appropriate schema and environment variables. Never place a service-role key in browser code or this repository.

The new migration is additive and does not convert the legacy billing tables. Repository history and any external backend still require separate review before transfer or sale.

## Product and engineering notes

- [Product scope and pilot gates](docs/product-scope.md)
- [Architecture and data contract](docs/architecture.md)
- [Implementation roadmap](docs/roadmap.md)
- [Feature and readiness matrix](docs/feature-status.md)
- [Local e-bill workflow and CSV contract](docs/ebill-generation.md)
- [Energy archive format v1](docs/energy-archive.md)
- [Source adapter contract](docs/adapter-contract.md)
- [Market landscape and differentiation hypothesis](docs/market-landscape.md)
- [Buyer due-diligence checklist](docs/buyer-readiness.md)
- [Marketplace listing copy draft and readiness gates](docs/marketplace-listing-draft.md)

The listing document is factual draft copy only. PR #6 merged into `main` on 27 October 2026. The current e-bill workflow changes are under development and must pass pull-request CI before merge. The repository is intentionally staying public while improvements are in progress; external Supabase state and the full rights position are unverified. Complete the technical and due-diligence work first, then make the intended listing snapshot private and refresh the platform estimate before publishing an offer or setting its price.

Schneider Electric is included in the market landscape as an established competitor. A previously explored Schneider-linked concept was rejected and is not the product direction. The industrial site in the browser remains synthetic demonstration content only.

## Important limits

- No live meter, gateway, DLMS/COSEM, OPC UA, MQTT, or vendor adapter is implemented.
- The twin does not represent a specific board, control a device, or replace hardware-in-the-loop and site validation.
- The rule signal is deterministic. No trained AI model, LLM service, or GPU workload is included.
- The generated e-bill is a locally calculated estimate, not an official invoice or amount due. The current builder supports interval-energy CSV and a flat tariff; production billing requires validated tariff rules, taxes and fees, timezone and daylight-boundary behavior, rounding, and local review.
- Supplier comparison is manual and included only after the reviewer confirms the entered amount covers the same reading period. Supplier document parsing, payment processing, persistent bill records, and official invoices are not implemented.
- The new schema has local CI coverage, but hosted deployment, complete authorization review, recovery, and production readiness remain open.
- The legacy payment flag and old bill document flow remain demo code; the new PDF estimate is a separate local workflow and does not collect payment.
- GitHub currently reports this repository as public and has no license metadata. Repository history, checked-in records, external backend state, ownership, licenses, and contributor rights need review before marketplace claims or transfer.
- Automated tests pass in CI, but test coverage percentage is not currently measured.

Long-term resilience comes from replaceable adapters and providers, versioned schemas, portable data, and deterministic calculations. No board, protocol, cloud, AI model, or framework can credibly be promised to last 30–40 years.
