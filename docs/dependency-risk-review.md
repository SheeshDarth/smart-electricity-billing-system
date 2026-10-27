# Dependency and license metadata review

Reviewed on 27 October 2026 against the committed npm lockfile.

## License metadata inventory

`npm run audit:licenses` reads each lockfile package's metadata (and installed package metadata where available) and reports declared license expressions. The current lock contains 497 package records, including 71 direct dependencies. The scan found a license declaration for every record. Counts include optional platform packages and are not a legal compatibility conclusion.

| Declared expression | Package records |
|---|---:|
| MIT | 411 |
| Apache-2.0 | 25 |
| Apache-2.0 AND MIT | 9 |
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

`npm audit fix` updated versions allowed by existing semver ranges without `--force`. The resulting audit reports **9 advisories: 7 moderate and 2 high**, with zero critical. The remaining affected dependency families include Vite/esbuild, `postcss-selector-parser`, React Router, and Zod. npm's suggested full fix crosses major versions for Vite, React Router, and Zod, and suggests changing the Tailwind typography dependency. Those migrations need compatibility review and the full CI matrix; no force upgrade was applied.

Run `npm audit` again before a listing or dependency release. The count is a time-specific registry result and can change. This report is not a claim that the repository is vulnerability-free.
