# Wattwise: electricity visibility and bill evidence

Wattwise is a working product name for an early-stage TypeScript browser prototype exploring electricity usage, data quality, tariff-based cost estimates, and reviewable evidence. The initial buyer hypothesis is a small multi-site property or business operator; this need has not been validated through interviews or a live pilot.

This repository is a synthetic demonstration, not a deployed monitoring service, utility billing system, payment processor, or certified meter platform.

## What this prototype includes

- A React/TypeScript browser portfolio of synthetic sites and meters, with scenario controls for spikes, stale data, duplicates, counter resets, invalid units, and tariff changes.
- Shared measurement validation that distinguishes interval energy from cumulative registers, normalizes supported units, detects duplicate event IDs in a batch, quarantines unverified counter resets, and does not turn missing intervals into zero.
- A deterministic flat-rate and time-of-use cost estimator with effective dates, timezone context, and visible assumptions. Results are estimates, not official bills.
- An E-bill workspace that imports interval-energy CSV files locally, maps columns, validates each row, calculates a flat or two-band time-of-use estimate, exposes source-linked priced segments, exports the full calculation CSV, optionally compares a reviewer-entered supplier-stated total for a confirmed matching period, and downloads a PDF estimate.
- A synthetic sample CSV that lets a buyer generate an e-bill without a seller account, database, meter, or customer file.
- A playable seven-stage workflow animation with scenario-aware quality checks, a local Accept/Investigate/Defer decision gate, and a labelled simulated verification. It is an in-app walkthrough, not a video recording or live pipeline.
- A JSON snapshot of the selected synthetic walkthrough. It is not a complete measurement-history export or migration package.
- A versioned energy archive exporter and local import validator with a 10 MiB limit, duplicate-ID and cross-reference checks, and a complete validation report. Imported records are not applied to app state.
- Pull-request CI for Node checks and measured domain coverage, plus a Playwright walkthrough against the built browser app.

All readings and outcomes are synthetic. INR rates and tariff IDs are illustrative. No real savings, AI diagnosis, live hardware interoperability, or regulatory compliance is claimed.

## Run locally

Requirements: Node.js 22 or newer and npm. CI checks Node.js 22 and 24.

```sh
npm ci
npm run dev
```

Open the local Vite URL. Choose a site and scenario, then open Workflow to play the event trace. Playback pauses for a local review choice before the simulated comparison. Choose E-bill to load the synthetic sample or a local CSV, map the columns, review row outcomes, choose a flat or illustrative two-band local-hour tariff, compare a supplier-stated bill total for the same confirmed period, and generate a PDF estimate. Archive exports and imports are available under Archive; imported files are validated locally and never written to a database in this demo. Use View data lineage for the digital-twin source, timestamp, quality, tariff, and calculation context.

See the [digital twin demo guide](docs/digital-twin-demo-guide.md), [interactive workflow walkthrough](docs/interactive-workflow-walkthrough.md), [e-bill workflow guide](docs/ebill-generation.md), and [browser screenshots](docs/ebill-browser-walkthrough.md) for the workflow and CSV details.

## Quality checks

```sh
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run smoke:demo
npm run test:e2e:install -- chromium
npm run test:e2e
```

The demo smoke check verifies that the built HTML shell and JavaScript bundle respond. The Playwright suite exercises CSV upload, accepted/rejected-row validation, flat and time-of-use estimates, a local-hour tariff-boundary split, same-period supplier comparison, complete calculation CSV export, PDF generation, and the interactive workflow's review gate, replay, and reduced-motion controls. All five Chromium tests passed in [PR #9 CI run 40661228872](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40661228872). Its [five-image artifact](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40661228872/artifacts/12804370865) is retained for 30 days. Node coverage reports line, branch, and function coverage for the exercised domain modules; it does not measure the React UI. CI does not verify a production backend or deployment.

## Backend boundary

The current product is a local browser prototype. It has no authentication, database, hosted backend, or environment-specific credentials, and does not persist uploaded readings or bills. The inherited `/login`, `/admin`, and `/user` billing routes and their database integration have been removed. A future backend should be selected and threat-modeled only after a buyer and deployment requirement are validated.

## Product and engineering notes

- [Product scope and pilot gates](docs/product-scope.md)
- [Architecture and data contract](docs/architecture.md)
- [Implementation roadmap](docs/roadmap.md)
- [Feature and readiness matrix](docs/feature-status.md)
- [Local e-bill workflow and CSV contract](docs/ebill-generation.md)
- [Energy archive format and browser workflow](docs/energy-archive.md)
- [Measured domain coverage](docs/domain-coverage.md)
- [Dependency vulnerability and license review](docs/dependency-risk-review.md)
- [History secret-scan report](docs/history-secret-scan.md)
- [Buyer validation interview guide](docs/buyer-validation-interview-guide.md)
- [Source adapter contract](docs/adapter-contract.md)
- [Market landscape and differentiation hypothesis](docs/market-landscape.md)
- [Buyer due-diligence checklist](docs/buyer-readiness.md)
- [Marketplace listing copy draft and readiness gates](docs/marketplace-listing-draft.md)

The listing document is factual draft copy only. PRs #6, #7, and #8 are merged into `main`; PR #9 remains a draft. The repository remains public while due diligence continues. The nine branch histories have been rewritten to remove the historical anonymous client key, but GitHub's closed PR refs #1–#8 may retain old views and the paused project's key status is unconfirmed. Contributor/ownership evidence, dependency license rights, Auth/Storage review, and buyer validation remain open before a private listing snapshot or sale claims are prepared.

Schneider Electric is included in the market landscape as an established competitor. A previously explored Schneider-linked concept was rejected and is not the product direction. The industrial site in the browser remains synthetic demonstration content only.

## Important limits

- No live meter, gateway, DLMS/COSEM, OPC UA, MQTT, or vendor adapter is implemented.
- The twin does not represent a specific board, control a device, or replace hardware-in-the-loop and site validation.
- The rule signal is deterministic. No trained AI model, LLM service, or GPU workload is included.
- The generated e-bill is a locally calculated estimate, not an official invoice or amount due. The current builder supports interval-energy CSV and flat or two-band local-hour time-of-use examples; weekday, holiday, seasonal, jurisdiction-specific rates, and production billing rules remain unsupported.
- Supplier comparison is manual and included only after the reviewer confirms the entered amount covers the same reading period. Supplier document parsing, payment processing, persistent bill records, and official invoices are not implemented.
- No authentication, database, persistence, or server-side authorization is included. The current local demo has no customer records or connected backend.
- Legacy account, payment, and bill-document routes were removed; the current PDF estimate is a separate local workflow and collects no payment.
- GitHub currently reports this repository as public and has no license metadata. Repository history, checked-in records, external backend state, ownership, licenses, and contributor rights need review before marketplace claims or transfer.
- Automated tests run in CI. Coverage is measured only for the four JavaScript domain modules; see the [coverage report](docs/domain-coverage.md).

Long-term resilience comes from replaceable adapters and providers, versioned schemas, portable data, and deterministic calculations. No board, protocol, cloud, AI model, or framework can credibly be promised to last 30–40 years.
