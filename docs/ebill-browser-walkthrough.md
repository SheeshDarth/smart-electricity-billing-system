# Browser walkthrough: CSV to e-bill estimate

This walkthrough documents the current browser-tested path. It uses `public/sample-energy-readings.csv`, which contains synthetic 15-minute interval readings. The file is parsed in the browser and is not uploaded.

```mermaid
flowchart LR
  A[Select meter CSV] --> B[Map and validate rows]
  B -->|accepted readings only| C[Apply explicit flat tariff]
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

The browser test downloads the generated file and checks its name, `%PDF-1.4` header, estimated charge, supplier-total variance, and estimate-only disclosure. Those checks passed in [PR #8 CI](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40499896507). Separate domain tests also check the PDF cross-reference structure and required scope disclosures. It is an estimate only; no payment is collected.

## Run it locally

```sh
npm ci
npm run build
npm run test:e2e:install -- chromium
npm run test:e2e
```

The browser suite also checks that an invalid timestamp is reported as a rejected row and disables generation. Replacing the CSV clears the prior supplier amount and same-period confirmation; mapping, meter, and interval-definition changes also clear the comparison. CI runs these checks against the built app in Chromium.

## Scope limits

The current e-bill builder accepts interval-energy CSV in Wh or kWh, uses one explicit flat tariff, and optionally compares a manually entered supplier total after the user confirms matching periods. It does not parse supplier invoice files, persist uploaded data, calculate jurisdiction-specific charges, or issue an official bill. The additional multi-version tariff calculator is domain-tested but is not yet wired into this CSV screen.
