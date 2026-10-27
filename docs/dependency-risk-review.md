# Dependency and license metadata review

Reviewed on 27 October 2026 against the committed npm lockfile.

## License metadata inventory

`npm run audit:licenses` reads each lockfile package's metadata (and installed package metadata where available) and reports declared license expressions. The current lock contains 469 package records, including 67 direct dependencies. The scan found a license declaration for every record. Counts include optional platform packages and are not a legal compatibility conclusion.

| Declared expression | Package records |
|---|---:|
| MIT | 381 |
| Apache-2.0 | 25 |
| Apache-2.0 AND MIT | 11 |
| ISC | 34 |
| BSD-2-Clause | 6 |
| BSD-3-Clause | 4 |
| BlueOak-1.0.0 | 4 |
| 0BSD | 1 |
| CC-BY-4.0 | 1 |
| MIT AND ISC | 1 |
| Python-2.0 | 1 |

The scan establishes only that package metadata declares these expressions. A seller still needs to review direct and transitive package notices, attribution obligations, bundled assets/fonts, generated code, and compatibility with the intended sale or license. The repository itself has no root license file, so no project reuse terms are stated.

## Vulnerability audit

The 27 October 2026 audit reports **zero known vulnerabilities**. To resolve the earlier 9 findings, Vite was upgraded to 6.4.5, `@vitejs/plugin-react-swc` to 3.11.0, and React Router DOM to 7.18.4. Unused Zod, `@hookform/resolvers`, Tailwind Typography, and Lovable's development tagger were removed. The Vite config no longer binds the development server to all network interfaces. `npm audit` must be re-run before listing because registry advisories change. This result does not certify the code or deployed environment as vulnerability-free.

The dependency changes passed local lint, type-check, domain tests, production build, browser tests, and HTTP smoke checks. PR CI must pass again for the updated dependency set before merge.

Run `npm audit` again before a listing or dependency release. The count is a time-specific registry result and can change. This report is not a claim that the repository is vulnerability-free.
