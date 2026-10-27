# Buyer due-diligence checklist

Preparation notes for a possible codebase marketplace listing. This checklist does not assert ownership clearance, private-data status, production readiness, or a guaranteed sale value.

## Current snapshot

As of 27 October 2026, PR #6 merged into `main`. The [default-branch CI run](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40476121240) passed:

- Node 22 and 24: locked install, lint, typecheck, domain tests, production build, and no-credentials HTTP smoke check.
- Disposable local Supabase: migration, database lint, pgTAP, and stack cleanup.

The smoke check confirms the built HTML shell and JavaScript bundle are served without Supabase credentials. It is not a browser interaction test. Database checks run locally in a disposable stack, not on a hosted project.

The default branch contains a synthetic browser twin, measurement/tariff domain logic, archive parser/serializer and tests, GitHub Actions workflow, additive SQL schema, database tests, and product/setup documentation. Draft PR #7 adds the local CSV-to-e-bill estimate workflow; its Node 22/24 and disposable database CI checks passed in [PR run 40481467654](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40481467654). It remains unmerged. The energy archive utility is not connected to the UI or database.

## Listing blockers to resolve

- [ ] **Repository privacy:** GitHub currently reports the repository as public. It will stay public while improvements are in progress. Before listing, make the intended snapshot private, verify access, and re-run DataVendor's [estimator](https://datavendor.ai/estimator); public repositories do not qualify for its private-supply quote.
- [x] **Default branch:** PR #6 is merged. The archive tests, demo smoke check, listing draft, and package metadata update are on `main`.
- [ ] **Ownership and rights:** Review commit history, contributors, generated code, third-party work, fonts, icons, datasets, dependency licenses, and any Lovable relationship. GitHub reports no repository license metadata.
- [ ] **History and secrets:** Review all commits and branches, not only the current tree, for credentials, personal/customer information, and material you cannot license.
- [ ] **External backend:** Inspect any Supabase project for tables, users, logs, backups, storage, functions, secrets, and data retention. Its state is unknown from this repository review.
- [ ] **Price and terms:** Re-run the estimate after privacy changes. Decide whether the offer is a license or transfer, and define AI use, derivative works, onward licensing, exclusivity, retention, and support. Get qualified advice on the agreement.
- [ ] **Test coverage field:** Tests pass, but no coverage percentage is generated. Do not enter a percentage without a coverage report.
- [ ] **Private-data field:** Demo values in this branch are synthetic; this does not establish that Git history or an external backend contains no private data.

## Evidence safe to describe

- [x] Automated lint, typecheck, domain tests, production build, and demo HTTP packaging smoke pass in default-branch CI run.
- [x] Local disposable Supabase migration, database lint, pgTAP, and cleanup pass in [default-branch CI run](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40476121240).
- [x] The browser twin runs without a seller-owned Supabase project; it uses synthetic records.
- [x] The repository documents supported flows and known limits in the [README](../README.md), [demo guide](digital-twin-demo-guide.md), and [feature matrix](feature-status.md).
- [ ] Browser interaction flows have not been verified by an automated end-to-end test in this PR.
- [ ] Hosted authorization, hosted deployment, live meters, production tariffs, bill comparison, and payment handling are not verified or implemented.

## DataVendor field notes

| Field | Evidence today | What to enter after verification |
|---|---|---|
| Domain | Electricity/energy software, tariff estimates, data-quality workflow | Select the closest available energy/software category; do not claim utility-grade AMI. |
| Asking price | Seller price not selected; prior estimate is not refreshed for the intended private snapshot | Re-run estimator after private-repository and rights checks, then choose a price and license scope. |
| Tests/coverage | Automated tests pass in PR CI | State that tests pass. Leave any coverage percentage blank unless a coverage tool reports it. |
| CI on PRs | Default-branch CI and draft PR #7 checks passed on Node 22/24 and disposable database jobs | Mark CI present; describe the new e-bill branch as CI-verified but still unmerged. |
| Private code supply | Repository is intentionally public during improvement work | Do not claim private eligibility until the final snapshot is private and DataVendor re-scans it. |
| Private data | Synthetic demo records; Git history and external backend not audited | Keep unconfirmed until both are reviewed. |

The earlier DataVendor screenshot estimate is historical, not a current valuation or buyer offer. Its estimator describes ranges as advisory. See the [marketplace listing draft](marketplace-listing-draft.md) for factual copy prepared from verified capabilities.

## Data and backend safeguards

- Keep buyer evaluation fixtures synthetic; do not export seller data as a demo dataset.
- Confirm controller/processor terms, retention, deletion, export, and transfer rights before handing over customer or telemetry records.
- Apply the additive migration only to a disposable buyer-owned project first; it does not replace legacy billing tables.
- Never add a Supabase service-role key or other server credential to browser code or Git.
- Test each RLS policy with separate tenant users and roles. The existing 27 pgTAP assertions are representative, not a complete authorization audit.

## Claims to avoid

Do not describe this as a deployed monitoring service, utility billing system, payment processor, certified meter platform, production-secure multi-tenant SaaS, live interoperable meter product, trained AI system, or verified energy-savings product. Do not promise exclusivity or clean title until rights are reviewed.
