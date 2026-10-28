# Buyer due-diligence checklist

Preparation notes for a possible codebase marketplace listing. This is not a valuation, ownership opinion, security certification, or promise of sale.

## Current snapshot

PRs #6 and #7 are merged into `main`. PR #8 remains an open draft. Previous commit `ab6da4a` passed Node 22/24 checks and four Chromium workflows in [GitHub Actions run 40633652147](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40633652147). The current branch removes the database integration and CI job; its updated checks are pending.

Locally, 51 Node tests passed and Node measured 91.79% line, 77.43% branch, and 99.05% function coverage across four domain modules before this change. Coverage should be refreshed after the current code changes. Local lint, type-check, build, and Playwright previously could not be run because dependency installation was blocked by a Windows filesystem `EPERM`. CI published four walkthrough screenshots in the [run artifact](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40633652147/artifacts/12792527679); checked-in PNGs still need a local refresh.

The e-bill flow remains a local estimate workflow. The archive UI validates files and summarizes record counts but does not persist imports. The legacy payment and bill routes have been removed. No real tariff compliance, payment processing, live meter adapter, or official bill issuance is claimed.

## Listing blockers to resolve

- [ ] **Repository privacy:** The repository is still public. Do not change visibility until the external project and rights reviews below are complete. Before listing, make the intended snapshot private, verify access, then refresh DataVendor's [estimator](https://datavendor.ai/estimator); public repositories do not qualify for its private-supply quote.
- [ ] **Historical backend project and key:** The application integration, config, schema, and tests have been removed from the current tree. A historical anonymous client key remains in earlier Git history. Review the matching project's users, rows, policies, grants, storage, functions, logs, backups, keys, and retention; safely decommission the project or keep it under owner control and rotate/revoke the old key as appropriate.
- [ ] **Ownership and contributor rights:** Verify contributions, generated code, any Lovable relationship, fonts/icons/assets, training-data provenance, and third-party work. GitHub has no repository license metadata; establish the project license and seller authority.
- [ ] **Dependency terms and security:** The current lockfile inventory has 461 package records; four records have unknown license metadata. The 27 October 2026 `npm audit` reported zero known vulnerabilities before this dependency removal. Resolve the license metadata and re-run the audit before transfer.
- [ ] **History and private data:** The targeted pattern scan found one historical anonymous client key, no current working-tree match, and no service-role-key pattern. This is not a comprehensive secret scanner or private-data audit. Review GitHub issues/attachments and the historical hosted project too.
- [ ] **Buyer validation:** No operator interviews, customer evidence, or live pilot have validated the buyer hypothesis. Use the [interview guide](buyer-validation-interview-guide.md) before claiming product demand or expanding scope.
- [ ] **Price and terms:** Re-run the estimate only after privacy and rights checks. Decide license versus transfer, exclusivity, AI use, derivatives, onward licensing, support, data retention, and handover scope. Get qualified advice for the agreement.
- [x] **Previous baseline CI:** run 40633652147 passed Node 22/24, four Chromium workflows, and the then-existing disposable database checks. This branch changes CI and must pass a fresh run before the evidence is current.

## Evidence safe to describe now

- [x] The prototype has a local CSV-to-estimate flow with row validation, flat and two-band local-hour tariff assumptions, optional same-period supplier comparison, and a PDF estimate generator.
- [x] The Chromium suite passed flat and time-of-use flows, including a local tariff-boundary split, per-band calculation export, PDF schedule assertion, and four-screenshot artifact.
- [x] Domain coverage is measured and scoped to four JavaScript domain modules: 91.79% lines, 77.43% branches, and 99.05% functions on the 28 October local run.
- [x] A local archive export and whole-file validation summary exist; no partial database import is performed.
- [x] The dependency inventory and history-screening results are documented with their limits.
- [x] The current source tree no longer includes authentication or a database integration; the demo is local-only.
- [ ] Historical backend project/key review, ownership clearance, full legal license review, operator interviews, and private-data determination remain open.

## DataVendor field notes

| Field | Evidence today | Listing guidance |
|---|---|---|
| Domain | Electricity data quality and estimate workflow | Choose the closest energy/software category; do not claim utility-grade AMI. |
| Asking price | No seller price selected; existing estimate predates this work | Refresh the estimator after privacy and rights checks, then choose license scope and asking terms. |
| Tests/coverage | 51 local Node tests pass; measured coverage is scoped to four modules | State the scope and values, not whole-repository coverage. Refresh after changes. |
| CI on PRs | Run 40633652147 passed Node 22/24 and browser workflows before removal of the database job | Refresh after the next branch CI run; do not claim backend security coverage. |
| Private code supply | GitHub repository remains public | Do not claim private eligibility until the final snapshot is private and re-scanned by the platform. |
| Private data | Current demo is synthetic and has no backend; historical anonymous key and matching hosted project remain under review | Keep unconfirmed until the historical project is reviewed and the key is revoked or otherwise accounted for, and all data sources are reviewed. |

DataVendor's screenshot estimate is historical and advisory, not a buyer offer or current value. See the [marketplace listing draft](marketplace-listing-draft.md) for factual capability wording.

## Backend and transfer safeguards

- Keep buyer demo fixtures synthetic. Do not export seller or customer data.
- Removing the old integration from current source does not remove the anonymous key from Git history or revoke it. Keep private-data claims unconfirmed until the former hosted project is reviewed.
- Never commit a service-role key or other privileged credential.
- Confirm controller/processor terms, retention, deletion, export, and transfer rights before handing over customer or telemetry records.
- Select and review a buyer-owned backend before any real customer records are stored; no database schema or authorization system is included today.

## Claims to avoid

Do not describe Wattwise as a deployed monitoring service, utility-grade billing platform, payment processor, certified meter product, production-secure multi-tenant SaaS, live interoperable meter system, trained AI system, or verified energy-savings product. Do not promise private data status, exclusivity, or clean title until the relevant reviews are complete.
