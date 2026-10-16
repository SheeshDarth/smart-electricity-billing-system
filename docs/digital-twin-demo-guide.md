# Browser digital-twin demo guide

## What this demo is

The browser twin is a synthetic walkthrough of how a replaceable energy source could move through validation, normalization, site reporting, a deterministic cost estimate, a human review, and a simulated verification step. It runs without ESP32 hardware, a gateway, a live meter, Supabase credentials, or an AI service.

Use it to review product workflow and data handling. It is not an operational monitoring or utility-billing system.

## Start locally

Requirements: Node.js 22 or newer and npm.

    npm ci
    npm run dev

Open the Vite URL shown in the terminal. The core twin works without creating an environment file or connecting a database.

## Walk through the workflow

1. Choose a sample site from the portfolio. Home, office, and industrial examples share the same navigation and energy view, but only show contextual metrics where the synthetic profile supplies the required inputs.
2. Choose a twin scenario from the scenario control.
3. Review the overview cards and site comparison. Open **View data lineage** to see source, event time, interval semantics, quality path, tariff version, and calculation context.
4. Open **Workflow** and follow the event through the visible stages. Review accepted, quarantined, and duplicate counts before interpreting the resulting site metric.
5. Record an operator review decision. The choice is local demo state and does not trigger a device command or persistent business action.
6. Use the evidence JSON export control to save a synthetic scenario snapshot. It contains demonstration state; it is not a portable export of a real site's measurement history.

## Scenarios

| Scenario | What it demonstrates | Expected interpretation |
|---|---|---|
| Normal | Valid interval readings flow into the site view. | A deterministic rule describes the sample pattern; it does not diagnose a fault. |
| Usage spike | A synthetic interval exceeds the rule's reference band. | Investigate schedule, load, and data quality before attributing a cause. |
| Stale source | The twin withholds current-period totals when recent intervals are missing. | Missing energy is shown as unavailable and is never filled with zero. |
| Duplicate event | A repeated event ID is included in the source trace. | The repeated event is counted once and the suppressed duplicate remains visible in the trace. |
| Counter reset | A cumulative register decreases without a configured rollover limit. | The delta is quarantined until reset or rollover semantics are verified. |
| Invalid unit | A power unit (W) is declared for interval energy. | The bad event is quarantined before it can affect cost calculation. Other valid sample intervals remain distinct. |
| Tariff change | A versioned time-of-use tariff is used for the estimate. | Interval energy is allocated by elapsed time across local-hour rate boundaries. The sample rate is illustrative. |

The scenario controls inject known conditions into synthetic data. They do not prove how a real meter, gateway, utility tariff, or production system will behave.

## Read the values correctly

- **Energy** is reported from synthetic interval readings and depends on the selected site and scenario.
- **Cost** is a deterministic estimate from validated intervals and the selected demo tariff. It is not an invoice, payment request, or authoritative utility charge.
- **Quality** describes the generated sample event outcomes. It does not represent the reliability of a real meter fleet or service-level performance.
- **Freshness** is a simulated status. No live heartbeat is being monitored.
- **Energy per good unit** is an illustrative industrial context metric. It is meaningful only when energy, good output, reject count, operating period, and product/load context are comparable.
- Values that are synthetic, calculated, estimated, unavailable, or simulated should retain those labels when shown or exported.

## Watt2Yield reference

The industrial example follows the Schneider Watt2Yield project's evidence discipline: relate energy to good output, identify a deviation, provide context, ask an operator to decide, and compare a matched before/after period with throughput and quality guardrails. It uses only synthetic dashboard values and does not reuse Schneider source code or hardware assumptions.

A real savings claim would require site data, matched operating conditions, a documented baseline, and evidence that throughput and product quality were preserved. The demo's before/after state is simulated and makes no savings claim.

## Limits

- No ESP32 board, relay, physical controller, live meter, gateway, DLMS/COSEM, OPC UA, MQTT, or vendor adapter is implemented.
- The app does not control equipment or execute recommendations.
- There is no AI/LLM inference or GPU workload. Monitoring and cost estimation are deterministic and remain usable without AI.
- The INR currency, tariff versions, rates, site records, event times, and readings are sample values, not jurisdiction-specific configuration.
- The JSON evidence snapshot is not a full data export/import or buyer migration tool.
- The inherited login, admin, and user billing routes are separate legacy screens and are not part of this walkthrough.

For current implementation boundaries and release gates, see [feature and readiness matrix](feature-status.md) and [architecture and data contract](architecture.md).
