# Wattwise marketplace listing draft

Status: preparation draft as of 28 October 2026. This is review copy, not a published offer. The repository is currently public, so it does not yet qualify for DataVendor's private-codebase estimate or listing. Recheck eligibility and refresh the estimate after repository privacy and rights reviews.

## Suggested listing title

Wattwise — electricity data-quality and tariff-estimation prototype

## Short description

A TypeScript browser prototype for synthetic electricity scenarios and local CSV-to-e-bill estimates. It validates interval-energy readings, applies a configurable flat or two-band local-hour time-of-use tariff, supports a manually entered same-period supplier-total comparison, exports calculation lineage, and generates a clearly labelled PDF estimate. Includes domain tests, pull-request CI, an additive Supabase schema, and setup documentation. No live meter or production billing service is included.

## Longer description

Wattwise is an early-stage browser prototype exploring how a small multi-site operator could inspect electricity readings, understand data-quality issues, and trace an estimated cost to its source readings and tariff assumptions.

The browser digital twin uses synthetic site and meter records. Its scenarios demonstrate usage spikes, stale data, duplicate events, counter resets, invalid units, and tariff changes. The shared domain code validates measurement types, normalizes supported units, handles batch duplicate IDs, quarantines unproven cumulative-register resets, and rejects missing intervals instead of treating them as zero. A deterministic estimator supports illustrative flat and time-of-use tariffs with effective dates and timezone context. A workflow view shows event validation, a signal, a human review, and simulated verification.

The repository includes a local CSV validation and estimate workflow with a synthetic sample file, source-linked priced segments, a complete calculation CSV export, flat and two-band time-of-use tariff examples, a PDF e-bill generator, a versioned energy-archive format with a browser validation/export workspace, focused automated tests, an additive Supabase schema, database tests, CI, and product/setup documentation. A clean local demo does not require a seller-owned Supabase project. Time-of-use bands use local clock hours and do not model weekday, holiday, seasonal, or jurisdiction-specific exceptions. Archive files are validated and exported locally; transactional import into the application database is not implemented.

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
- Node test patterns, GitHub Actions CI, and local Supabase migration/RLS checks

Position this as a compact, domain-specific engineering codebase. The repository does not include a private operational dataset or a generated taskset.

## Included in the repository

- TypeScript/React/Vite browser prototype and synthetic digital-twin scenarios
- Measurement and tariff-estimate domain modules
- Local interval-energy CSV preview, flat-tariff e-bill estimate, synthetic sample, and supplier-total comparison
- Energy archive format v1 validator and browser-based validated export workspace
- GitHub Actions checks for lint, typecheck, measured Node domain coverage, production build, HTTP smoke check, Playwright Chromium walkthrough, local Supabase migration, database lint, and pgTAP
- Additive Supabase schema and database tests
- Setup, architecture, demo, adapter, market, readiness, and archive documentation

## Not included

- Seller-owned Supabase project, credentials, hosted database, or deployment
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

PRs #6 and #7 are merged. PR #8 remains an open draft. Current code commit `ab6da4a` passed Node 22/24, browser E2E, database migration/lint, and expanded pgTAP in [CI run 40633652147](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40633652147). The branch has 51 passing Node tests and measured coverage of 91.79% lines, 77.43% branches, and 99.05% functions across four JavaScript domain modules only. All four browser walkthrough screenshots are available in a [30-day artifact](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40633652147/artifacts/12792527679). Database checks run against a disposable CI stack, not a hosted project.

See the [digital-twin demo guide](digital-twin-demo-guide.md), [e-bill workflow guide](ebill-generation.md), and [visual browser walkthrough](ebill-browser-walkthrough.md) for the steps and screenshots. The sample file is synthetic; uploaded files are handled locally in the browser. The Chromium walkthrough checks the downloaded PDF filename, header, estimate, supplier variance, and estimate-only disclosure. Domain tests separately check the PDF structure.

## DataVendor field preparation

| Field | Current evidence | Safe preparation |
|---|---|---|
| Asset type | One software repository | Choose the codebase/repository asset type. Do not describe it as a dataset or taskset. |
| Domain | Electricity/energy software and billing examples | Choose the closest available energy or software domain tags; avoid utility-grade or IoT claims. |
| Asking price | No current seller price selected | Refresh the platform estimate after privacy changes, then choose a price and rights scope. A platform estimate is advisory, not a buyer offer. |
| Tests and coverage | Local run: 51 Node tests; measured coverage across four domain modules | State the run and exact scope: 91.79% lines, 77.43% branches, 99.05% functions. Do not report this as whole-repository or UI/SQL coverage. |
| Browser walkthrough | Run 40633652147 passed four Chromium workflows, including tariff-boundary allocation, full calculation CSV, PDF schedule, and comparison reset | The four updated PNGs are available in the linked CI artifact. Hosted product behavior remains unverified. |
| CI on pull requests | Run 40633652147 passed Node 22/24, browser, database migration/lint, and pgTAP | Describe those checks and scope; hosted security remains separate. |
| Private code supply | GitHub currently reports this repository as public while improvements are in progress | Do not claim a private-supply quote or publish until the intended final snapshot is private and DataVendor re-scans it. |
| Private/personal data | Targeted local/history scan found no configured-pattern secrets in the worktree and found a historical Supabase anonymous client key in 24 commits; external Supabase state is unreviewed | Keep this field unconfirmed until the hosted project, generated assets, and remaining data exposure are reviewed. An anonymous key is intended for client use but still relies on correct backend access policies. |

DataVendor's [codebase estimator](https://datavendor.ai/estimator) describes its range as advisory and says public repositories do not qualify for a private-supply quote. Its [source-code listing guide](https://datavendor.ai/blog/sell-source-code-to-ai-companies) recommends explaining included material, runnability, history, tests, and rights. Confirm current listing rules and transaction terms before publishing.

## Publish-readiness gates

1. Finish the planned repository improvements, review their branch CI results, and only then make the intended GitHub snapshot private and re-run DataVendor's checks against that snapshot.
2. Review the targeted [history-secret scan](history-secret-scan.md) finding and generated assets. The scan is pattern-based, not proof that all credentials or personal/customer data are absent; rotate/revoke any exposed key if the hosted project review indicates it is needed.
3. Review the external Supabase project, including tables, authentication users, logs, backups, storage, functions, policies, and credentials; its state is not known from this repository.
4. Confirm ownership and transfer/licensing rights for all contributors, generated code, fonts, icons, dependencies, and third-party material. GitHub currently reports no repository license metadata.
5. Decide the exact license or sale scope, including AI training/use, derivative works, onward licensing, exclusivity, retention, and buyer access, with qualified advice where needed.
6. Re-scan the intended repository snapshot and use its dated estimate as one input to the asking-price decision. Do not treat the prior screenshot estimate as current or guaranteed.
7. Refresh the measured domain coverage after further code or test changes, and preserve its module scope. Do not enter it as UI, SQL, or whole-repository coverage.
8. Complete 3–5 property/business operator interviews using the [buyer-validation guide](buyer-validation-interview-guide.md). No operator interviews or pilot evidence exist yet. Record anonymized findings before expanding sector or integration scope.
9. Publish only after the private-data answer, rights, price, and delivered revision are confirmed.

The DataVendor estimator and source-code guide are linked for reference. This draft does not accept terms or grant any buyer a license.
