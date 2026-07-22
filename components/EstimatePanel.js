"use client";

import { useState } from "react";
import { ExternalLink, Calculator, Trash2 } from "lucide-react";
import { CATEGORIES, formatPrice } from "@/lib/constants";
import { parseListingText, ebaySoldLink } from "@/lib/estimateParser";

export default function EstimatePanel() {
  const [raw, setRaw] = useState("");
  const [items, setItems] = useState([]);

  function handleAnalyze() {
    setItems(parseListingText(raw).map((item) => ({ ...item, price: "" })));
  }

  function updateItem(id, field, value) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const total = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-graphite-700 bg-graphite-900 p-4">
        <label className="mb-2 block text-xs text-graphite-500">
          Paste the listing description
        </label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={6}
          placeholder="Paste the full parts list / description here..."
          className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white placeholder:text-graphite-500"
        />
        <button
          onClick={handleAnalyze}
          disabled={!raw.trim()}
          className="mt-3 flex items-center gap-2 rounded-lg bg-trace-500 px-4 py-2 text-sm font-semibold text-graphite-950 transition hover:bg-trace-400 disabled:opacity-50"
        >
          <Calculator size={16} />
          Analyze
        </button>
      </div>

      {items.length > 0 && (
        <div className="rounded-xl border border-graphite-700 bg-graphite-900 p-4">
          <p className="mb-3 text-xs text-graphite-500">
            Detected {items.length} line{items.length === 1 ? "" : "s"}. Click &ldquo;Check sold
            prices&rdquo; for each, then type in what you find — the total updates automatically.
          </p>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-graphite-700 bg-graphite-800/60 p-3 sm:flex-row sm:items-center"
              >
                <select
                  value={item.category}
                  onChange={(e) => updateItem(item.id, "category", e.target.value)}
                  className="shrink-0 rounded-lg border border-graphite-700 bg-graphite-800 px-2 py-1.5 text-xs text-trace-400"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <span className="min-w-0 flex-1 truncate text-sm text-graphite-200">
                  {item.text}
                </span>

                <a
                  href={ebaySoldLink(item.text)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1 text-xs text-trace-400 hover:text-trace-300"
                >
                  Check sold prices <ExternalLink size={12} />
                </a>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.price}
                  onChange={(e) => updateItem(item.id, "price", e.target.value)}
                  placeholder="£ price"
                  className="w-28 shrink-0 rounded-lg border border-graphite-700 bg-graphite-800 px-2 py-1.5 text-sm text-white placeholder:text-graphite-500"
                />

                <button
                  onClick={() => removeItem(item.id)}
                  className="shrink-0 rounded-lg p-1.5 text-graphite-500 hover:bg-signal-red/10 hover:text-signal-red"
                  aria-label="Remove item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-graphite-700 pt-3">
            <span className="text-sm text-graphite-400">Estimated parts total</span>
            <span className="font-mono text-xl font-bold text-white">{formatPrice(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}