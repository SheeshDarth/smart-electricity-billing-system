# Buyer due-diligence checklist

This checklist is for preparing the energy prototype for a codebase marketplace. It does not assert that the asset is private, security-audited, transferable, or worth a particular amount.

## Current branch evidence

- The feature branch adds a synthetic browser twin, source-to-verification workflow, canonical measurement and tariff functions, a Node test suite, CI configuration, environment-based Supabase setup, an additive SQL schema draft, and setup/product documentation.
- The root demo does not need a seller-owned database. Legacy /login, /admin, and /user screens still depend on the old schema and are not covered by the new migration.
- CI has been added but must run on the pull request; a workflow file is not proof that checks pass.
- The migration is not applied or audited against a hosted service.

## Repository and ownership

- [ ] Verify the repository's GitHub visibility and access list. GitHub currently reports this repository as public; this differs from the earlier DataVendor screenshot, which showed the asset as private.
- [ ] Review branch protection, commit history, all contributors, forks, PRs, tags, and any generated-code or Lovable project relationship.
- [ ] Confirm ownership and transfer rights for all source, screenshots, datasets, fonts, assets, generated code, and dependencies.
- [ ] Review npm dependency licenses, transitive licenses, notices, and vulnerable packages; preserve the lockfile.
- [ ] Decide whether buyer receives the GitHub repository, domain, deployment, database, support, and/or an exclusive license. Do not promise exclusivity until rights are documented.
- [ ] Review all historical commits for credentials and data. Removing a value from the current file does not remove it from Git history. Rotate a credential only if the owner confirms it is sensitive and the affected service is identified.

## Data and backend

- [ ] Inspect the external Supabase project for personal, customer, meter, billing, authentication, logs, backups, storage objects, functions, and service-role credentials.
- [ ] Verify each table's RLS policy using separate tenant users and roles. Browser visibility of a route is not access control.
- [ ] Confirm data-controller/processor terms, retention, deletion, export, and transfer rights before handing over any customer or telemetry records.
- [ ] Keep the buyer evaluation fixture synthetic; do not export seller data as a demo dataset.
- [ ] Apply and test the new migration only in a disposable buyer-owned project first. It does not replace the old billing schema.
- [ ] Ensure no Supabase service-role key or other server credential is added to Vite/browser code or checked into Git.

## Technical evidence for the marketplace listing

- [ ] Run npm ci, npm run lint, npm run typecheck, npm test, and npm run build from a clean checkout.
- [x] Save the successful pull-request CI run and test output before claiming CI or test coverage: [CI run 48](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/39563511978).
- [ ] Verify a clean install and browser demo using no seller credentials.
- [ ] Record exact supported Node, browser, database, and deployment versions; avoid long-lived hardware or vendor guarantees.
- [ ] Label the digital twin, site records, scenarios, tariff, cost, and verification outcome as synthetic or simulated.
- [ ] Document unsupported live meter integrations, AI inference, payments, official bills, regulation, and device control.
- [ ] If tests are not run against live multi-tenant RLS, state that clearly instead of describing the system as production secure.

## DataVendor fields

Fill domain, asking price, test coverage, CI-on-PRs, and private-data fields only after checking them directly. The earlier screenshot showed an estimate of $5,381–$6,624 and an incomplete asset with no test files and missing metadata. That estimate is a platform calculation, not a buyer offer or guaranteed sale price. The branch changes may affect the estimate only after DataVendor re-scans the repo; do not reuse the old numbers as a valuation claim.

For the private-data question, review both current Git content and the external backend. The GitHub repo itself is currently public. A public/anon Supabase key is designed for browser use, but access safety depends on database policies and must be tested. The external project state is unknown from this repository review.

## Listing language that is supportable today

Describe this as a synthetic cross-sector energy intelligence prototype with a browser digital twin, transparent data-quality handling, a deterministic estimate module, an industrial energy-per-good-unit example, and an additive schema draft. Do not describe it as a utility AMI product, a deployed AI platform, an audited billing system, a real savings case, or a production-ready multi-tenant service.
