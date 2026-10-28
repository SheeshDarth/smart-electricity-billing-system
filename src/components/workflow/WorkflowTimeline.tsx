import { useEffect, useState } from "react";
import {
  Activity, ArrowRight, Check, Factory, Gauge, Pause, Play, Radio,
  RefreshCw, RotateCcw, ShieldCheck, SkipBack, SkipForward, Sparkles,
} from "lucide-react";

type WorkflowTimelineProps = {
  meter: string;
  scenario: string;
  decision: "accepted" | "investigate" | "deferred" | null;
  onDecision: (decision: "accepted" | "investigate" | "deferred") => void;
};

const STEPS = [
  { title: "Virtual source", icon: Radio, detail: "A synthetic meter emits a versioned interval reading." },
  { title: "Local ingestion", icon: ArrowRight, detail: "The browser sends it through the app's in-process validation path." },
  { title: "Quality gate", icon: ShieldCheck, detail: "Units, timestamps, event identity, range, and data quality are checked." },
  { title: "Site view", icon: Gauge, detail: "Accepted readings update the site view; incomplete data stays explicit." },
  { title: "Signal and estimate", icon: Sparkles, detail: "A deterministic rule and tariff produce an explainable signal and estimate." },
  { title: "Human review", icon: Activity, detail: "A reviewer records accept, investigate, or defer; nothing controls equipment." },
  { title: "Simulated verification", icon: RefreshCw, detail: "A labelled sample comparison shows what changed after the simulated action." },
];

const scenarioDetail = (scenario: string) => {
  if (scenario === "stale") return "The freshness check withholds the missing interval; it is never filled with zero.";
  if (scenario === "duplicate") return "The repeated event ID is suppressed before aggregation.";
  if (scenario === "reset") return "The unproven register decrease is held for review.";
  if (scenario === "invalid-unit") return "The incompatible power unit is quarantined before estimation.";
  if (scenario === "spike") return "The rule highlights a sample deviation without inferring its cause.";
  if (scenario === "tariff") return "The estimate uses the selected illustrative tariff version.";
  return "This sample event passes the configured validation checks.";
};

export default function WorkflowTimeline({ meter, scenario, decision, onDecision }: WorkflowTimelineProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    if (activeStep === 5 && !decision) {
      setPlaying(false);
      return;
    }
    if (activeStep >= STEPS.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setActiveStep((step) => step + 1);
    }, 1050);
    return () => window.clearTimeout(timer);
  }, [activeStep, decision, playing, reducedMotion]);

  const canAdvance = activeStep !== 5 || decision !== null;
  const advance = () => {
    if (!canAdvance) return;
    setActiveStep((step) => Math.min(step + 1, STEPS.length - 1));
  };
  const progress = (activeStep / (STEPS.length - 1)) * 100;

  return <section aria-label="Interactive energy workflow" className="mt-7 rounded-2xl border border-cyan-300/10 bg-[#0c171c] p-4 sm:p-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-cyan-200"><Factory size={15} />Interactive workflow</div>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-400">Follow <span className="text-slate-200">{meter}</span> through the <span className="text-slate-200">{scenario}</span> scenario. All readings and outcomes are synthetic; processing is local to this browser demo.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2" aria-label="Workflow playback controls">
        <button type="button" onClick={() => { setPlaying(false); setActiveStep(0); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-slate-300 transition-colors hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" aria-label="Replay workflow"><RotateCcw size={14} />Replay</button>
        {!reducedMotion && <button type="button" onClick={() => { const restart = !playing && activeStep === STEPS.length - 1; if (restart) setActiveStep(0); setPlaying((value) => restart || !value); }} disabled={!canAdvance} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-cyan-200/20 bg-cyan-200/[0.08] px-3 text-xs font-medium text-cyan-100 transition-colors hover:bg-cyan-200/[0.14] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" aria-label={!canAdvance ? "Review decision required" : playing ? "Pause workflow" : "Play workflow"}>{playing ? <Pause size={14} /> : <Play size={14} />}{!canAdvance ? "Review required" : playing ? "Pause" : activeStep === STEPS.length - 1 ? "Play again" : "Play"}</button>}
        <button type="button" onClick={() => { setPlaying(false); setActiveStep((step) => Math.max(0, step - 1)); }} disabled={activeStep === 0} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" aria-label="Previous workflow step"><SkipBack size={14} /></button>
        <button type="button" onClick={() => { setPlaying(false); advance(); }} disabled={activeStep === STEPS.length - 1 || !canAdvance} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-slate-300 transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" aria-label={reducedMotion ? "Advance one workflow step; reduced motion is enabled" : "Next workflow step"}>{!canAdvance ? "Decision required" : reducedMotion ? "Advance one step" : <><SkipForward size={14} />Next</>}</button>
      </div>
    </div>

    <div className="mt-6" role="list" aria-label="Workflow stages">
      <div className="relative mb-3 hidden h-1 overflow-hidden rounded-full bg-white/[0.07] md:block" aria-hidden="true">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map(({ title, icon: StepIcon, detail }, index) => {
          const complete = index < activeStep;
          const current = index === activeStep;
          const locked = index === 6 && decision === null;
          const text = index === 2 ? scenarioDetail(scenario) : index === 6 && decision ? `This synthetic comparison follows the recorded ${decision} review choice.` : detail;
          return <button type="button" role="listitem" key={title} disabled={locked} onClick={() => { setPlaying(false); setActiveStep(index); }} aria-current={current ? "step" : undefined} aria-label={`Step ${index + 1}: ${title}${current ? ", current step" : complete ? ", complete" : locked ? ", choose a review decision first" : ", upcoming"}`} className={`min-h-[150px] rounded-xl border p-4 text-left transition-[border-color,background-color,transform] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-50 ${current ? "border-cyan-200/40 bg-cyan-200/[0.08] shadow-[0_0_24px_rgba(103,232,249,.08)]" : complete ? "border-emerald-200/15 bg-emerald-200/[0.035]" : "border-white/[0.08] bg-black/10 hover:border-white/20"}`}>
            <div className="flex items-center justify-between">
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${current ? "bg-cyan-300/15 text-cyan-200" : complete ? "bg-emerald-300/10 text-emerald-300" : "bg-white/[0.04] text-slate-500"}`}><StepIcon size={16} /></span>
              <span className="text-[10px] text-slate-600">0{index + 1}</span>
            </div>
            <div className="mt-3 text-sm font-medium text-slate-100">{title}</div>
            <div className="mt-1 min-h-8 text-[11px] leading-relaxed text-slate-400">{text}</div>
            <div className={`mt-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${current ? "text-cyan-200" : complete ? "text-emerald-300" : "text-slate-600"}`}>
              {current ? "Current step" : complete ? <>Complete <Check size={11} /></> : locked ? "Review required" : "Up next"}
            </div>
          </button>;
        })}
      </div>
    </div>
    {activeStep === 5 && <div className="mt-4 rounded-xl border border-violet-200/15 bg-violet-200/[0.04] p-4" role="group" aria-label="Human review decision">
      <div className="text-xs font-semibold text-slate-200">Record a local review decision</div>
      <p className="mt-1 text-[11px] text-slate-500">This choice stays in browser memory and controls no equipment.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {([{ value: "accepted", label: "Accept" }, { value: "investigate", label: "Investigate" }, { value: "deferred", label: "Defer" }] as const).map((option) => <button key={option.value} type="button" aria-pressed={decision === option.value} aria-label={`Record review decision: ${option.label}`} onClick={() => onDecision(option.value)} className={`min-h-10 rounded-lg border px-3 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-200 ${decision === option.value ? "border-violet-200/40 bg-violet-200/15 text-violet-100" : "border-white/10 text-slate-300 hover:bg-white/[0.06]"}`}>{option.label}</button>)}
      </div>
    </div>}
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500" aria-live="polite" aria-atomic="true">
      <span>Step {activeStep + 1} of {STEPS.length}: <span className="text-slate-300">{STEPS[activeStep].title}</span>{decision && activeStep === 6 ? <span className="ml-2 text-violet-200">Decision recorded: {decision}</span> : null}</span>
      <span>{!canAdvance ? "Choose a review decision to continue" : reducedMotion ? "Reduced motion: use step controls" : playing ? "Playing walkthrough" : "Select a step or play the walkthrough"}</span>
    </div>
  </section>;
}
