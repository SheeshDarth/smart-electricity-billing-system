# Energy archive format v1

The energy archive is a portable JSON snapshot format for Wattwise's canonical energy records. The implementation is in src/domain/energyArchive.mjs. It is a domain utility only: the browser UI, Supabase database, and production import/export workflow do not use it yet.

## Envelope

A v1 document has these required top-level fields:

- format: wattwise.energy-archive
- schemaVersion: integer 1
- exportedAt: timestamp with an explicit timezone offset
- organizations, sites, areas, assets, meters, adapters, measurements, tariffs, billingRuns, insights, and interventions: arrays of records

The parser rejects an unknown format identifier, any schema version other than 1, missing collections, non-record entries, malformed JSON, and UTF-8 input larger than 10 MiB.

## Measurement validation

Each measurement record needs a non-empty event, site, and meter identifier; a positive integer record schema version; measuredAt with an explicit timezone; a supported kind; a non-empty unit; a finite numeric value; and a supported quality value.

Supported kinds are interval_energy, cumulative_energy, power, voltage, and current. Supported quality values are valid, suspect, invalid, and quarantined. An interval_energy record also needs intervalStart and intervalEnd timestamps, with the start earlier than the end. CamelCase and snake_case aliases are accepted for the identity and timestamp fields listed by the parser.

Example:

~~~js
import { createEnergyArchive, parseEnergyArchive } from "./src/domain/energyArchive.mjs";

const json = createEnergyArchive({
  sites: [{ id: "site-demo", name: "Synthetic office" }],
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

## Current limits

The parser checks the envelope, generic row shape, and listed measurement fields. It does not validate relationships between IDs, field-level schemas for other collections, signatures, authenticity, encryption, or data provenance. Unknown fields are retained. The archive is not a database backup or transactional import package.

Do not use this format to move customer data until access, privacy, retention, and transfer rights are reviewed. Before adding production import, define reference-integrity checks, duplicate/conflict behavior, rollback boundaries, data-size strategy, compatibility rules, and security review. Breaking contract changes should use a new schema version with explicit migration or rejection behavior.
