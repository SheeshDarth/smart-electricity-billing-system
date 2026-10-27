# Supabase role and table access matrix

This matrix reflects `supabase/migrations/20261016000000_energy_platform_core.sql`. RLS tests use disposable synthetic tenants. PostgreSQL grants table privileges to `authenticated`; row-level policies decide which operations and rows are available. `anon` has no table access.

Legend: **R** read rows; **C** create; **U** update; **D** delete; **—** no policy. Every role below can read rows belonging to its own organization. No role can read or write another organization's rows.

| Table | Owner | Admin | Operator | Viewer | Write scope |
|---|---|---|---|---|---|
| organizations | R/C/U | R/U | R | R | Authenticated creator can create an organization; owner/admin update; no delete policy. |
| organization_members | R/C/U/D | R/C/U/D* | R | R | Owner/admin manage non-owner memberships; only owner may grant admin; admins cannot change or remove an owner. |
| sites | R/C/U/D | R/C/U/D | R/C/U | R | Operator can create/update; only owner/admin can delete. |
| areas | R/C/U/D | R/C/U/D | R | R | Owner/admin. |
| assets | R/C/U/D | R/C/U/D | R/C/U/D | R | Owner/admin/operator. |
| meters | R/C/U/D | R/C/U/D | R | R | Owner/admin. |
| source_adapters | R/C/U/D | R/C/U/D | R | R | Owner/admin. |
| measurements | R/C | R/C | R/C | R | Append-only for authenticated roles; no update/delete policy. |
| tariffs | R/C/U/D | R/C/U/D | R | R | Owner/admin. |
| billing_runs | R/C | R/C | R/C | R | Create-only estimate records; no update/delete policy. |
| insights | R/C/U | R/C/U | R/C/U | R | Owner/admin/operator; no delete policy. |
| interventions | R/C/U | R/C/U | R/C/U | R | Owner/admin/operator; no delete policy. |

`*` Admin may add non-owner members and change non-owner roles, but cannot grant `admin`; owner can grant admin. Final-owner protection is tested for self-demotion and self-removal.

## Test coverage in the repository

The pgTAP suite seeds two organizations and owner, admin, operator, viewer, and second-tenant accounts. It checks tenant-scoped reads on all 12 tables for each role; representative allowed and denied writes by role; membership add/promotion/removal rules; final-owner protection; cross-organization insert attempts across the energy tables; and representative cross-organization membership, site, and meter update/delete denials. Run it with `supabase test db --local` after starting the disposable Supabase stack.

These tests do not inspect or change an external Supabase project. The project owner must review that project's deployed migration history, policies, auth settings, storage, logs, and secrets separately before any visibility change or transfer.
