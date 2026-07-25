"use client";

import { useState } from "react";
import { Bot, Loader2, Sparkles, TrendingUp, X } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export default function BuildAssistant({ parts, total }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleAnalyze() {
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
      setResult(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
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
        <div className="fixed bottom-24 right-6 z-40 flex max-h-[70vh] w-[360px] flex-col overflow-hidden rounded-xl border border-graphite-700 bg-graphite-900 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-graphite-700 p-4">
            <Sparkles size={16} className="text-trace-400" />
            <p className="font-display text-sm font-semibold text-white">AI Build Overview</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!result && !loading && (
              <div className="text-center">
                <p className="mb-3 text-xs text-graphite-500">
                  Checks this build&rsquo;s specs against what would raise its resale value —
                  a newer CPU, more RAM, an SSD swap, a better GPU.
                </p>
                <button
                  onClick={handleAnalyze}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-trace-500 px-3 py-2 text-sm font-semibold text-graphite-950 hover:bg-trace-400"
                >
                  <Sparkles size={14} />
                  Analyze this build
                </button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center gap-2 py-6 text-graphite-500">
                <Loader2 size={20} className="animate-spin" />
                <p className="text-xs">Checking specs…</p>
              </div>
            )}

            {errorMsg && (
              <p className="mb-3 rounded-lg border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-xs text-signal-red">
                {errorMsg}
              </p>
            )}

            {result && !loading && (
              <div className="flex flex-col gap-3">
                {result.overview && <p className="text-sm text-graphite-300">{result.overview}</p>}

                {result.suggestions?.length > 0 ? (
                  result.suggestions.map((s, i) => (
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

                <button onClick={handleAnalyze} className="mt-1 text-xs text-trace-400 hover:underline">
                  Re-analyze
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}