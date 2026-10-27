# Git history and working-tree secret scan

Rechecked 27 October 2026 at 11:18 UTC across all 134 commits reachable from the local heads and remote-tracking refs listed by `git for-each-ref`, plus readable working-tree files, including ignored files. `npm run audit:history-secrets` applies pattern-based checks for AWS access key IDs, GitHub tokens, private-key headers, JWT-like tokens, database URLs containing credentials, and long secret assignments. It reports locations and token metadata only; it never prints matched values. It skips `.git` during the working-tree scan, dependency/browser/build output directories, binary files, and files larger than 50 MiB.

## Findings

- No configured patterns matched the current readable working tree.
- History contains 24 matches of a JWT-like value in older revisions of `src/integrations/supabase/client.ts`; they are repeated historical occurrences, not 24 confirmed distinct credentials. Its decoded claims identify the role as `anon` and issuer as `supabase`; its project reference matched the URL in that historical client file. It is an anonymous client key, not a service-role key. The literal key and project reference are intentionally not copied into this report.
- No matches were found for the configured AWS, GitHub-token, private-key, credentialed-database-URL, or long-secret-assignment patterns.

An `anon` key is intended for browser use and is not a privileged service credential by itself. Its presence still identifies a Supabase project, and data access depends on that project's RLS, grants, storage rules, and functions. The external project was not inspected in this scan. The owner must review its users, data, policies, logs, backups, storage, functions, keys, and retention before claiming private-data status or changing repository visibility. Rotate/revoke credentials only if the project owner confirms a key or policy is unsafe or no longer intended.

## Limits

This is a targeted pattern scan, not a guarantee that no secrets exist. It does not inspect GitHub issues, pull request comments, uploaded attachments, inaccessible refs, external Supabase state, local files above 50 MiB, or encrypted/binary files. Run an organization-approved dedicated secret scanner and review any alerts before a sale or transfer. Do not rewrite history or change repository visibility until the project and ownership reviews are complete.
