# Local CSV-to-e-bill estimate workflow

## Purpose

The E-bill workspace turns validated interval-energy readings into a downloadable PDF estimate. It gives a reviewer a concrete way to check the chain from source rows through unit normalization and a selected tariff to the estimated energy charge.

The PDF is a Wattwise estimate, not an official utility bill, invoice, statement of account, or amount due. It does not collect payment or certify a tariff. The workflow is a local browser feature and does not require Supabase credentials.

## User flow

1. Open E-bill in the navigation.
2. Load the synthetic sample or choose a local CSV.
3. Map the interval end timestamp and energy value. Optionally map meter ID, unit, interval start, and event ID.
4. Select one meter for the bill, choose a default unit and interval length where needed, and review row outcomes.
5. Set currency, IANA timezone, tariff version, and a flat per-kWh rate.
6. Review the coverage window, accepted intervals, total kWh, and calculated energy charge. Expand calculation detail to inspect the first 12 lines, or download the complete calculation CSV for every interval and the final estimate summary.
7. Optionally enter a supplier-stated total. The user must confirm it covers the same reading window before the estimate-minus-statement variance is included.
8. Generate the e-bill and download the PDF.

The sample is synthetic and intended only to demonstrate this flow.

## CSV contract

- UTF-8 CSV with a single header row and comma delimiters. Quoted fields and escaped quotes are supported.
- Maximum file size is 5 MiB and maximum data row count is 50,000.
- Timestamp and energy value columns are required.
- Every timestamp must include an explicit UTC offset, for example 2026-10-16T08:15:00+05:30 or 2026-10-16T02:45:00Z.
- The timestamp column represents the interval end. Map an interval start column when available; otherwise configure the source interval duration, which defaults to 15 minutes.
- Values are non-negative decimal interval energy in Wh or kWh. Thousands separators, power values, voltage, current, and cumulative registers are rejected or unsupported.
- A meter ID can be mapped from the file or supplied in the default meter field. One meter is selected for each e-bill.
- Identical repeated meter intervals are ignored and counted. Different values for the same meter interval are rejected. Reused event identifiers are rejected.

Example:

    timestamp,meter_id,energy_kwh,interval_start,event_id
    2026-10-16T08:15:00+05:30,MTR-041,0.28,2026-10-16T08:00:00+05:30,READ-001
    2026-10-16T08:30:00+05:30,MTR-041,0.31,2026-10-16T08:15:00+05:30,READ-002

Rows are parsed in the browser and are not posted to an application server. The UI reports row number and validation reason. It does not persist import files, readings, or generated bills.

## Calculation and generated document

For this workflow, the amount is calculated by the existing deterministic energy-cost domain function using the validated interval energy, selected flat rate, currency, tariff timezone, tariff version, and a tariff window covering the imported readings. Gaps, overlaps, invalid rows, malformed intervals, invalid tariff details, and incompatible units withhold generation. A gap is never treated as zero energy.

The estimate workspace also provides an expandable line-item view and a full calculation CSV. Each exported line links a calculated interval to its CSV source-record reference and retains the source value and unit alongside normalized energy, flat tariff rate, and interval charge. It states whether the unit came from a mapped CSV column or the user's configured default. The CSV includes every interval and a summary row with estimated energy, charge, tariff version, calculation version, duplicate count, and estimate-only status. Text cells are quoted and formula-like values are prefixed to reduce spreadsheet formula execution risk. The displayed and exported total is rounded to two decimal places; line-item precision does not imply that the supplier uses the same rounding method. The browser view shows only the first 12 intervals for large imports, while the download includes all validated intervals.

The PDF includes:

- bill reference, generation time, site and meter labels;
- the first accepted interval start and last accepted interval end in UTC;
- validated energy total, accepted interval count, and duplicate count;
- selected flat rate, currency, tariff version, and calculation version;
- estimated energy charge;
- a supplier-stated total and variance only after same-period confirmation;
- the excluded charge classes and an estimate-only disclosure.

The Chromium walkthrough downloads the generated PDF and verifies its `.pdf` filename, header, expected estimate and variance, and official-invoice disclaimer. These browser assertions passed in the latest known [PR #8 CI run](https://github.com/SheeshDarth/smart-electricity-billing-system/actions/runs/40500322202), which predates the calculation CSV E2E assertion. Replacing a CSV or changing its mapping, meter, or interval definition clears the previous supplier comparison. Domain tests separately verify cross-reference structure and additional required disclosures.

The estimate excludes taxes, fixed charges, demand charges, arrears, export credits, corrections, meter multipliers, and jurisdiction-specific rules. No unsupported charge is silently added as zero or inferred from a supplier bill. Supplier amount is entered manually; the app does not upload or parse utility bill documents.

## Operational boundary

The workspace runs without a board, physical meter, gateway, remote database, or payment rail. It does not change the legacy login/admin/user billing screens. Its PDF generation is separate from the legacy demo bill document and payment flag.

Before using customer data, validate file formats, tariff inputs, period alignment, retention, access, and deletion requirements with a buyer. Before representing a generated document as an official invoice, implement and independently validate applicable tariff components, tax rules, rounding, corrections, audit retention, authorization, and jurisdiction-specific requirements.

See [demo walkthrough](digital-twin-demo-guide.md), [feature status](feature-status.md), and [roadmap](roadmap.md).
