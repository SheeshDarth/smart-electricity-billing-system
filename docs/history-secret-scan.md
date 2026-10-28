# Git history and working-tree secret scan

Rechecked 28 October 2026 at 07:51 UTC across all 147 commits reachable from the local heads and remote-tracking refs listed by `git for-each-ref`, plus readable working-tree files, including ignored files. `npm run audit:history-secrets` applies pattern-based checks for AWS access key IDs, GitHub tokens, private-key headers, JWT-like tokens, database URLs containing credentials, and long secret assignments. It reports locations and token metadata only; it never prints matched values. It skips `.git` during the working-tree scan, dependency/browser/build output directories, binary files, and files larger than 50 MiB.

## Findings

- No configured patterns matched the current readable working tree.
- History contains 24 matches of a JWT-like value in older revisions of `src/integrations/supabase/client.ts`; they are repeated historical occurrences, not 24 confirmed distinct credentials. Its decoded claims identify the role as `anon` and issuer as `supabase`; its project reference matched the URL in that historical client file. It is an anonymous client key, not a service-role key. The literal key and project reference are intentionally not copied into this report.
- No matches were found for the configured AWS, GitHub-token, private-key, credentialed-database-URL, or long-secret-assignment patterns.

The active application has had its database client, account pages, schema, migrations, and CI database job removed. This only removes the integration from the current tree. It does not erase the historical key from Git revisions, revoke it, or delete the matching hosted project.

The owner restored the downloaded database backup locally and reported 29 non-system tables. The five former application tables (`public.billing`, `public.energy_usage`, `public.payments`, `public.profiles`, and `public.sockets`) each had zero rows; `auth.users` had four rows; `storage.objects` had zero rows. This does not inspect the four user records' personal fields, the separately downloaded Storage-objects backup, Auth configuration, policies/grants, logs, functions, secrets, or retention. It is evidence about that local backup only, not a live-project key-status check.

The Supabase dashboard says the project was paused for more than one year and cannot be resumed from Studio. Supabase documents a one-year self-service restore window, followed by recovery to local or a new project from available backups. Creating a replacement project from the backup gives it new keys and a new project reference; it does not revoke the key in the old project's Git history. First review the four Auth records and any Storage backup. If the old project's **Settings → API Keys** still allows it, deactivate the legacy `anon` key. If that project control is unavailable, ask Supabase Support to confirm the old project's key/API status and available decommission path. Only delete the old project after the database and Storage backups have been reviewed and any data to retain has been safely copied; deletion permanently removes the remaining project data and backups.

History cleanup is a separate action: after the old key has been disabled or confirmed inactive, decide whether to rewrite Git history with a coordinated `git-filter-repo` operation. That changes commit IDs and requires all collaborators and remote branches/tags to be coordinated; rewriting history alone does not revoke a key. Keep the repository public until the owner has completed the project/key, backup, ownership, and rights reviews.

## Limits

This is a targeted pattern scan, not a guarantee that no secrets exist. It does not inspect GitHub issues, pull request comments, uploaded attachments, inaccessible refs, external hosted-project state, local files above 50 MiB, or encrypted/binary files. Run an organization-approved dedicated secret scanner and review any alerts before a sale or transfer. Keep repository visibility unchanged until the project and ownership reviews are complete.
