import { useRef, useState, type ChangeEvent } from "react";
import { Archive, CheckCircle2, Download, FileUp, Info, TriangleAlert } from "lucide-react";
import {
  createEnergyArchive,
  inspectEnergyArchive,
  MAX_ENERGY_ARCHIVE_BYTES,
} from "@/domain/energyArchive.mjs";

type Inspection = {
  valid: boolean;
  issues: string[];
  counts: Record<string, number | null> | null;
  archive: unknown | null;
};

const COLLECTION_LABELS: Record<string, string> = {
  organizations: "Organizations", sites: "Sites", areas: "Areas", assets: "Assets",
  meters: "Meters", adapters: "Adapters", measurements: "Measurements", tariffs: "Tariffs",
  billingRuns: "Billing runs", insights: "Insights", interventions: "Interventions",
};

function syntheticArchive() {
  const start = "2026-10-16T08:00:00.000Z";
  const end = "2026-10-16T08:15:00.000Z";
  return createEnergyArchive({
    organizations: [{ id: "org-demo", name: "Synthetic demo organization" }],
    sites: [{ id: "site-demo", organizationId: "org-demo", name: "Sample energy site", sector: "office" }],
    meters: [{ id: "meter-demo", organizationId: "org-demo", siteId: "site-demo", name: "Sample meter", canonicalUnit: "kWh" }],
    adapters: [{ id: "adapter-demo", organizationId: "org-demo", siteId: "site-demo", meterId: "meter-demo", type: "synthetic-csv" }],
    measurements: [{
      eventId: "event-demo-1", siteId: "site-demo", meterId: "meter-demo", adapterId: "adapter-demo",
      schemaVersion: 1, measuredAt: end, kind: "interval_energy", unit: "kWh", value: 0.5,
      quality: "valid", intervalStart: start, intervalEnd: end, sourceRecordRef: "synthetic-row-1",
    }],
    tariffs: [{ id: "tariff-demo", organizationId: "org-demo", siteId: "site-demo", version: "DEMO-1" }],
    billingRuns: [{ id: "billing-demo", organizationId: "org-demo", siteId: "site-demo", tariffId: "tariff-demo" }],
    insights: [{ id: "insight-demo", organizationId: "org-demo", siteId: "site-demo" }],
    interventions: [{ id: "intervention-demo", organizationId: "org-demo", siteId: "site-demo", insightId: "insight-demo" }],
  });
}

function saveArchive(text: string, filename: string) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function EnergyArchiveWorkspace() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [inspection, setInspection] = useState<Inspection | null>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setFileName(file?.name ?? "");
    setInspection(null);
    if (!file) return;
    if (file.size > MAX_ENERGY_ARCHIVE_BYTES) {
      setInspection({ valid: false, issues: ["document exceeds the 10 MiB size limit"], counts: null, archive: null });
      return;
    }
    try {
      const report = inspectEnergyArchive(await file.text()) as Inspection;
      setInspection(report);
    } catch {
      setInspection({ valid: false, issues: ["file could not be read as text"], counts: null, archive: null });
    }
  };

  const exportSynthetic = () => saveArchive(syntheticArchive(), "wattwise-synthetic-energy-archive.json");
  const downloadValidatedCopy = () => {
    if (!inspection?.valid || !inspection.archive) return;
    const normalized = createEnergyArchive(inspection.archive as Record<string, unknown>);
    saveArchive(normalized, "wattwise-validated-energy-archive.json");
  };

  return <div className="space-y-5">
    <section className="rounded-2xl border border-violet-300/15 bg-gradient-to-br from-violet-300/[0.08] to-[#10191e] p-5 sm:p-7">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-violet-200"><Archive size={15} />Portable data workspace</div>
      <h2 className="mt-3 text-xl font-semibold sm:text-2xl">Export and validate an energy archive</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">Move a versioned, provider-neutral JSON snapshot between environments. Selected files are validated as a whole and summarized locally; this demo does not write imported data to a database.</p>
    </section>

    <section className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-2xl border border-white/[0.08] bg-[#10191e] p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><Download size={16} className="text-cyan-200" />Export</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">Download a synthetic archive with linked organization, site, meter, adapter, reading, tariff, bill run, insight, and intervention records. The app stores no customer records.</p>
        <button onClick={exportSynthetic} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-200"><Download size={14} />Export synthetic archive</button>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#10191e] p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><FileUp size={16} className="text-cyan-200" />Import validation</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">Choose a Wattwise archive JSON file up to 10 MiB. The validator checks the envelope, all collection records, measurement fields, duplicate identifiers, and known cross-record references.</p>
        <input ref={fileInput} type="file" accept=".json,application/json" aria-label="Choose Wattwise energy archive" className="sr-only" onChange={(event) => void handleFile(event)} />
        <button onClick={() => fileInput.current?.click()} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 px-4 py-2.5 text-xs font-medium text-cyan-100 hover:bg-cyan-300/[0.07]"><FileUp size={14} />Choose archive JSON</button>
        {fileName && <span className="ml-3 text-xs text-slate-300">{fileName}</span>}
        <p className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-slate-500"><Info size={12} className="mt-0.5 shrink-0" />Validation runs locally in this browser. Invalid or partial files are rejected as a whole; no records are applied to the application.</p>
      </div>
    </section>

    {inspection && <section aria-live="polite" className="rounded-2xl border border-white/[0.08] bg-[#10191e] p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {inspection.valid ? <CheckCircle2 size={16} className="text-emerald-200" /> : <TriangleAlert size={16} className="text-rose-200" />}
        {inspection.valid ? "Archive validation passed" : "Archive validation failed"}
      </h3>
      {inspection.valid && inspection.counts ? <>
        <p className="mt-2 text-xs text-emerald-100">All records passed validation. This file is ready for a validated round-trip export.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">{Object.entries(inspection.counts).map(([key, count]) => <div key={key} className="rounded-lg bg-black/20 p-3"><div className="text-[10px] text-slate-500">{COLLECTION_LABELS[key] ?? key}</div><div className="mt-1 text-sm font-semibold text-slate-200">{count ?? "Invalid collection"}</div></div>)}</div>
        <button onClick={downloadValidatedCopy} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-200"><Download size={14} />Download validated copy</button>
      </> : <>
        <p className="mt-2 text-xs text-rose-100">The file was rejected as a whole; no records were applied. Fix every issue below and choose the complete file again.</p>
        <ul className="mt-3 space-y-1 rounded-lg border border-rose-300/10 bg-rose-300/[0.04] p-3 text-[11px] text-rose-100" role="alert">{inspection.issues.map((issue, index) => <li key={index}>• {issue}</li>)}</ul>
      </>}
    </section>}
  </div>;
}
