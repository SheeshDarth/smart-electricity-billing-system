# Browser walkthrough: CSV to e-bill estimate

This walkthrough documents the browser-test path. It uses `public/sample-energy-readings.csv`, which contains synthetic 15-minute interval readings. The file is parsed in the browser and is not uploaded.

```mermaid
flowchart LR
  A[Select meter CSV] --> B[Map and validate rows]
  B -->|accepted readings only| C[Apply flat or two-band local-hour tariff]
  C --> D[Enter supplier-stated total]
  D --> E[Confirm same billing period]
  E --> F[Show estimate and variance]
  F --> G[Download labelled PDF estimate]
```

## Screenshots

The Playwright end-to-end test creates these screenshots from the production build:

1. [CSV upload and validation](assets/ebill-walkthrough/01-csv-validation.png)
2. [Estimate and supplier comparison](assets/ebill-walkthrough/02-estimate-comparison.png)
3. [Generated estimate and variance](assets/ebill-walkthrough/03-bill-variance.png)
4. [Time-of-use boundary allocation](assets/ebill-walkthrough/04-time-of-use-breakdown.png)

The four e-bill screenshots are generated from the production build by Playwright. They were refreshed in the five-test [PR #9 CI run 40653241434](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40653241434), which also captures the interactive workflow screenshot documented in the [interactive workflow walkthrough](interactive-workflow-walkthrough.md). The new [five-image artifact](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40653241434/artifacts/12800378284) is retained for 30 days. The previous CI run 40635600460 retains its earlier four-image artifact.

The Playwright walkthrough includes a 30-minute synthetic reading that crosses from off-peak into peak time in Asia/Kolkata. It checks the half-hour energy allocation, both per-band charges, the complete calculation CSV, PDF schedule, and interactive review gate. All five browser tests passed in [PR #9 CI run 40653241434](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40653241434), with a [five-image artifact](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40653241434/artifacts/12800378284) retained for 30 days. The e-bill remains an estimate only; no payment is collected.

## Run it locally

```sh
npm ci
npm run build
npm run test:e2e:install -- chromium
npm run test:e2e
```

The browser suite also checks that an invalid timestamp is reported as a rejected row and disables generation. Replacing the CSV clears the prior supplier amount and same-period confirmation; mapping, meter, and interval-definition changes also clear the comparison. CI runs these checks against the built app in Chromium.

## Scope limits

The current e-bill builder accepts interval-energy CSV in Wh or kWh, applies a flat rate or two-band time-of-use schedule by local clock hour, and optionally compares a manually entered supplier total after the user confirms matching periods. It does not parse supplier invoice files, persist uploaded data, model weekday/holiday/seasonal rules, calculate jurisdiction-specific charges, or issue an official bill.
