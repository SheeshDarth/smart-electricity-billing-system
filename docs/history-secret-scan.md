# Git history and working-tree secret scan

Rechecked 28 October 2026 at 05:00 UTC across all 142 commits reachable from the local heads and remote-tracking refs listed by `git for-each-ref`, plus readable working-tree files, including ignored files. `npm run audit:history-secrets` applies pattern-based checks for AWS access key IDs, GitHub tokens, private-key headers, JWT-like tokens, database URLs containing credentials, and long secret assignments. It reports locations and token metadata only; it never prints matched values. It skips `.git` during the working-tree scan, dependency/browser/build output directories, binary files, and files larger than 50 MiB.

## Findings

- No configured patterns matched the current readable working tree.
- History contains 24 matches of a JWT-like value in older revisions of `src/integrations/supabase/client.ts`; they are repeated historical occurrences, not 24 confirmed distinct credentials. Its decoded claims identify the role as `anon` and issuer as `supabase`; its project reference matched the URL in that historical client file. It is an anonymous client key, not a service-role key. The literal key and project reference are intentionally not copied into this report.
- No matches were found for the configured AWS, GitHub-token, private-key, credentialed-database-URL, or long-secret-assignment patterns.

The active application has now had its database client, account pages, schema, migrations, and CI database job removed. This only removes the integration from the current tree. It does not erase the historical key from Git revisions, revoke it, or delete the matching hosted project. The external project remains uninspected; its owner must review users, data, policies, logs, backups, storage, functions, keys, and retention. Revoke/rotate the historical key and decommission the project only after checking whether it contains data that must be retained or transferred.

## Limits

This is a targeted pattern scan, not a guarantee that no secrets exist. It does not inspect GitHub issues, pull request comments, uploaded attachments, inaccessible refs, external hosted-project state, local files above 50 MiB, or encrypted/binary files. Run an organization-approved dedicated secret scanner and review any alerts before a sale or transfer. Keep repository visibility unchanged until the project and ownership reviews are complete.
