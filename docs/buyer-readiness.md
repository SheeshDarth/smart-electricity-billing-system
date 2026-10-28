# Buyer due-diligence checklist

Preparation notes for a possible codebase marketplace listing. This is not a valuation, ownership opinion, security certification, or promise of sale.

## Current snapshot

PRs #6, #7, and #8 are merged into `main`. Draft PR #9 adds the decision-gated animated workflow. PR #9 CI run [40653241434](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40653241434) passed Node 22/24 lint, type-check, tests/coverage, build, smoke check, and all five Chromium tests. Its [five-image artifact](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40653241434/artifacts/12800378284) is retained through 27 November 2026.

The prior local measurement was 51 Node tests and 91.79% line, 77.43% branch, and 99.05% function coverage across four domain modules. PR #9 CI passed the same domain test suite; percentages remain limited to those modules. The current five-image screenshot set is from run 40653241434.

The e-bill flow remains a local estimate workflow. The archive UI validates files and summarizes record counts but does not persist imports. The legacy payment and bill routes have been removed. No real tariff compliance, payment processing, live meter adapter, or official bill issuance is claimed. The workflow animation has no standalone video file; see the [walkthrough guide](interactive-workflow-walkthrough.md).

## Listing blockers to resolve

- [ ] **Repository privacy:** The repository is still public. Do not change visibility until the external project and rights reviews below are complete. Before listing, make the intended snapshot private, verify access, then refresh DataVendor's [estimator](https://datavendor.ai/estimator); public repositories do not qualify for its private-supply quote.
- [ ] **Historical backend project and key:** The current tree no longer uses Supabase. The historical key is an `anon` client key, not a `service_role` key, but it remains in Git history. The local database backup had four Auth accounts and zero rows in the five application tables. An aggregate-only review found three confirmed accounts and two with a recorded sign-in; the individual identities remain unreviewed and are treated as possible personal data. The separate Storage archive and old-key status remain unresolved. The dashboard says the project is paused beyond its one-year self-restore window. Try Settings → API Keys or the documented Management API legacy-key endpoint; if unavailable, contact Supabase Support. Do not delete the project until all data worth keeping has been reviewed and secured.
- [ ] **Ownership and contributor rights:** Verify contributions, generated code, any Lovable relationship, fonts/icons/assets, training-data provenance, and third-party work. GitHub has no repository license metadata; establish the project license and seller authority.
- [ ] **Dependency terms and security:** The current lockfile inventory has 461 package records; four records have unknown license metadata. The 27 October 2026 `npm audit` reported zero known vulnerabilities before this dependency removal. Resolve the license metadata and re-run the audit before transfer.
- [ ] **History and private data:** The targeted pattern scan found one historical anonymous client key, no current working-tree match, and no service-role-key pattern. This is not a comprehensive secret scanner or private-data audit. Review the individual Auth records, locate/review the separate Storage archive, review GitHub issues/attachments, and confirm the old project's key state.
- [ ] **Buyer validation:** No operator interviews, customer evidence, or live pilot have validated the buyer hypothesis. Use the [interview guide](buyer-validation-interview-guide.md) before claiming product demand or expanding scope.
- [ ] **Price and terms:** Re-run the estimate only after privacy and rights checks. Decide license versus transfer, exclusivity, AI use, derivatives, onward licensing, support, data retention, and handover scope. Get qualified advice for the agreement.
- [x] **Current PR CI:** run 40653241434 passed Node 22/24 and all five Chromium browser workflows after database removal; the run also produced the current five-screenshot artifact.

## Evidence safe to describe now

- [x] The prototype has a local CSV-to-estimate flow with row validation, flat and two-band local-hour tariff assumptions, optional same-period supplier comparison, and a PDF estimate generator.
- [x] PR #9 CI run 40653241434 passed all five Chromium workflows, including tariff-boundary allocation, PDF schedule, decision-gated simulated verification, replay, and reduced-motion stepping; its five-image artifact is retained through 27 November 2026.
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
| CI on PRs | PR #9 run 40653241434 passed Node 22/24, browser, and smoke checks | Describe only these current checks; no backend security coverage is claimed. |
| Private code supply | GitHub repository remains public | Do not claim private eligibility until the final snapshot is private and re-scanned by the platform. |
| Private data | Current demo is synthetic and has no backend. Local backup has four Auth accounts and empty former application tables; aggregate-only checks show accounts were confirmed/signed in, so treat them as possible personal data. Separate Storage archive and historical `anon` key status remain unreviewed. | Keep unconfirmed until individual Auth records and Storage archive are reviewed and the old key/project is disabled, confirmed inactive, or safely decommissioned. |

DataVendor's screenshot estimate is historical and advisory, not a buyer offer or current value. See the [marketplace listing draft](marketplace-listing-draft.md) for factual capability wording.

## Backend and transfer safeguards

- Keep buyer demo fixtures synthetic. Do not export seller or customer data.
- Removing the old integration from current source does not remove the anonymous key from Git history or revoke it. A replacement project has new keys but does not revoke the old project's key. Supabase documents deactivation in Settings → API Keys and a Management API endpoint that disables the legacy `anon` and `service_role` keys together. Keep private-data claims unconfirmed until the Auth records, Storage backup, and old-key status are reviewed.
- Never commit a service-role key or other privileged credential.
- Confirm controller/processor terms, retention, deletion, export, and transfer rights before handing over customer or telemetry records.
- Select and review a buyer-owned backend before any real customer records are stored; no database schema or authorization system is included today.

## Claims to avoid

Do not describe Wattwise as a deployed monitoring service, utility-grade billing platform, payment processor, certified meter product, production-secure multi-tenant SaaS, live interoperable meter system, trained AI system, or verified energy-savings product. Do not promise private data status, exclusivity, or clean title until the relevant reviews are complete.
