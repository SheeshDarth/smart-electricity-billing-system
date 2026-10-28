import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  AlertTriangle, CheckCircle2, Download, FileText, FileUp, Info, Receipt,
} from "lucide-react";
import {
  createEnergyBill, createEnergyCalculationCsv, inspectEnergyCsv, MAX_ENERGY_CSV_BYTES, parseEnergyCsv,
  suggestEnergyCsvMapping,
} from "@/domain/billWorkflow.mjs";
import { estimateEnergyCost } from "@/domain/energyModel.mjs";
import { createEnergyBillPdf } from "@/domain/ebillPdf.mjs";

type CsvMapping = {
  timestamp: string;
  value: string;
  meterId: string;
  unit: string;
  intervalStart: string;
  eventId: string;
};

type Props = {
  siteId: string;
  siteName: string;
  defaultMeterId: string;
};

const MAPPING_FIELDS: { key: keyof CsvMapping; label: string; required: boolean }[] = [
  { key: "timestamp", label: "Interval end timestamp", required: true },
  { key: "value", label: "Energy value", required: true },
  { key: "meterId", label: "Meter ID", required: false },
  { key: "unit", label: "Unit", required: false },
  { key: "intervalStart", label: "Interval start", required: false },
  { key: "eventId", label: "Event ID", required: false },
];

function money(currency: string, value: number) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value);
  } catch {
    return currency + " " + value.toFixed(2);
  }
}

function displayDate(value: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium", timeStyle: "short", timeZone: timezone,
    }).format(new Date(value));
  } catch {
    return new Date(value).toISOString();
  }
}

function MappingSelect({
  label, value, headers, required, onChange,
}: {
  label: string; value: string; headers: string[]; required: boolean; onChange: (value: string) => void;
}) {
  return <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-slate-300">{label}{required ? " *" : ""}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-white/10 bg-[#0a1115] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-300/50"
    >
      {!required && <option value="">No column selected</option>}
      {headers.map((header) => <option key={header} value={header}>{header}</option>)}
    </select>
  </label>;
}

export default function EbillWorkspace({ siteId, siteName, defaultMeterId }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [classification, setClassification] = useState<"synthetic-demo" | "user-uploaded-csv">("synthetic-demo");
  const [billSiteName, setBillSiteName] = useState(siteName);
  const [mapping, setMapping] = useState<CsvMapping>({
    timestamp: "", value: "", meterId: "", unit: "", intervalStart: "", eventId: "",
  });
  const [fallbackMeterId, setFallbackMeterId] = useState(defaultMeterId);
  const [selectedMeter, setSelectedMeter] = useState(defaultMeterId);
  const [intervalMinutes, setIntervalMinutes] = useState("15");
  const [defaultUnit, setDefaultUnit] = useState("kWh");
  const [currency, setCurrency] = useState("INR");
  const [ratePerKwh, setRatePerKwh] = useState("8");
  const [tariffVersion, setTariffVersion] = useState("IN-DEMO-1.4");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [supplierAmount, setSupplierAmount] = useState("");
  const [supplierPeriodConfirmed, setSupplierPeriodConfirmed] = useState(false);
  const [fileError, setFileError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [bill, setBill] = useState<ReturnType<typeof createEnergyBill> | null>(null);

  const resetSupplierComparison = () => {
    setSupplierAmount("");
    setSupplierPeriodConfirmed(false);
  };

  useEffect(() => {
    setBill(null);
    setActionMessage("");
  }, [
    csvText, mapping, fallbackMeterId, billSiteName, intervalMinutes, defaultUnit, currency,
    ratePerKwh, tariffVersion, timezone, supplierAmount, supplierPeriodConfirmed, selectedMeter,
  ]);

  const parsedState = useMemo(() => {
    if (!csvText || !mapping.timestamp || !mapping.value) return { parsed: null, error: "" };
    try {
      return {
        parsed: parseEnergyCsv(csvText, {
          siteId,
          fallbackMeterId,
          mapping,
          intervalMinutes: Number(intervalMinutes),
          defaultUnit,
        }),
        error: "",
      };
    } catch (error) {
      return { parsed: null, error: error instanceof Error ? error.message : "CSV could not be read" };
    }
  }, [csvText, siteId, fallbackMeterId, mapping, intervalMinutes, defaultUnit]);

  const parsed = parsedState.parsed;
  const meterOptions = useMemo(
    () => Array.from(new Set((parsed?.readings ?? []).map((reading) => String(reading.meterId)))) as string[],
    [parsed],
  );
  const activeMeter = meterOptions.includes(selectedMeter) ? selectedMeter : meterOptions[0] ?? fallbackMeterId;
  const meterReadings = useMemo(
    () => (parsed?.readings ?? []).filter((reading) => reading.meterId === activeMeter),
    [parsed, activeMeter],
  );
  const sourceRecordByEventId = useMemo(
    () => new Map((parsed?.readings ?? []).map((reading) => [reading.eventId, reading.sourceRecordRef])),
    [parsed],
  );
  const estimateState = useMemo(() => {
    if (!parsed || parsed.summary.rejected > 0 || meterReadings.length === 0) {
      return { estimate: null, tariff: null, reason: parsed?.summary.rejected
        ? "Resolve every rejected row before generating an e-bill."
        : "Map the required columns and select a meter to calculate an estimate." };
    }
    const ordered = [...meterReadings].sort((left, right) => Date.parse(left.intervalStart) - Date.parse(right.intervalStart));
    if (!ratePerKwh.trim()) {
      return { estimate: null, tariff: null, reason: "Enter a tariff rate before calculating an e-bill." };
    }
    const firstStart = ordered[0].intervalStart;
    const lastEnd = ordered[ordered.length - 1].intervalEnd;
    const tariff = {
      currency: currency.trim().toUpperCase(),
      timezone: timezone.trim(),
      version: tariffVersion.trim(),
      effectiveFrom: firstStart,
      effectiveTo: new Date(Date.parse(lastEnd) + 1).toISOString(),
      ratePerKwh: Number(ratePerKwh),
    };
    const estimate = estimateEnergyCost(meterReadings, tariff);
    return { estimate, tariff, reason: estimate.status === "estimated" ? "" : estimate.reason };
  }, [parsed, meterReadings, currency, timezone, tariffVersion, ratePerKwh]);
  const estimate = estimateState.estimate;

  const loadCsv = async (file: File, source: "synthetic-demo" | "user-uploaded-csv") => {
    setFileError("");
    setActionMessage("");
    setBill(null);
    resetSupplierComparison();
    setFileName(file.name);
    setCsvText("");
    setHeaders([]);
    if (file.size > MAX_ENERGY_CSV_BYTES) {
      setFileError("This file exceeds the 5 MiB import limit.");
      return;
    }
    try {
      const text = await file.text();
      const inspection = inspectEnergyCsv(text);
      setCsvText(text);
      setHeaders(inspection.headers);
      setMapping(suggestEnergyCsvMapping(inspection.headers));
      setFileName(file.name);
      setClassification(source);
      setBillSiteName(source === "synthetic-demo" ? "Synthetic sample site" : siteName);
      setSelectedMeter(defaultMeterId);
      setFileError("");
    } catch (error) {
      setCsvText("");
      setHeaders([]);
      setFileError(error instanceof Error ? error.message : "The CSV could not be read.");
    }
  };

  const loadSample = async () => {
    try {
      const response = await fetch("/sample-energy-readings.csv");
      if (!response.ok) throw new Error("The sample readings file could not be loaded.");
      const sample = new File([await response.blob()], "sample-energy-readings.csv", { type: "text/csv" });
      await loadCsv(sample, "synthetic-demo");
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "The sample readings file could not be loaded.");
    }
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    input.value = "";
    await loadCsv(file, "user-uploaded-csv");
  };

  const updateMapping = (key: keyof CsvMapping, value: string) => {
    resetSupplierComparison();
    setMapping((current) => ({ ...current, [key]: value }));
  };

  const downloadBill = () => {
    if (!bill) return;
    try {
      const bytes = createEnergyBillPdf(bill);
      const copy = new Uint8Array(bytes.length);
      copy.set(bytes);
      const blob = new Blob([copy.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = bill.billReference.toLowerCase() + ".pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setActionMessage("E-bill PDF downloaded. It is an estimate, not an official utility invoice.");
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "The e-bill PDF could not be generated.");
    }
  };

  const downloadCalculationCsv = () => {
    if (estimate?.status !== "estimated") return;
    try {
      const content = createEnergyCalculationCsv(meterReadings, estimate, {
        duplicatesIgnored: parsed?.rows.filter((row) => row.status === "duplicate" && row.reading?.meterId === activeMeter).length ?? estimate.duplicatesIgnored,
      });
      const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "wattwise-energy-calculation.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setActionMessage("Full calculation CSV downloaded with every validated interval and an estimate summary.");
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "The calculation CSV could not be generated.");
    }
  };

  const generateBill = () => {
    if (!parsed || parsed.summary.rejected > 0 || !estimateState.tariff || estimateState.estimate?.status !== "estimated") return;
    try {
      const includeSupplierAmount = supplierPeriodConfirmed && supplierAmount.trim() !== "";
      const created = createEnergyBill(meterReadings, estimateState.tariff, {
        siteName: billSiteName,
        customerName: "",
        classification,
        duplicatesIgnored: parsed.rows.filter((row) => row.status === "duplicate" && row.reading?.meterId === activeMeter).length,
        supplierBillAmount: includeSupplierAmount ? supplierAmount : undefined,
        supplierPeriodConfirmed,
      });
      setBill(created);
      setActionMessage("E-bill estimate generated. Review the assumptions, then download the PDF.");
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "The e-bill could not be generated.");
    }
  };

  const estimateReady = Boolean(
    parsed && parsed.summary.rejected === 0 && estimate?.status === "estimated" && estimateState.tariff && billSiteName.trim(),
  );

  return <div className="space-y-5">
    <section className="rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.08] to-[#10191e] p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-cyan-200"><Receipt size={15} /> Local bill workspace</div>
          <h2 className="mt-3 text-xl font-semibold sm:text-2xl">Generate an electricity e-bill from meter readings</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Import interval-energy CSV data, review every row, apply a transparent flat tariff, compare a supplier-stated total, and download a PDF estimate.
          </p>
        </div>
        <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200">Estimate · not official</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-slate-400">
        <span className="rounded-lg bg-black/20 px-3 py-2">1. Import locally</span>
        <span className="rounded-lg bg-black/20 px-3 py-2">2. Validate rows</span>
        <span className="rounded-lg bg-black/20 px-3 py-2">3. Calculate tariff</span>
        <span className="rounded-lg bg-black/20 px-3 py-2">4. Download PDF</span>
      </div>
    </section>

    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#10191e] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold"><FileUp size={16} className="text-cyan-200" />Readings file</h3>
              <p className="mt-1 text-xs text-slate-500">CSV is processed in this browser session; it is not uploaded to Wattwise.</p>
            </div>
            <button onClick={() => void loadSample()} className="rounded-lg border border-cyan-300/20 px-3 py-2 text-xs font-medium text-cyan-100 hover:bg-cyan-300/[0.07]">Load synthetic sample</button>
          </div>
          <input ref={fileInput} type="file" accept=".csv,text/csv" onChange={(event) => void handleFile(event)} className="sr-only" aria-label="Choose energy readings CSV" />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button onClick={() => fileInput.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-200"><FileUp size={15} />Choose CSV</button>
            {fileName && <span className="max-w-full truncate text-xs text-slate-300">{fileName} <span className="text-slate-500">· {headers.length} columns</span></span>}
          </div>
          {fileError && <div role="alert" className="mt-4 rounded-lg border border-rose-300/20 bg-rose-300/[0.06] px-3 py-2 text-xs text-rose-100">{fileError}</div>}
          {csvText && <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {MAPPING_FIELDS.map((field) => <MappingSelect
              key={field.key}
              label={field.label}
              value={mapping[field.key]}
              headers={headers}
              required={field.required}
              onChange={(value) => updateMapping(field.key, value)}
            />)}
          </div>}
          {csvText && <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500"><Info size={13} className="mt-0.5 shrink-0 text-slate-400" />Timestamp values must include a UTC offset. The timestamp column represents each interval end; choose a start-time column or set the interval length below.</p>}
        </div>

        {csvText && <div className="rounded-2xl border border-white/[0.08] bg-[#10191e] p-5">
          <h3 className="text-sm font-semibold">Reading and bill settings</h3>
          <p className="mt-1 text-xs text-slate-500">The generated document includes only interval energy and the selected flat tariff.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">Site / bill name</span><input value={billSiteName} maxLength={68} onChange={(event) => setBillSiteName(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0a1115] px-3 py-2.5 text-sm outline-none focus:border-cyan-300/50" />{!billSiteName.trim() && <span className="mt-1 block text-[10px] text-amber-200">Enter a site or bill name to generate the PDF.</span>}</label>
            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">Default meter ID (used when no meter column is mapped)</span><input value={fallbackMeterId} onChange={(event) => { resetSupplierComparison(); setFallbackMeterId(event.target.value); }} className="w-full rounded-lg border border-white/10 bg-[#0a1115] px-3 py-2.5 text-sm outline-none focus:border-cyan-300/50" /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">Interval length when no start column exists</span><div className="flex items-center gap-2"><input type="number" min="1" max="1440" step="1" value={intervalMinutes} onChange={(event) => { resetSupplierComparison(); setIntervalMinutes(event.target.value); }} className="w-full rounded-lg border border-white/10 bg-[#0a1115] px-3 py-2.5 text-sm outline-none focus:border-cyan-300/50" /><span className="text-xs text-slate-500">minutes</span></div></label>
            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">Default unit when no unit column exists</span><select value={defaultUnit} onChange={(event) => setDefaultUnit(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0a1115] px-3 py-2.5 text-sm outline-none focus:border-cyan-300/50"><option value="kWh">kWh</option><option value="Wh">Wh</option></select></label>
            {meterOptions.length > 0 && <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">Meter for this e-bill</span><select value={activeMeter} onChange={(event) => { resetSupplierComparison(); setSelectedMeter(event.target.value); }} className="w-full rounded-lg border border-white/10 bg-[#0a1115] px-3 py-2.5 text-sm outline-none focus:border-cyan-300/50">{meterOptions.map((meter) => <option key={meter} value={meter}>{meter}</option>)}</select></label>}
            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">Tariff currency</span><input maxLength={3} value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} className="w-full rounded-lg border border-white/10 bg-[#0a1115] px-3 py-2.5 text-sm uppercase outline-none focus:border-cyan-300/50" /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">Flat rate per kWh</span><input type="number" min="0" step="0.0001" value={ratePerKwh} onChange={(event) => setRatePerKwh(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0a1115] px-3 py-2.5 text-sm outline-none focus:border-cyan-300/50" /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">Tariff version</span><input value={tariffVersion} onChange={(event) => setTariffVersion(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0a1115] px-3 py-2.5 text-sm outline-none focus:border-cyan-300/50" /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">Tariff timezone (IANA)</span><input value={timezone} onChange={(event) => setTimezone(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0a1115] px-3 py-2.5 text-sm outline-none focus:border-cyan-300/50" /></label>
          </div>
          <div className="mt-4 rounded-lg border border-amber-300/10 bg-amber-300/[0.04] px-3 py-2.5 text-[11px] leading-relaxed text-amber-100/75">
            Only interval-energy CSV files are supported in this release. Cumulative-register data, taxes, fixed/demand charges, arrears, and export credits are excluded from this estimate.
          </div>
        </div>}
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#10191e] p-5">
          <h3 className="text-sm font-semibold">Validation preview</h3>
          <p className="mt-1 text-xs text-slate-500">Every row must be safe to calculate before a bill can be generated.</p>
          {!csvText && <div className="mt-5 rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-slate-500">Choose a CSV or load the synthetic sample to preview readings.</div>}
          {csvText && <div className="mt-4">
            {parsedState.error && <div role="alert" className="rounded-lg border border-amber-300/20 bg-amber-300/[0.05] px-3 py-2.5 text-xs text-amber-100">{parsedState.error}</div>}
            {parsed && <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-emerald-300/[0.06] p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">Accepted</div><div className="mt-1 text-lg font-semibold text-emerald-200">{parsed.summary.accepted}</div></div>
                <div className="rounded-lg bg-sky-300/[0.06] p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">Duplicates</div><div className="mt-1 text-lg font-semibold text-sky-200">{parsed.summary.duplicates}</div></div>
                <div className="rounded-lg bg-rose-300/[0.06] p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">Rejected</div><div className="mt-1 text-lg font-semibold text-rose-200">{parsed.summary.rejected}</div></div>
              </div>
              <div className="mt-4 max-h-64 overflow-auto rounded-lg border border-white/[0.07]">
                <table className="w-full text-left text-[10px]">
                  <thead className="sticky top-0 bg-[#172228] text-slate-500"><tr><th className="px-2 py-2">Row</th><th className="px-2 py-2">Interval end</th><th className="px-2 py-2">Meter</th><th className="px-2 py-2">Status</th></tr></thead>
                  <tbody>{parsed.rows.slice(0, 12).map((row) => <tr key={row.rowNumber} className="border-t border-white/[0.05]">
                    <td className="px-2 py-2 text-slate-400">{row.rowNumber}</td>
                    <td className="px-2 py-2 text-slate-300">{row.reading ? displayDate(row.reading.intervalEnd, timezone) : "—"}</td>
                    <td className="px-2 py-2 text-slate-300">{row.reading?.meterId ?? "—"}</td>
                    <td className="px-2 py-2"><span className={row.status === "accepted" ? "text-emerald-200" : row.status === "duplicate" ? "text-sky-200" : "text-rose-200"}>{row.status}</span>{row.reason && <span className="mt-1 block max-w-40 text-[9px] leading-snug text-slate-500">{row.reason}</span>}</td>
                  </tr>)}</tbody>
                </table>
                {parsed.rows.length > 12 && <p className="px-2 py-2 text-[10px] text-slate-500">Showing 12 of {parsed.rows.length} rows.</p>}
              </div>
              {parsed.summary.rejected > 0 && <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-rose-200"><AlertTriangle size={13} className="mt-0.5 shrink-0" />Rejected rows block bill generation. Correct the CSV or mapping and import it again.</p>}
              {parsed.summary.duplicates > 0 && <p className="mt-3 text-[11px] leading-relaxed text-sky-200">{parsed.summary.duplicates} identical duplicate interval(s) are ignored and shown in the e-bill.</p>}
            </>}
          </div>}
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#10191e] p-5">
          <h3 className="text-sm font-semibold">Estimate and supplier-bill comparison</h3>
          {estimate?.status === "estimated" && estimateState.tariff ? <div className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-black/20 p-3"><div className="text-[10px] text-slate-500">Validated energy</div><div className="mt-1 text-lg font-semibold">{estimate.energyKwh.toFixed(3)} kWh</div></div>
              <div className="rounded-xl bg-black/20 p-3"><div className="text-[10px] text-slate-500">Estimated charge</div><div className="mt-1 text-lg font-semibold text-emerald-200">{money(estimate.currency, estimate.total)}</div></div>
            </div>
            <div className="mt-3 rounded-lg border border-white/[0.06] px-3 py-2.5 text-[11px] leading-relaxed text-slate-400">
              Coverage: {displayDate(estimate.breakdown[0].start, timezone)} to {displayDate(estimate.breakdown[estimate.breakdown.length - 1].end, timezone)} · {estimate.readingCount} interval(s) · {estimate.tariffVersion}
            </div>
            <details className="mt-3 rounded-lg border border-cyan-300/10 bg-cyan-300/[0.03]">
              <summary className="cursor-pointer px-3 py-2.5 text-xs font-medium text-cyan-100">
                View calculation detail · {Math.min(estimate.breakdown.length, 12)} of {estimate.breakdown.length} intervals
              </summary>
              <div className="border-t border-white/[0.06] p-3">
                <p className="mb-3 text-[10px] leading-relaxed text-slate-400">
                  Each line links a validated CSV source record to normalized interval energy and the flat tariff calculation. Line charges show six decimal places; the estimate total is rounded to two decimal places.
                </p>
                <div className="max-h-64 overflow-auto rounded-lg border border-white/[0.06]">
                  <table className="w-full min-w-[520px] text-left text-[10px]">
                    <thead className="sticky top-0 bg-[#172228] text-slate-500"><tr>
                      <th className="px-2 py-2">Source row</th><th className="px-2 py-2">Interval</th>
                      <th className="px-2 py-2 text-right">Energy</th><th className="px-2 py-2 text-right">Rate / kWh ({estimate.currency})</th>
                      <th className="px-2 py-2 text-right">Charge</th>
                    </tr></thead>
                    <tbody>{estimate.breakdown.slice(0, 12).map((item, index) => <tr key={`${item.eventId}-${item.start}-${index}`} className="border-t border-white/[0.05]">
                      <td className="px-2 py-2 text-slate-300">{sourceRecordByEventId.get(item.eventId) ?? item.eventId}</td>
                      <td className="px-2 py-2 text-slate-400">{displayDate(item.start, timezone)} – {displayDate(item.end, timezone)}</td>
                      <td className="px-2 py-2 text-right text-slate-300">{item.energyKwh.toFixed(6)} kWh</td>
                      <td className="px-2 py-2 text-right text-slate-300">{item.ratePerKwh.toFixed(6)}</td>
                      <td className="px-2 py-2 text-right text-emerald-200">{estimate.currency} {item.cost.toFixed(6)}</td>
                    </tr>)}</tbody>
                  </table>
                </div>
                {estimate.breakdown.length > 12 && <p className="mt-2 text-[10px] text-slate-500">Showing the first 12 intervals. All validated intervals are included in the estimate.</p>}
                <button onClick={downloadCalculationCsv} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-cyan-200/20 px-3 py-2 text-[11px] font-medium text-cyan-100 hover:bg-cyan-300/[0.08]"><Download size={13} />Download full calculation CSV</button>
              </div>
            </details>
          </div> : <div className="mt-4 rounded-lg border border-amber-300/10 bg-amber-300/[0.04] px-3 py-3 text-xs leading-relaxed text-amber-100/80">{estimateState.reason || parsedState.error || "Estimate is withheld until the data and tariff are valid."}</div>}

          {csvText && <div className="mt-4 space-y-3">
            <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">Supplier-stated bill total (optional)</span><input type="number" min="0" step="0.01" value={supplierAmount} onChange={(event) => { setSupplierAmount(event.target.value); setSupplierPeriodConfirmed(false); }} placeholder="Enter amount from the supplier bill" className="w-full rounded-lg border border-white/10 bg-[#0a1115] px-3 py-2.5 text-sm outline-none focus:border-cyan-300/50" /></label>
            <label className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-400"><input type="checkbox" checked={supplierPeriodConfirmed} disabled={!supplierAmount.trim()} onChange={(event) => setSupplierPeriodConfirmed(event.target.checked)} className="mt-0.5 accent-cyan-300" />I confirmed that the supplier-stated amount covers the same period shown above.</label>
          </div>}
          <button disabled={!estimateReady} onClick={generateBill} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-xs font-semibold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500"><FileText size={15} />Generate e-bill PDF</button>
          {actionMessage && <p role="status" className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-emerald-200"><CheckCircle2 size={14} className="mt-0.5 shrink-0" />{actionMessage}</p>}
          {bill && <div className="mt-4 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100"><CheckCircle2 size={15} />E-bill estimate ready</div>
            <p className="mt-2 text-[11px] text-slate-400">{bill.billReference} · {money(bill.currency, bill.energyCharge)}</p>
            {bill.supplierBillAmount !== null && <p className="mt-1 text-[11px] text-slate-400">Variance: {money(bill.currency, bill.variance)} (estimate minus supplier-stated total)</p>}
            <button onClick={downloadBill} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200/20 px-3 py-2 text-xs font-medium text-emerald-100 hover:bg-emerald-300/[0.08]"><Download size={14} />Download PDF</button>
          </div>}
          <p className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-slate-500"><Info size={12} className="mt-0.5 shrink-0" />This is a locally generated estimate, not an official utility invoice or amount due. No payment is collected.</p>
        </div>
      </div>
    </section>
  </div>;
}
