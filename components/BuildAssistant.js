"use client";

import { useState } from "react";
import { Bot, Check, Copy, FileText, Loader2, Sparkles, TrendingUp, X } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export default function BuildAssistant({ parts, total, buildName }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null); // null | "overview" | "description"
  const [loading, setLoading] = useState(false);
  const [overviewResult, setOverviewResult] = useState(null);
  const [description, setDescription] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleAnalyzeOverview() {
    setMode("overview");
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/build-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parts: parts.map((p) => ({ category: p.category, name: p.name, price: p.price })),
          total,
        }),
      });
      const data = await res.json();
      if (data?.error) throw new Error(data.error);
      setOverviewResult(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateDescription() {
    setMode("description");
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/build-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildName,
          parts: parts.map((p) => ({ category: p.category, name: p.name })),
        }),
      });
      const data = await res.json();
      if (data?.error) throw new Error(data.error);
      setDescription(data.description);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!description) return;
    await navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-trace-500 text-graphite-950 shadow-lg shadow-trace-500/30 transition hover:bg-trace-400"
        aria-label="AI build assistant"
      >
        {open ? <X size={22} /> : <Bot size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex max-h-[70vh] w-[380px] flex-col overflow-hidden rounded-xl border border-graphite-700 bg-graphite-900 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-graphite-700 p-4">
            <Sparkles size={16} className="text-trace-400" />
            <p className="font-display text-sm font-semibold text-white">AI Build Assistant</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!mode && (
              <div className="flex flex-col gap-2 text-center">
                <p className="mb-2 text-xs text-graphite-500">Pick what you want help with.</p>
                <button
                  onClick={handleAnalyzeOverview}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-trace-500 px-3 py-2 text-sm font-semibold text-graphite-950 hover:bg-trace-400"
                >
                  <TrendingUp size={14} />
                  Check upgrade suggestions
                </button>
                <button
                  onClick={handleGenerateDescription}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-trace-500/40 bg-trace-500/10 px-3 py-2 text-sm font-semibold text-trace-400 hover:bg-trace-500/20"
                >
                  <FileText size={14} />
                  Write listing description
                </button>
              </div>
            )}

            {mode && (
              <button
                onClick={() => {
                  setMode(null);
                  setErrorMsg("");
                }}
                className="mb-3 text-xs text-graphite-500 hover:text-white"
              >
                ← Back
              </button>
            )}

            {loading && (
              <div className="flex flex-col items-center gap-2 py-6 text-graphite-500">
                <Loader2 size={20} className="animate-spin" />
                <p className="text-xs">
                  {mode === "description" ? "Writing description…" : "Checking specs…"}
                </p>
              </div>
            )}

            {errorMsg && (
              <p className="mb-3 rounded-lg border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-xs text-signal-red">
                {errorMsg}
              </p>
            )}

            {mode === "overview" && overviewResult && !loading && (
              <div className="flex flex-col gap-3">
                {overviewResult.overview && (
                  <p className="text-sm text-graphite-300">{overviewResult.overview}</p>
                )}

                {overviewResult.suggestions?.length > 0 ? (
                  overviewResult.suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-graphite-700 bg-graphite-800/60 p-3"
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-graphite-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-trace-400 ring-1 ring-graphite-700">
                          {s.category}
                        </span>
                        {s.value_add != null && (
                          <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-signal-green">
                            <TrendingUp size={11} />+{formatPrice(s.value_add)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white">{s.suggestion}</p>
                      {s.current && (
                        <p className="mt-0.5 text-[11px] text-graphite-600">
                          Currently: {s.current}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-graphite-500">{s.reason}</p>
                      {s.upgrade_cost != null && (
                        <p className="mt-1 text-[11px] text-graphite-600">
                          Est. upgrade cost: {formatPrice(s.upgrade_cost)}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-graphite-500">
                    Nothing significant to flag — this build looks solid for resale.
                  </p>
                )}

                <button onClick={handleAnalyzeOverview} className="mt-1 text-xs text-trace-400 hover:underline">
                  Re-analyze
                </button>
              </div>
            )}

            {mode === "description" && description && !loading && (
              <div className="flex flex-col gap-3">
                <pre className="whitespace-pre-wrap rounded-lg border border-graphite-700 bg-graphite-800/60 p-3 font-sans text-xs leading-relaxed text-graphite-200">
                  {description}
                </pre>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-trace-500 px-3 py-2 text-xs font-semibold text-graphite-950 hover:bg-trace-400"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied!" : "Copy description"}
                  </button>
                  <button
                    onClick={handleGenerateDescription}
                    className="rounded-lg border border-graphite-700 px-3 py-2 text-xs font-medium text-graphite-400 hover:bg-graphite-800"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}