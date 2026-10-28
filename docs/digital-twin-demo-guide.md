# Browser digital-twin demo guide

## Purpose

The browser twin is synthetic content for reviewing the current electricity usage, validation, tariff estimate, and reviewer workflow. It requires no board, physical meter, gateway, remote backend, or AI service. The industrial example is illustrative only; industrial optimization and the rejected Schneider-linked idea are not product requirements.

The digital twin itself is not operational monitoring or a production meter platform. The app also includes a separate local E-bill workspace that generates a clearly labelled estimate PDF; it is not an official utility invoice, payment processor, or production billing service.

## Start locally

Requirements: Node.js 22 or newer and npm.

    npm ci
    npm run dev

Open the Vite URL shown in the terminal. The browser twin works without an environment file or database connection.

## Follow the visual workflow

1. Choose a synthetic site and meter in the portfolio.
2. Select a scenario to add normal or faulty sample readings.
3. Review the site view and open View data lineage for source, event time, interval meaning, quality, tariff, and calculation context.
4. Open Workflow and use Play to watch its seven stages advance from virtual source through local validation, estimate, human review, and simulated verification. Playback pauses at Human review until you choose Accept, Investigate, or Defer. Pause, replay, select any unlocked stage, or use Next/Previous to inspect it at your own pace.
5. Check accepted, duplicate, rejected, or quarantined counts before interpreting totals.
6. Record an operator review decision. It stays in local demo state and does not change a physical device or create a persisted customer record.
7. Use the evidence JSON control to download a synthetic scenario snapshot. The file contains selected demo context; it is not a full reading-history export, database backup, or the new schema-v1 energy archive.
8. Open E-bill to load a separate synthetic interval CSV or import a local CSV, review row outcomes, configure a flat or two-band time-of-use tariff, and generate a PDF estimate.

## Generate an e-bill estimate

1. Select E-bill in the navigation and choose Load synthetic sample or Choose CSV. CSV contents are parsed locally in the browser and are not uploaded.
2. Map the interval-end timestamp and energy-value columns. Map meter ID, unit, interval start, and event ID when present. If there is no interval-start column, choose the interval duration used to derive it.
3. Use timestamps with an explicit UTC offset, such as 2026-10-16T08:15:00+05:30 or 2026-10-16T02:45:00Z. Select a meter if the file contains more than one.
4. Review accepted rows, identical duplicates, and rejected rows. Conflicting values for the same meter interval are rejected. Any rejected row blocks PDF generation. Gaps or overlaps make the estimate incomplete rather than treating missing energy as zero.
5. Set the currency, IANA timezone, and tariff version. Select a flat rate or enter peak/off-peak rates and a local peak window. The estimate uses the selected meter's validated interval energy and the date window covered by those readings.
6. Optionally enter a supplier-stated amount and confirm that it covers the same period. The displayed variance is the estimate minus that manually entered amount.
7. Generate and download the PDF. It is marked as an estimate and states that taxes, fixed/demand charges, arrears, and export credits are excluded. It has no payment action and is not an amount officially due.

The builder supports interval-energy CSV values in Wh or kWh. Its two-band time-of-use example repeats by local clock hour every day; rates are illustrative and weekday, holiday, seasonal, and jurisdiction-specific rules are outside scope. Cumulative-register deltas, supplier invoice upload/parsing, taxes, fixed charges, persistence, and official utility billing are outside this implementation.

## Scenarios

| Scenario | What the demo injects | How to read the result |
|---|---|---|
| Normal | Valid interval-energy records | A deterministic sample estimate is shown for the configured demo tariff. |
| Usage spike | One synthetic interval exceeds the sample rule's reference | It flags an unusual value; it does not identify a cause. |
| Stale source | Recent expected intervals are withheld | Current-period totals can be incomplete; missing energy is not filled with zero. |
| Duplicate event | One event ID is repeated | The domain path suppresses a repeated ID in the batch and retains a visible trace. |
| Counter reset | A cumulative register decreases without a proven rollover | The delta is quarantined until reset/rollover semantics are known. |
| Invalid unit | An energy record declares an incompatible unit such as power | The malformed record is quarantined before it can affect the estimate. |
| Tariff change | A different versioned time-of-use sample tariff is selected | The estimate allocates energy by elapsed time across local-hour rate boundaries; rates are illustrative. |

These are deterministic injected conditions, not evidence that real equipment will generate or recover from faults this way.

The workflow is a small in-app animation, not a recorded video. It explains the synthetic path and does not animate a live ingestion service, persistent review, or physical intervention. The review choice exists in browser memory only. When the operating system requests reduced motion, playback becomes manual step-by-step navigation. See the [interactive workflow walkthrough](interactive-workflow-walkthrough.md) and its screenshot.

## Interpret metrics

- Energy values come from synthetic records and depend on selected site/scenario.
- Cost is a deterministic estimate from accepted records and the selected flat or time-of-use tariff. The generated PDF is not an official invoice or an amount due.
- Quality and freshness describe generated sample records, not a live device fleet or service-level objective.
- Industrial energy-per-good-unit context, if visible, is sample data only. It does not represent a supported industrial product feature or measured saving.
- Keep synthetic, calculated, estimated, unavailable, and simulated labels attached when showing or exporting results.

## Limits and next product step

- The CSV import and e-bill workflow is local-only and does not persist readings or bill records. Supplier comparison is manually entered; there is no supplier-document parser, live adapter, production alert, or persisted human-review workflow.
- The energy archive parser/serializer in src/domain/energyArchive.mjs is a domain utility only; this UI does not call it.
- No DLMS/COSEM, OPC UA, MQTT, vendor API, or gateway connector is implemented.
- No physical control, AI/LLM inference, or GPU workload is present.
- INR, tariffs, timestamps, sites, and readings are synthetic and not jurisdiction-specific.
- Authentication, backend persistence, and legacy login/admin/user billing routes are not included.

See the [e-bill workflow guide](ebill-generation.md), [product scope](product-scope.md), [feature readiness](feature-status.md), and [architecture](architecture.md). Buyer demand and production tariff requirements still need validation.
