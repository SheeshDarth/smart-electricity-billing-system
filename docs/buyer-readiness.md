# Buyer due-diligence checklist

Preparation notes for a possible codebase marketplace listing. This is not a valuation, ownership opinion, security certification, or promise of sale.

## Current snapshot

PRs #6, #7, and #8 are merged into `main`. PR #8's latest CI run 40635970820 passed Node 22/24 lint, type-check, tests/coverage, build, smoke check, and the then-current four-test Chromium walkthrough. On 28 October, this branch added a decision-gated animated workflow; all five Chromium tests now pass locally and generated a fifth screenshot. These changes still need a new PR CI run. The old [four-image artifact](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40635600460/artifacts/12792514571) contains only the prior e-bill screenshots.

The prior local measurement was 51 Node tests and 91.79% line, 77.43% branch, and 99.05% function coverage across four domain modules. The current CI rerun passes the same domain test suite; percentages remain limited to those modules. The screenshot set is current as of run 40635600460.

The e-bill flow remains a local estimate workflow. The archive UI validates files and summarizes record counts but does not persist imports. The legacy payment and bill routes have been removed. No real tariff compliance, payment processing, live meter adapter, or official bill issuance is claimed. The workflow animation has no standalone video file; see the [walkthrough guide](interactive-workflow-walkthrough.md).

## Listing blockers to resolve

- [ ] **Repository privacy:** The repository is still public. Do not change visibility until the external project and rights reviews below are complete. Before listing, make the intended snapshot private, verify access, then refresh DataVendor's [estimator](https://datavendor.ai/estimator); public repositories do not qualify for its private-supply quote.
- [ ] **Historical backend project and key:** The current tree no longer uses Supabase. The historical key is an `anon` client key, not a `service_role` key, but it remains in Git history. The local database backup had four `auth.users` rows and zero rows in the five application tables; user fields and the separately downloaded Storage backup remain unchecked. The dashboard says the project is paused beyond its one-year self-restore window. Check Settings → API Keys for legacy-key deactivation; if unavailable, contact Supabase Support to confirm key/API status and the safe decommission path. Do not delete the project until all data worth keeping has been reviewed and secured.
- [ ] **Ownership and contributor rights:** Verify contributions, generated code, any Lovable relationship, fonts/icons/assets, training-data provenance, and third-party work. GitHub has no repository license metadata; establish the project license and seller authority.
- [ ] **Dependency terms and security:** The current lockfile inventory has 461 package records; four records have unknown license metadata. The 27 October 2026 `npm audit` reported zero known vulnerabilities before this dependency removal. Resolve the license metadata and re-run the audit before transfer.
- [ ] **History and private data:** The targeted pattern scan found one historical anonymous client key, no current working-tree match, and no service-role-key pattern. This is not a comprehensive secret scanner or private-data audit. Review the four Auth records, separate Storage archive, GitHub issues/attachments, and old project's key state.
- [ ] **Buyer validation:** No operator interviews, customer evidence, or live pilot have validated the buyer hypothesis. Use the [interview guide](buyer-validation-interview-guide.md) before claiming product demand or expanding scope.
- [ ] **Price and terms:** Re-run the estimate only after privacy and rights checks. Decide license versus transfer, exclusivity, AI use, derivatives, onward licensing, support, data retention, and handover scope. Get qualified advice for the agreement.
- [x] **Previous baseline CI:** run 40633652147 passed Node 22/24, four Chromium workflows, and the then-existing disposable database checks. This branch changes CI and must pass a fresh run before the evidence is current.

## Evidence safe to describe now

- [x] The prototype has a local CSV-to-estimate flow with row validation, flat and two-band local-hour tariff assumptions, optional same-period supplier comparison, and a PDF estimate generator.
- [x] CI run 40635600460 passed the Chromium suite for flat and time-of-use flows, including a local tariff-boundary split, per-band calculation export, PDF schedule assertion, and four-screenshot artifact.
- [x] The new interactive workflow browser case passed locally, checking playback, the required human decision, final simulated verification, and reduced-motion stepping. Updated CI is pending.
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
| CI on PRs | PR #8 run 40635970820 passed Node 22/24, browser, and smoke checks after database removal | Refresh after this branch's CI run; do not claim backend security coverage. |
| Private code supply | GitHub repository remains public | Do not claim private eligibility until the final snapshot is private and re-scanned by the platform. |
| Private data | Current demo is synthetic and has no backend. Local backup counts show four Auth users and empty former application tables; Auth fields and separate Storage archive remain unreviewed. Historical `anon` key status is unconfirmed. | Keep unconfirmed until Auth data and Storage archive are reviewed and the old key/project are disabled, confirmed inactive, or safely decommissioned. |

DataVendor's screenshot estimate is historical and advisory, not a buyer offer or current value. See the [marketplace listing draft](marketplace-listing-draft.md) for factual capability wording.

## Backend and transfer safeguards

- Keep buyer demo fixtures synthetic. Do not export seller or customer data.
- Removing the old integration from current source does not remove the anonymous key from Git history or revoke it. A replacement project has new keys but does not revoke the old project's key. Keep private-data claims unconfirmed until the four Auth records, Storage backup, and old-key status are reviewed.
- Never commit a service-role key or other privileged credential.
- Confirm controller/processor terms, retention, deletion, export, and transfer rights before handing over customer or telemetry records.
- Select and review a buyer-owned backend before any real customer records are stored; no database schema or authorization system is included today.

## Claims to avoid

Do not describe Wattwise as a deployed monitoring service, utility-grade billing platform, payment processor, certified meter product, production-secure multi-tenant SaaS, live interoperable meter system, trained AI system, or verified energy-savings product. Do not promise private data status, exclusivity, or clean title until the relevant reviews are complete.
