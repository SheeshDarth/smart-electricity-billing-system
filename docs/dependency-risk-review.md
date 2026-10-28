# Dependency and license metadata review

Reviewed on 28 October 2026 against the npm lockfile after removing the former database integration.

## License metadata inventory

`npm run audit:licenses` reads each lockfile package's metadata (and installed package metadata where available) and reports declared license expressions. The current lock contains 461 package records, including 63 direct dependencies. Four records have unknown license metadata: `@radix-ui/react-tooltip`, `class-variance-authority`, `cross-spawn`, and `lucide-react`. Counts include optional platform packages and are not a legal compatibility conclusion.

| Declared expression | Package records |
|---|---:|
| MIT | 371 |
| Apache-2.0 | 24 |
| Apache-2.0 AND MIT | 11 |
| ISC | 33 |
| BSD-2-Clause | 6 |
| BSD-3-Clause | 4 |
| BlueOak-1.0.0 | 4 |
| 0BSD | 1 |
| CC-BY-4.0 | 1 |
| MIT AND ISC | 1 |
| Python-2.0 | 1 |
| UNKNOWN | 4 |

The scan establishes only that package metadata declares these expressions. A seller still needs to review direct and transitive package notices, attribution obligations, bundled assets/fonts, generated code, and compatibility with the intended sale or license. The repository itself has no root license file, so no project reuse terms are stated.

## Vulnerability audit

The 27 October 2026 audit reports **zero known vulnerabilities**. To resolve the earlier 9 findings, Vite was upgraded to 6.4.5, `@vitejs/plugin-react-swc` to 3.11.0, and React Router DOM to 7.18.4. Unused Zod, `@hookform/resolvers`, Tailwind Typography, and Lovable's development tagger were removed. The Vite config no longer binds the development server to all network interfaces. `npm audit` must be re-run before listing because registry advisories change. This result does not certify the code or deployed environment as vulnerability-free.

The database removal passed Node 22/24 lint, type-check, domain tests, production build, HTTP smoke, and browser walkthrough in [PR #8 CI run 40635970820](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40635970820); the disposable database job was removed with the backend integration. On 28 October, `npm ci` completed locally, installed 400 packages, and reported zero known vulnerabilities. The new workflow branch passes lint, typecheck, build, and all five Chromium tests locally; it still needs a fresh CI run. `npm audit` must be rerun before listing because registry advisories change.

Run `npm audit` again before a listing or dependency release. The count is a time-specific registry result and can change. This report is not a claim that the repository is vulnerability-free.
