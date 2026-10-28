# Energy archive format v1

The energy archive is a portable JSON snapshot format for Wattwise's canonical energy records. The implementation is in `src/domain/energyArchive.mjs`; the **Archive** view in the browser app now exports a synthetic archive and validates a selected JSON file locally. A valid file can be downloaded as a normalized copy. The demo has no database and does not merge imported records into application state.

## Envelope

A v1 document has these required top-level fields:

- format: wattwise.energy-archive
- schemaVersion: integer 1
- exportedAt: timestamp with an explicit timezone offset
- organizations, sites, areas, assets, meters, adapters, measurements, tariffs, billingRuns, insights, and interventions: arrays of records

The parser rejects an unknown format identifier, any schema version other than 1, missing collections, non-record entries, duplicate record IDs, malformed JSON, and UTF-8 input larger than 10 MiB. Records with known cross-record references are checked against the matching collection; dangling references invalidate the entire archive. `inspectEnergyArchive(text)` returns every detected issue and collection counts without returning a partially usable archive. `parseEnergyArchive(text)` throws on the first issue, and `createEnergyArchive(input)` serializes and validates its output.

## Measurement validation

Each measurement record needs a non-empty event, site, and meter identifier; a positive integer record schema version; measuredAt with an explicit timezone; a supported kind; a non-empty unit; a finite numeric value; and a supported quality value.

Supported kinds are interval_energy, cumulative_energy, power, voltage, and current. Supported quality values are valid, suspect, invalid, and quarantined. An interval_energy record also needs intervalStart and intervalEnd timestamps, with the start earlier than the end. CamelCase and snake_case aliases are accepted for the identity and timestamp fields listed by the parser.

Example:

~~~js
import { createEnergyArchive, parseEnergyArchive } from "./src/domain/energyArchive.mjs";

const json = createEnergyArchive({
  sites: [{ id: "site-demo", name: "Synthetic office" }],
  meters: [{ id: "meter-demo-1", siteId: "site-demo", name: "Synthetic meter" }],
  measurements: [{
    eventId: "event-demo-1",
    siteId: "site-demo",
    meterId: "meter-demo-1",
    schemaVersion: 1,
    measuredAt: "2026-10-20T12:15:00Z",
    kind: "interval_energy",
    unit: "Wh",
    value: 500,
    quality: "valid",
    intervalStart: "2026-10-20T12:00:00Z",
    intervalEnd: "2026-10-20T12:15:00Z",
    sourceRecordRef: "synthetic-row-1",
  }],
});

const archive = parseEnergyArchive(json);
console.log(archive.measurements.length); // 1
~~~

createEnergyArchive fills omitted collections with empty arrays, creates readable JSON, enforces the size limit, and validates its own output. parseEnergyArchive parses and validates text and returns the resulting JavaScript object. Both throw TypeError for invalid input.

## Safe browser workflow and limits

The browser checks file size before reading, validates the complete document locally, shows the issue list and collection counts, and offers a round-trip download only after the whole archive passes. A failure clears the previous validation state; no rows are partially applied or written to application state. The format is not a database backup or transactional production import package.

Unknown fields are retained for forward-compatible review. The current checker does not establish archive authenticity, signatures, encryption, authorization, or data provenance, and it does not yet define full field-level schemas for every non-measurement collection. Do not use this demo to move customer data until access, privacy, retention, ownership, and transfer rights are reviewed. A production importer still needs a transactional database boundary, identity/conflict policy, rollback and audit logs, authorization, larger-file strategy, and security review. Breaking contract changes should use a new schema version with explicit migration or rejection behavior.
