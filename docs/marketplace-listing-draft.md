# Wattwise marketplace listing draft

Status: preparation draft as of 28 October 2026. This is review copy, not a published offer. The repository is currently public, so it does not yet qualify for DataVendor's private-codebase estimate or listing. Recheck eligibility and refresh the estimate after repository privacy and rights reviews.

## Suggested listing title

Wattwise — electricity data-quality and tariff-estimation prototype

## Short description

A TypeScript browser prototype for synthetic electricity scenarios and local CSV-to-e-bill estimates. It validates interval-energy readings, applies a configurable flat or two-band local-hour time-of-use tariff, supports a manually entered same-period supplier-total comparison, exports calculation lineage, and generates a clearly labelled PDF estimate. Includes domain tests, pull-request CI, and setup documentation. No authentication, persistent backend, live meter, or production billing service is included.

## Longer description

Wattwise is an early-stage browser prototype exploring how a small multi-site operator could inspect electricity readings, understand data-quality issues, and trace an estimated cost to its source readings and tariff assumptions.

The browser digital twin uses synthetic site and meter records. Its scenarios demonstrate usage spikes, stale data, duplicate events, counter resets, invalid units, and tariff changes. The shared domain code validates measurement types, normalizes supported units, handles batch duplicate IDs, quarantines unproven cumulative-register resets, and rejects missing intervals instead of treating them as zero. A deterministic estimator supports illustrative flat and time-of-use tariffs with effective dates and timezone context. An interactive seven-stage browser animation walks through virtual source, local validation, data quality, site view, estimate, human review, and simulated verification. Playback pauses for a local Accept/Investigate/Defer choice; the verification step stays locked until a choice is made. This is a UI walkthrough, not a video recording or a live data pipeline.

The repository includes a local CSV validation and estimate workflow with a synthetic sample file, source-linked priced segments, a complete calculation CSV export, flat and two-band time-of-use tariff examples, a PDF e-bill generator, a versioned energy-archive format with a browser validation/export workspace, focused automated tests, CI, and product/setup documentation. The demo is intentionally backend-free; it does not include accounts or persistent storage. Time-of-use bands use local clock hours and do not model weekday, holiday, seasonal, or jurisdiction-specific exceptions. Archive files are validated and exported locally; transactional import into an application database is not implemented.

This is a software codebase with synthetic demonstration content. It is not a deployed energy service, official billing system, payment processor, live meter integration, or AI product. No real savings or production outcomes are claimed.

## Buyer-relevant technical material

The code may be useful to teams evaluating software-engineering examples involving:

- TypeScript and React browser application structure
- Measurement kinds, units, timestamps, data quality, and provenance
- Effective-dated tariffs and deterministic cost-estimation logic
- CSV column mapping, row validation, duplicate/conflict handling, and data lineage
- PDF document construction and explicit estimated-versus-authoritative semantics
- Validation, duplicate handling, missing intervals, and quarantined readings
- Synthetic anomaly scenarios and human-review workflow
- Node test patterns, GitHub Actions CI, and a Chromium browser walkthrough

Position this as a compact, domain-specific engineering codebase. The repository does not include a private operational dataset or a generated taskset.

## Included in the repository

- TypeScript/React/Vite browser prototype and synthetic digital-twin scenarios
- Measurement and tariff-estimate domain modules
- Local interval-energy CSV preview, flat-tariff e-bill estimate, synthetic sample, and supplier-total comparison
- Energy archive format v1 validator and browser-based validated export workspace
- GitHub Actions checks for lint, typecheck, measured Node domain coverage, production build, HTTP smoke check, and Playwright Chromium walkthrough
- Setup, architecture, demo, adapter, market, readiness, and archive documentation

## Not included

- Authentication service, application database, hosted backend, credentials, or deployment
- Customer, household, employee, or live meter records
- Live meter, gateway, DLMS/COSEM, OPC UA, MQTT, or vendor integrations
- Production alert delivery, supplier bill upload/parsing, authoritative bills, payment processing, or device control
- Trained AI/LLM model, GPU service, verified savings, compliance certification, or production support
- A promise of exclusivity, ownership transfer, or any particular license scope

## Reproduction and verification

Requirements: Node.js 22+ and npm.

```sh
npm ci
npm run dev
```

For local checks:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run smoke:demo
```

PRs #6, #7, and #8 are merged; draft PR #9 contains the interactive workflow update. PR #9's [CI run 40652826749](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40652826749) passed Node 22/24 and all five Chromium workflows after the database integration was removed. The baseline has 51 passing Node tests and measured coverage of 91.79% lines, 77.43% branches, and 99.05% functions across four JavaScript domain modules only. The [five-image artifact](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40652826749/artifacts/12800032751) includes the interactive review walkthrough and is retained for 30 days.

See the [digital-twin demo guide](digital-twin-demo-guide.md), [interactive workflow walkthrough](interactive-workflow-walkthrough.md), [e-bill workflow guide](ebill-generation.md), and [visual browser walkthrough](ebill-browser-walkthrough.md) for the steps and screenshots. The sample file is synthetic; uploaded files are handled locally in the browser. The Chromium walkthrough checks the downloaded PDF filename, header, estimate, supplier variance, and estimate-only disclosure. Domain tests separately check the PDF structure.

## DataVendor field preparation

| Field | Current evidence | Safe preparation |
|---|---|---|
| Asset type | One software repository | Choose the codebase/repository asset type. Do not describe it as a dataset or taskset. |
| Domain | Electricity/energy software and billing examples | Choose the closest available energy or software domain tags; avoid utility-grade or IoT claims. |
| Asking price | No current seller price selected | Refresh the platform estimate after privacy changes, then choose a price and rights scope. A platform estimate is advisory, not a buyer offer. |
| Tests and coverage | Local run: 51 Node tests; measured coverage across four domain modules | State the run and exact scope: 91.79% lines, 77.43% branches, 99.05% functions. Do not report this as whole-repository or UI/SQL coverage. |
| Browser walkthrough | PR #9 CI run 40652826749 passed all five Chromium workflows, including the review gate and reduced-motion path | Five screenshots are checked in and in the linked CI artifact. Hosted product behavior remains unverified. |
| CI on pull requests | PR #9 run 40652826749 passed Node 22/24, domain tests, production build, smoke check, and browser walkthrough; no database job remains | Describe only these checks. No backend security coverage is claimed. |
| Private code supply | GitHub currently reports this repository as public while improvements are in progress | Do not claim a private-supply quote or publish until the intended final snapshot is private and DataVendor re-scans it. |
| Private/personal data | Current app has no backend or customer records. The local backup had four Auth accounts and zero rows in the five former app tables; aggregate-only checks found three confirmed accounts and two with sign-in history, so treat them as possible personal data. Separate Storage archive and historical key status remain unresolved. | Keep this field unconfirmed until individual Auth records and the Storage archive are reviewed, old-project key status is confirmed/disabled or otherwise accounted for, and remaining data exposure is reviewed. Removing source integration does not revoke a historical key. |

DataVendor's [codebase estimator](https://datavendor.ai/estimator) describes its range as advisory and says public repositories do not qualify for a private-supply quote. Its [source-code listing guide](https://datavendor.ai/blog/sell-source-code-to-ai-companies) recommends explaining included material, runnability, history, tests, and rights. Confirm current listing rules and transaction terms before publishing.

## Publish-readiness gates

1. Finish the planned repository improvements, review their branch CI results, and only then make the intended GitHub snapshot private and re-run DataVendor's checks against that snapshot.
2. Review the targeted [history-secret scan](history-secret-scan.md) finding and generated assets. The scan is pattern-based, not proof that all credentials or personal/customer data are absent. The downloaded backup has four Auth accounts and empty application tables; aggregate metadata suggests they may be used accounts, but individual Auth records and the separate Storage backup remain unreviewed. Removing the integration from this branch does not erase the historical key or revoke it.
3. Review the former hosted backend project, including tables, authentication users, logs, backups, storage, functions, policies, keys, and retention. Decide whether to safely decommission it or retain it under owner control; its state is not known from this repository.
4. Confirm ownership and transfer/licensing rights for all contributors, generated code, fonts, icons, dependencies, and third-party material. GitHub currently reports no repository license metadata.
5. Decide the exact license or sale scope, including AI training/use, derivative works, onward licensing, exclusivity, retention, and buyer access, with qualified advice where needed.
6. Re-scan the intended repository snapshot and use its dated estimate as one input to the asking-price decision. Do not treat the prior screenshot estimate as current or guaranteed.
7. Refresh the measured domain coverage after further code or test changes, and preserve its module scope. Do not enter it as UI, SQL, or whole-repository coverage.
8. Complete 3–5 property/business operator interviews using the [buyer-validation guide](buyer-validation-interview-guide.md). No operator interviews or pilot evidence exist yet. Record anonymized findings before expanding sector or integration scope.
9. Publish only after the private-data answer, rights, price, and delivered revision are confirmed.

The DataVendor estimator and source-code guide are linked for reference. This draft does not accept terms or grant any buyer a license.
