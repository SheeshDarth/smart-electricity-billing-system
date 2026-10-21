# Browser digital-twin demo guide

## Purpose

The browser twin is synthetic content for reviewing the current electricity usage, validation, tariff estimate, and reviewer workflow. It requires no board, physical meter, gateway, Supabase credentials, or AI service. The industrial example is illustrative only; industrial optimization and the rejected Schneider-linked idea are not product requirements.

This is not operational monitoring, utility billing, bill reconciliation, payment processing, or a production meter platform.

## Start locally

Requirements: Node.js 22 or newer and npm.

    npm ci
    npm run dev

Open the Vite URL shown in the terminal. The browser twin works without an environment file or database connection.

## Follow the visual workflow

1. Choose a synthetic site and meter in the portfolio.
2. Select a scenario to add normal or faulty sample readings.
3. Review the site view and open View data lineage for source, event time, interval meaning, quality, tariff, and calculation context.
4. Open Workflow and inspect the path from generated event to validation outcome, estimate, reviewer choice, and simulated outcome.
5. Check accepted, duplicate, rejected, or quarantined counts before interpreting totals.
6. Record an operator review decision. It stays in local demo state and does not change a physical device or create a persisted customer record.
7. Use the evidence JSON control to download a synthetic scenario snapshot. The file contains selected demo context; it is not a full reading-history export, database backup, or the new schema-v1 energy archive.

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

## Interpret metrics

- Energy values come from synthetic records and depend on selected site/scenario.
- Cost is a deterministic estimate from accepted records and the demo tariff. It is not an invoice or an amount due.
- Quality and freshness describe generated sample records, not a live device fleet or service-level objective.
- Industrial energy-per-good-unit context, if visible, is sample data only. It does not represent a supported industrial product feature or measured saving.
- Keep synthetic, calculated, estimated, unavailable, and simulated labels attached when showing or exporting results.

## Limits and next product step

- There is no CSV importer, supplier bill comparison, live adapter, production alert, or persisted human-review workflow yet.
- The energy archive parser/serializer in src/domain/energyArchive.mjs is a domain utility only; this UI does not call it.
- No DLMS/COSEM, OPC UA, MQTT, vendor API, or gateway connector is implemented.
- No physical control, AI/LLM inference, or GPU workload is present.
- INR, tariffs, timestamps, sites, and readings are synthetic and not jurisdiction-specific.
- Legacy login/admin/user billing routes are separate and remain dependent on an older schema.

The proposed next user-evaluable feature is a read-only file-import preview, followed by transparent estimate-to-bill variance review only after buyer interviews confirm that need. See [product scope](product-scope.md), [feature readiness](feature-status.md), and [architecture](architecture.md).
