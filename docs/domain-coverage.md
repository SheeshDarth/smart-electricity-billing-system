# Domain test and coverage report

Measured locally on 27 October 2026 with Node.js v24.12.0 using `npm run test:coverage` (`node --experimental-test-coverage --test`). The command passed **47 tests** and reports coverage for the JavaScript domain modules loaded by the test suite.

| Module | Lines | Branches | Functions |
|---|---:|---:|---:|
| `billWorkflow.mjs` | 88.54% | 71.88% | 100.00% |
| `ebillPdf.mjs` | 100.00% | 85.71% | 100.00% |
| `energyArchive.mjs` | 100.00% | 96.40% | 100.00% |
| `energyModel.mjs` | 88.18% | 69.84% | 97.30% |
| **Measured aggregate** | **91.47%** | **77.34%** | **98.90%** |

The aggregate includes only these four modules. This report does not measure React components, end-to-end UI code, SQL/RLS policy branches, or deployed behavior. The Playwright suite and pgTAP suite are separate checks and are not included in the Node coverage percentages.

Added domain cases cover sorted out-of-order intervals, duplicate suppression, interval overlap rejection, currency rounding, tariff-version boundaries, tariff gaps/overlaps, spring-forward and fall-back timezones, and cumulative meter reset validation. Coverage values should be refreshed after code or test changes; do not enter these numbers as UI, database, or whole-repository coverage.
