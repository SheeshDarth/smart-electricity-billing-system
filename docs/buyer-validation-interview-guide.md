# Buyer validation: meter CSV and bill comparison

## Status

This is a field guide, not evidence that interviews have happened. No property or business operators were contacted during repository work. Ask for the owner's permission and conduct 3–5 short conversations before expanding sectors or integrations. Do not request actual customer bills or identifiable meter exports; synthetic or redacted examples are sufficient.

## Who to speak with

- A small property manager or housing-society administrator who reconciles utility or sub-meter bills.
- A small business owner or finance/facilities operator who receives meter exports and supplier bills.
- If available, one energy consultant or facilities contractor who handles multiple sites.

Prioritize people who perform the task themselves and have recently handled a bill. Avoid leading with AI or the proposed product.

## 15-minute script

1. “Think about the last time you checked an electricity bill. What triggered the review?”
2. “What readings or meter export did you have? What format and columns were present?”
3. “How did you decide the export and supplier bill covered the same meters and dates?”
4. “What did you calculate manually or in a spreadsheet? How long did it take?”
5. “What made you trust or distrust the comparison?”
6. “Did you find a discrepancy, and what action did you take?”
7. “Would a local CSV validator, a transparent tariff estimate, and a variance report help with a decision you actually make? What would still be missing?”
8. “Would you use this monthly, occasionally, or not at all? Who would approve payment for it?”

Ask to see only a synthetic, public, or fully redacted CSV layout. Record the participant's words, not a sales interpretation.

## Notes template

| Field | Record |
|---|---|
| Role and organization type | |
| Last bill review date and trigger | |
| Meter CSV available? file type and columns | |
| Supplier bill period and meter identifiers available? | |
| Current tool and time spent | |
| Main mismatch or trust concern | |
| Would the comparison change a real decision? | |
| Missing feature or blocker | |
| Repeated across participants? | |
| Consent to follow up | |

## Decision gate

After 3–5 interviews, continue only if at least two operators can access usable interval data, can match it to a supplier bill period, and identify a real review decision the evidence would improve. If they mainly need tariffs, invoice parsing, account access, regulatory calculations, or official billing, record those as blockers and validate scope and implementation cost before building them. Do not describe this small sample as market validation or generalize beyond the interviewed roles.
