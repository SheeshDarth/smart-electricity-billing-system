# Domain test and coverage report

Measured locally on 28 October 2026 with Node.js v24.12.0 using `npm run test:coverage` (`node --experimental-test-coverage --test`). The command passed **51 tests** and reports coverage for the JavaScript domain modules loaded by the test suite.

| Module | Lines | Branches | Functions |
|---|---:|---:|---:|
| `billWorkflow.mjs` | 90.43% | 73.50% | 100.00% |
| `ebillPdf.mjs` | 100.00% | 83.87% | 100.00% |
| `energyArchive.mjs` | 100.00% | 96.40% | 100.00% |
| `energyModel.mjs` | 87.64% | 69.59% | 97.37% |
| **Measured aggregate** | **91.79%** | **77.43%** | **99.05%** |

The aggregate includes only these four modules. This report does not measure React components, end-to-end UI code, SQL/RLS policy branches, or deployed behavior. The Playwright suite and pgTAP suite are separate checks and are not included in the Node coverage percentages.

Added domain cases cover sorted out-of-order intervals, duplicate suppression, interval overlap rejection, currency rounding, tariff-version boundaries, tariff gaps/overlaps, spring-forward and fall-back timezones, cumulative meter reset validation, flat and time-of-use calculation CSV export, PDF tariff schedule disclosure, and formula-safe text cells. Coverage values should be refreshed after code or test changes; do not enter these numbers as UI, database, or whole-repository coverage.
