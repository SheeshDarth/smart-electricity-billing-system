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
4. [Time-of-use boundary allocation in the current CI screenshot artifact](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40633652147/artifacts/12792527679)

The checked-in first three PNGs predate the time-of-use calculation view. Download the linked four-image artifact to inspect the current screenshots from the passing production-build walkthrough.

The Playwright walkthrough includes a 30-minute synthetic reading that crosses from off-peak into peak time in Asia/Kolkata. It checks the half-hour energy allocation, both per-band charges, the complete calculation CSV, and PDF schedule. All four browser tests passed in [CI run 40633652147](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40633652147); the screenshots remain available as an artifact for 30 days. The workflow remains an estimate only; no payment is collected.

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
