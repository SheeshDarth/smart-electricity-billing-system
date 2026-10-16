# Market landscape and differentiation hypothesis

Research snapshot: 16 October 2026. This is a public-document review, not a vendor bake-off or proof that every feature is available in every edition. Use unknown where public pages do not substantiate a detail.

## Adjacent product categories

| Category / example | Publicly described capabilities | What this means for the product |
|---|---|---|
| Home energy dashboards — Home Assistant | Energy view for consumption, production, batteries/storage, and utility meters across supported integrations. [Energy dashboard documentation](https://www.home-assistant.io/docs/energy/) | A chart, home energy view, or broad device support alone is not differentiation. |
| Utility billing — Egrid | Describes billing with tariff slabs, taxes, arrears, payments, and meter integration. [Product page](https://www.smartegrid.in/products-services.html) | A fixed ₹/kWh display is only an illustrative calculator. Real billing needs rules, effective dates, adjustments, and reconciliation. |
| Utility AMI — JioThings | Describes smart metering and AMI/AMR connectivity, meter data, and utility workflows. [Smart electricity metering](https://www.jio.com/business/services/iot/smart-electricity-metering/) | Do not position this prototype as a DISCOM or utility AMI replacement. |
| Utility AMI / SCADA — NDMC | Describes smart-city SCADA and AMI work with head-end and meter-data management components. [Project overview](https://smartcity.ndmc.gov.in/content/projects/project-details/scada) | Utility-scale integration, operations, and procurement are a separate product and validation track. |
| Building / power monitoring — Schneider Electric EcoStruxure Power Monitoring Expert | Describes power monitoring, alarms, reporting, and analysis for facilities. [Product range](https://www.se.com/us/en/product-range/65404-ecostruxure-power-monitoring-expert/) | Monitoring and alerts are established capabilities. The Watt2Yield reference is useful for evidence quality, not a claim of novelty. |
| Industrial energy management — Siemens Energy Manager | Describes energy and resource monitoring/management for industrial operations. [Product page](https://www.siemens.com/en-us/energy-manager/) | Cross-site and industrial dashboards are a competitive category, not a standalone moat. |
| Industrial energy management — ABB | Describes energy management, monitoring, and reporting for industrial/sustainability needs. [Energy monitoring and reporting](https://new.abb.com/industrial-software/sustainability/energy-management-system-ems/energy-monitoring-and-reporting) | “AI energy monitoring” or energy per unit alone is too broad to support a distinctiveness claim. |

## Standards and integration context

DLMS/COSEM and OPC UA define mature data-exchange options in their respective utility-meter and industrial contexts. They are adapter candidates; this repository does not implement either protocol. [DLMS specifications](https://www.dlms.com/core-specifications/), [OPC UA overview](https://opcfoundation.org/about/opc-technologies/opc-ua/).

## Product implications

1. **Do not sell charts as the moat.** Consumption dashboards, alarms, meter management, portfolio views, and generic anomalies already exist across adjacent categories.
2. **Do not claim AI savings from synthetic data.** This branch has no trained AI or real-world savings result.
3. **Keep the buyer promise narrow:** bring supported heterogeneous readings into a common site model; make missing/invalid data visible; explain cost assumptions; capture a human decision; and measure a comparable outcome when the evidence exists.
4. **Treat differentiation as a hypothesis:** low-friction onboarding across mixed sources plus trustworthy data lineage and intervention verification may be valuable to a target buyer. It needs interviews and pilot evidence.
5. **Use the Schneider/Watt2Yield project as product discipline:** relate energy to good output where production context exists, retain quality and throughput guardrails, get operator approval, and compare matched periods. The project itself noted generic monitoring and energy-per-unit analysis as competitive features; the stronger idea is evidence-backed, constrained verification.
6. **Build the adapter boundary before chasing protocols.** Select DLMS/COSEM, OPC UA, MQTT, vendor APIs, or another connector only for a validated customer with data access, supported equipment, and a bounded integration cost.

## Questions for competitor and buyer validation

For a selected buyer segment, compare systems by: source integrations and onboarding time; hierarchy and roles; interval/cumulative semantics; timestamp and quality handling; tariff configurability; data lineage; alert explanations; human approval and action log; matched verification; deployment/data export; access control; retention; and measurable outcomes. Record supported, partially supported, unknown, and not applicable, with a dated source or interview note for every entry. Public marketing copy does not establish reliability, accuracy, or customer outcomes.

## Sources

- Home Assistant, [Energy dashboard](https://www.home-assistant.io/docs/energy/)
- Egrid, [Products and services](https://www.smartegrid.in/products-services.html)
- JioThings, [Smart electricity metering](https://www.jio.com/business/services/iot/smart-electricity-metering/)
- NDMC, [SCADA/AMI project overview](https://smartcity.ndmc.gov.in/content/projects/project-details/scada)
- Schneider Electric, [EcoStruxure Power Monitoring Expert](https://www.se.com/us/en/product-range/65404-ecostruxure-power-monitoring-expert/)
- Siemens, [Energy Manager](https://www.siemens.com/en-us/energy-manager/)
- ABB, [Energy monitoring and reporting](https://new.abb.com/industrial-software/sustainability/energy-management-system-ems/energy-monitoring-and-reporting)
- DLMS User Association, [Core specifications](https://www.dlms.com/core-specifications/)
- OPC Foundation, [OPC UA](https://opcfoundation.org/about/opc-technologies/opc-ua/)
