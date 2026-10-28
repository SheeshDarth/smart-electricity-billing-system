# Buyer due-diligence checklist

Preparation notes for a possible codebase marketplace listing. This is not a valuation, ownership opinion, security certification, or promise of sale.

## Current snapshot

PR #6 (documentation) and PR #7 (local CSV-to-e-bill workflow) are merged into `main`. PR #8 remains an open draft and adds browser coverage, broader domain coverage, archive UI validation, a larger RLS matrix, dependency updates, and these due-diligence reports. Its latest known [GitHub Actions run](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40500322202) passed Node 22/24, Chromium, database migration/lint, and pgTAP before the current local calculation CSV changes.

Locally, 49 Node tests pass and Node measured 91.80% line, 77.45% branch, and 98.98% function coverage across four domain modules. The latest remote PR run passed three Chromium tests for CSV upload, row validation, estimate, supplier-period confirmation, comparison, invalid-row rejection, downloaded PDF checks, and resetting the comparison when the CSV changes. New local E2E assertions cover the calculation details and complete CSV export, but have not run because `@playwright/test` is missing from installed dependencies. The database migration, lint, and expanded pgTAP suite passed against a disposable CI stack, not a hosted project.

The e-bill flow remains a local estimate workflow. The archive UI validates files and summarizes record counts but does not persist imports. The old payment-entry modal has been removed; legacy paid flags and downloads are labeled simulated. No real tariff compliance, payment processing, live meter adapter, or official bill issuance is claimed.

## Listing blockers to resolve

- [ ] **Repository privacy:** The repository is still public. Do not change visibility until the external project and rights reviews below are complete. Before listing, make the intended snapshot private, verify access, then refresh DataVendor's [estimator](https://datavendor.ai/estimator); public repositories do not qualify for its private-supply quote.
- [ ] **External Supabase project:** The history scan found a public `anon` client key whose project reference matched its historical URL. Review that project's users, rows, RLS, grants, storage, functions, logs, backups, and retention. The current local RLS tests are synthetic and do not inspect hosted state.
- [ ] **Ownership and contributor rights:** Verify contributions, generated code, any Lovable relationship, fonts/icons/assets, training-data provenance, and third-party work. GitHub has no repository license metadata; establish the project license and seller authority.
- [ ] **Dependency terms and security:** The current lockfile inventory has declared license metadata for 469 package records, with no missing declarations. The 27 October 2026 `npm audit` reports zero known vulnerabilities after targeted upgrades and removal of unused packages. Perform a human compatibility/attribution review and re-run the audit before transfer.
- [ ] **History and private data:** The targeted pattern scan found one historical Supabase anon key, no current working-tree matches, and no service-role-key pattern. This is not a comprehensive secret scanner or a private-data audit. Review GitHub issues/attachments and external backend state too.
- [ ] **Buyer validation:** No operator interviews, customer evidence, or live pilot have validated the buyer hypothesis. Use the [interview guide](buyer-validation-interview-guide.md) before claiming product demand or expanding scope.
- [ ] **Price and terms:** Re-run the estimate only after privacy and rights checks. Decide license versus transfer, exclusivity, AI use, derivatives, onward licensing, support, data retention, and handover scope. Get qualified advice for the agreement.
- [x] **Latest remote PR CI:** PR #8 run 40500322202 passed Node 22/24, Chromium, migration, database lint, and expanded pgTAP. It predates current local changes.

## Evidence safe to describe now

- [x] The prototype has a local CSV-to-estimate flow with row validation, explicit flat-rate assumptions, optional same-period supplier comparison, and a PDF estimate generator.
- [x] The prior CI browser suite passed upload, accepted/rejected validation, estimate, variance, PDF-download, and stale-confirmation reset workflows; screenshots are in the walkthrough.
- [x] Domain coverage is measured and scoped to the four tested JavaScript domain modules: 91.80% lines, 77.45% branches, and 98.98% functions on the 28 October local run.
- [x] A local archive export and whole-file validation summary exist; no partial database import is performed.
- [x] The dependency inventory and history-screening results are documented with their limits.
- [x] New browser and RLS checks passed in the PR #8 workflow run.
- [ ] External Supabase review, ownership clearance, full legal license review, operator interviews, and private-data determination remain open.

## DataVendor field notes

| Field | Evidence today | Listing guidance |
|---|---|---|
| Domain | Electricity data quality and estimate workflow | Choose the closest energy/software category; do not claim utility-grade AMI. |
| Asking price | No seller price selected; existing estimate predates this work | Refresh the estimator after privacy and rights checks, then choose license scope and asking terms. |
| Tests/coverage | 49 local Node tests pass; measured coverage is scoped to four modules | State the scope and values, not whole-repository coverage. Refresh after changes. |
| CI on PRs | PR #8 Node 22/24, browser, migration/lint, and pgTAP jobs passed | Describe the jobs and scope; hosted security remains separate. |
| Private code supply | GitHub repository remains public | Do not claim private eligibility until the final snapshot is private and re-scanned by the platform. |
| Private data | Current demo is synthetic; historical anonymous project key and external backend are under review | Keep unconfirmed until hosted project and all data sources are reviewed. |

DataVendor's screenshot estimate is historical and advisory, not a buyer offer or current value. See the [marketplace listing draft](marketplace-listing-draft.md) for factual capability wording.

## Backend and transfer safeguards

- Keep buyer demo fixtures synthetic. Do not export seller or customer data.
- Keep the Supabase anonymous client key out of private-data claims; it is designed for client use, but RLS and project state still need review.
- Never commit a service-role key or other privileged credential.
- Confirm controller/processor terms, retention, deletion, export, and transfer rights before handing over customer or telemetry records.
- Apply the additive database migration to a disposable buyer-owned project first; it does not replace legacy billing tables.
- Use the [role/table access matrix](rls-access-matrix.md) as a policy expectation, not proof of hosted security.

## Claims to avoid

Do not describe Wattwise as a deployed monitoring service, utility-grade billing platform, payment processor, certified meter product, production-secure multi-tenant SaaS, live interoperable meter system, trained AI system, or verified energy-savings product. Do not promise private data status, exclusivity, or clean title until the relevant reviews are complete.
