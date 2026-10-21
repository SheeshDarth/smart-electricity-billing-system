# Wattwise: electricity visibility and bill evidence

Wattwise is a working product name for a browser prototype that explores electricity usage, data quality, tariff-based cost estimates, and reviewable evidence. The initial product hypothesis is a lightweight way for multi-site property or business operators to understand readings and compare them with bills. This buyer and need are not yet validated.

This repository is a synthetic demonstration, not a deployed monitoring service, utility billing system, payment processor, or certified meter platform.

## What works in this branch

- A browser-based portfolio of synthetic sites and meters, with scenario controls for spikes, stale data, duplicates, counter resets, invalid units, and tariff changes.
- A shared measurement validator that distinguishes interval energy from cumulative registers, normalizes supported units, detects duplicate event IDs in a batch, quarantines unverified counter resets, and does not turn missing intervals into zero.
- A deterministic flat-rate and time-of-use cost estimator with effective dates, timezone context, and visible assumptions. Results are estimates, not official bills.
- A workflow view that traces sample events through validation, site summaries, a signal, a human review, and simulated verification.
- A JSON snapshot of the selected synthetic walkthrough. It is not a complete measurement-history export or migration package.
- A versioned energy archive parser/serializer with schema validation and a 10 MiB input limit. It is a domain utility only; it is not connected to the UI, database, or import/export workflow.
- An additive Supabase schema for organizations, roles, sites, meters, readings, tariffs, billing runs, insights, and interventions. It has not been applied to any hosted project.
- Pull-request CI for Node checks plus local Supabase migration, pgTAP, database lint, and stack cleanup.

All readings and outcomes are synthetic. INR rates and tariff IDs are illustrative. No real savings, AI diagnosis, live hardware interoperability, or regulatory compliance is claimed.

## Run locally

Requirements: Node.js 22 or newer and npm. CI checks Node.js 22 and 24.

    npm ci
    npm run dev

Open the local Vite URL. Choose a site and scenario, then open Workflow to follow the event trace. Use View data lineage for source, timestamp, quality, tariff, and calculation context. The evidence JSON control saves the current synthetic walkthrough.

See the [digital twin demo guide](docs/digital-twin-demo-guide.md) for scenario details.

## Quality checks

    npm run lint
    npm run typecheck
    npm test
    npm run build

The GitHub Actions workflow also starts a disposable local Supabase stack, applies migrations, runs database tests and lint, then stops the stack. These checks do not validate a hosted database or production deployment.

## Optional Supabase configuration

The browser twin runs without Supabase. The inherited /login, /admin, and /user routes are legacy billing screens and are not part of the current demo flow; they still expect the old application tables. To exercise them, configure a buyer-owned Supabase project with the appropriate schema and environment variables. Never place a service-role key in browser code or this repository.

The new migration is additive and does not convert the legacy billing tables. Repository history and any external backend still require separate review before transfer or sale.

## Product and engineering notes

- [Product scope and pilot gates](docs/product-scope.md)
- [Architecture and data contract](docs/architecture.md)
- [Implementation roadmap](docs/roadmap.md)
- [Feature and readiness matrix](docs/feature-status.md)
- [Source adapter contract](docs/adapter-contract.md)
- [Market landscape and differentiation hypothesis](docs/market-landscape.md)
- [Buyer due-diligence checklist](docs/buyer-readiness.md)

Schneider Electric is included in the market landscape as an established competitor. A previously explored Schneider-linked concept was rejected and is not the product direction. The industrial site in the browser remains synthetic demonstration content only.

## Important limits

- No live meter, gateway, DLMS/COSEM, OPC UA, MQTT, or vendor adapter is implemented.
- The twin does not represent a specific board, control a device, or replace hardware-in-the-loop and site validation.
- The rule signal is deterministic. No trained AI model, LLM service, or GPU workload is included.
- The sample tariff is not jurisdiction-specific. Production billing requires validated tariff rules, taxes and fees, timezone and daylight-boundary behavior, rounding, and local review.
- The new schema has local CI coverage, but hosted deployment, complete authorization review, recovery, and production readiness remain open.
- The legacy payment flag and bill document flow are demo code, not payment processing or production invoicing.
- The GitHub repository is currently public. Repository history, checked-in records, external backend state, ownership, licenses, and contributor rights need review before marketplace claims or transfer.

Long-term resilience comes from replaceable adapters and providers, versioned schemas, portable data, and deterministic calculations. No board, protocol, cloud, AI model, or framework can credibly be promised to last 30–40 years.
