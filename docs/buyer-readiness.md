# Buyer due-diligence checklist

Preparation notes for a possible codebase marketplace listing. This is not a valuation, ownership opinion, security certification, or promise of sale.

## Current snapshot

PRs #6, #7, and #8 are merged into `main`. Draft PR #9 includes the decision-gated animated workflow and the history cleanup notes. CI run [40661228872](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40661228872) passed Node 22/24 and all five Chromium workflows on the rewritten PR head. Its [five-image artifact](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40661228872/artifacts/12804370865) is retained through 27 November 2026.

The prior local measurement was 51 Node tests and 91.79% line, 77.43% branch, and 99.05% function coverage across four domain modules. PR #9 CI passed the same domain test suite; percentages remain limited to those modules. The current five-image screenshot set is from run 40661228872.

The e-bill flow remains a local estimate workflow. The archive UI validates files and summarizes record counts but does not persist imports. The legacy payment and bill routes have been removed. No real tariff compliance, payment processing, live meter adapter, or official bill issuance is claimed. The workflow animation has no standalone video file; see the [walkthrough guide](interactive-workflow-walkthrough.md).

## Listing blockers to resolve

- [ ] **Repository privacy:** The repository is still public. Do not change visibility until the external project and rights reviews below are complete. Before listing, make the intended snapshot private, verify access, then refresh DataVendor's [estimator](https://datavendor.ai/estimator); public repositories do not qualify for its private-supply quote.
- [ ] **Historical backend project and key:** The current tree no longer uses Supabase. All nine GitHub branch heads were rewritten; the local scan now finds no key-pattern matches in branch/tag history. GitHub's read-only refs for closed PRs #1–#8 still point to old commits and may retain old PR views. The old key is an `anon` client key, not a `service_role` key, and its status at the paused project is unconfirmed. The local database backup had four Auth accounts and zero rows in the five application tables. An aggregate-only review found three confirmed accounts and two with a recorded sign-in; treat them as possible personal data until reviewed individually. The separate Storage archive remains unresolved. Do not delete the project until all data worth keeping has been reviewed and secured.
- [ ] **Ownership and contributor rights:** Verify contributions, generated code, any Lovable relationship, fonts/icons/assets, training-data provenance, and third-party work. GitHub has no repository license metadata; establish the project license and seller authority.
- [ ] **Dependency terms and security:** The current lockfile inventory has 461 package records; four records have unknown license metadata. The 27 October 2026 `npm audit` reported zero known vulnerabilities before this dependency removal. Resolve the license metadata and re-run the audit before transfer.
- [ ] **History and private data:** The latest local scan found no configured pattern matches in the working tree or rewritten branch history. Closed PR refs #1–#8 may still expose the historical client key; external clones and cached views are outside the scan. The old project's key status is unconfirmed. Review the individual Auth records and Storage archive, and resolve PR/cache exposure if GitHub Support accepts a request.
- [ ] **Buyer validation:** No operator interviews, customer evidence, or live pilot have validated the buyer hypothesis. Use the [interview guide](buyer-validation-interview-guide.md) before claiming product demand or expanding scope.
- [ ] **Price and terms:** Re-run the estimate only after privacy and rights checks. Decide license versus transfer, exclusivity, AI use, derivatives, onward licensing, support, data retention, and handover scope. Get qualified advice for the agreement.
- [x] **Current PR CI:** run 40661228872 passed Node 22/24 and all five Chromium browser workflows after database removal; the run also produced the current five-screenshot artifact.

## Evidence safe to describe now

- [x] The prototype has a local CSV-to-estimate flow with row validation, flat and two-band local-hour tariff assumptions, optional same-period supplier comparison, and a PDF estimate generator.
- [x] PR #9 CI run 40661228872 passed all five Chromium workflows, including tariff-boundary allocation, PDF schedule, decision-gated simulated verification, replay, and reduced-motion stepping; its five-image artifact is retained through 27 November 2026.
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
| CI on PRs | PR #9 run 40661228872 passed Node 22/24, browser, and smoke checks | Describe only these current checks; no backend security coverage is claimed. |
| Private code supply | GitHub repository remains public | Do not claim private eligibility until the final snapshot is private and re-scanned by the platform. |
| Private data | Current demo is synthetic and has no backend. The local backup has four Auth accounts and empty former application tables; aggregate-only checks show some confirmed/sign-in activity. Branch histories were rewritten, but closed PR refs #1–#8 may retain the old `anon` key, and the paused project's key status is unknown. | Keep unconfirmed until Auth/Storage review and external key status are resolved. State the history rewrite and its PR-cache limits accurately. |

DataVendor's screenshot estimate is historical and advisory, not a buyer offer or current value. See the [marketplace listing draft](marketplace-listing-draft.md) for factual capability wording.

## Backend and transfer safeguards

- Keep buyer demo fixtures synthetic. Do not export seller or customer data.
- Removing the integration and rewriting branch history do not revoke the old key. A replacement project has new keys but does not revoke the old project's key. Closed PR refs #1–#8 may retain the old key; GitHub Support may be needed for cached views, but no request has been submitted. Keep private-data claims unconfirmed until the Auth records, Storage backup, and old-key status are reviewed.
- Never commit a service-role key or other privileged credential.
- Confirm controller/processor terms, retention, deletion, export, and transfer rights before handing over customer or telemetry records.
- Select and review a buyer-owned backend before any real customer records are stored; no database schema or authorization system is included today.

## Claims to avoid

Do not describe Wattwise as a deployed monitoring service, utility-grade billing platform, payment processor, certified meter product, production-secure multi-tenant SaaS, live interoperable meter system, trained AI system, or verified energy-savings product. Do not promise private data status, exclusivity, or clean title until the relevant reviews are complete.
