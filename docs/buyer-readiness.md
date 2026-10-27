# Buyer due-diligence checklist

Preparation notes for a possible codebase marketplace listing. This is not a valuation, ownership opinion, security certification, or promise of sale.

## Current snapshot

PR #6 (documentation) and PR #7 (local CSV-to-e-bill workflow) are merged into `main`. The existing PR #7 run passed Node 22/24 checks and the disposable Supabase suite. The current `codex/remaining-readiness` branch adds the browser test, broader domain coverage, archive UI validation, a larger RLS matrix, dependency updates, and these due-diligence reports. **The current branch still needs its own CI run before its new checks can be claimed as CI-passing.**

Locally, 47 domain tests passed and Node measured 91.47% line, 77.34% branch, and 98.90% function coverage across four domain modules. Two Playwright tests passed through CSV upload, row validation, estimate, supplier-period confirmation, comparison, and the invalid-row rejection path. Screenshots are included in the [browser walkthrough](ebill-browser-walkthrough.md). The local Supabase CLI could not start in this environment, so the expanded database suite still needs the branch CI result.

The e-bill flow remains a local estimate workflow. The archive UI validates files and summarizes record counts but does not persist imports. The old payment-entry modal has been removed; legacy paid flags and downloads are labeled simulated. No real tariff compliance, payment processing, live meter adapter, or official bill issuance is claimed.

## Listing blockers to resolve

- [ ] **Repository privacy:** The repository is still public. Do not change visibility until the external project and rights reviews below are complete. Before listing, make the intended snapshot private, verify access, then refresh DataVendor's [estimator](https://datavendor.ai/estimator); public repositories do not qualify for its private-supply quote.
- [ ] **External Supabase project:** The history scan found a public `anon` client key whose project reference matched its historical URL. Review that project's users, rows, RLS, grants, storage, functions, logs, backups, and retention. The current local RLS tests are synthetic and do not inspect hosted state.
- [ ] **Ownership and contributor rights:** Verify contributions, generated code, any Lovable relationship, fonts/icons/assets, training-data provenance, and third-party work. GitHub has no repository license metadata; establish the project license and seller authority.
- [ ] **Dependency terms and security:** The lockfile inventory has declared license metadata for 497 packages; perform a human compatibility/attribution review. `npm audit` still reports 9 advisories (7 moderate, 2 high) after safe semver updates. Review the remaining major-version migrations before transfer.
- [ ] **History and private data:** The targeted pattern scan found one historical Supabase anon key, no current working-tree matches, and no service-role-key pattern. This is not a comprehensive secret scanner or a private-data audit. Review GitHub issues/attachments and external backend state too.
- [ ] **Buyer validation:** Conduct 3–5 operator conversations using the [interview guide](buyer-validation-interview-guide.md). No operators have been contacted and no product-market evidence is claimed.
- [ ] **Price and terms:** Re-run the estimate only after privacy and rights checks. Decide license versus transfer, exclusivity, AI use, derivatives, onward licensing, support, data retention, and handover scope. Get qualified advice for the agreement.
- [ ] **Current-branch CI:** Run Node 22/24, Playwright, and disposable Supabase jobs on this branch and fix failures before citing the pipeline as passing.

## Evidence safe to describe now

- [x] The prototype has a local CSV-to-estimate flow with row validation, explicit flat-rate assumptions, optional same-period supplier comparison, and a PDF estimate generator.
- [x] The browser tests locally pass the upload, accepted/rejected validation, estimate, and variance workflow; screenshots are in the walkthrough.
- [x] Domain coverage is measured and scoped to the four tested JavaScript domain modules: 91.47% lines, 77.34% branches, and 98.90% functions on the recorded run.
- [x] A local archive export and whole-file validation summary exist; no partial database import is performed.
- [x] The dependency inventory and history-screening results are documented with their limits.
- [ ] Current readiness branch CI has not yet passed; wait for its run before describing the new browser/RLS checks as CI-verified.
- [ ] External Supabase review, ownership clearance, full legal license review, operator interviews, and private-data determination remain open.

## DataVendor field notes

| Field | Evidence today | Listing guidance |
|---|---|---|
| Domain | Electricity data quality and estimate workflow | Choose the closest energy/software category; do not claim utility-grade AMI. |
| Asking price | No seller price selected; existing estimate predates this work | Refresh the estimator after privacy and rights checks, then choose license scope and asking terms. |
| Tests/coverage | 47 local domain tests pass; measured coverage is scoped to four modules | State the scope and values, not whole-repository coverage. Refresh after changes. |
| CI on PRs | Existing merged CI passed; this branch adds Playwright and wider database checks | Mark the new checks present only after this branch's CI passes. |
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
