"use client";

import { useState } from "react";
import { Calculator, Trash2 } from "lucide-react";
import { CATEGORIES, formatPrice } from "@/lib/constants";
import { parseListingText, titleCase } from "@/lib/estimateParser";
import { estimateRange } from "@/lib/priceReference";

export default function EstimatePanel() {
  const [raw, setRaw] = useState("");
  const [items, setItems] = useState([]);

  function handleAnalyze() {
    const parsed = parseListingText(raw).map((item) => {
      const range = estimateRange(item.text, item.category);
      const suggested = range ? Math.round((range[0] + range[1]) / 2) : "";
      return { ...item, range, price: suggested === "" ? "" : String(suggested) };
    });
    setItems(parsed);
  }

  function updateItem(id, field, value) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const total = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  // Offer ~15% under the estimated total, sell price ~15% over — rounded
  // to the nearest £5 so the numbers look like real offers, not maths.
  const offerPrice = Math.round((total * 0.85) / 5) * 5;
  const sellPrice = Math.round((total * 1.15) / 5) * 5;

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
            Detected {items.length} spec line{items.length === 1 ? "" : "s"}. Prices are
            pre-filled from built-in ballpark estimates where recognised — edit any of them if
            you know better.
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

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-graphite-200">{titleCase(item.text)}</p>
                  {item.range && (
                    <p className="text-[11px] text-graphite-500">
                      Ballpark: {formatPrice(item.range[0])} – {formatPrice(item.range[1])}
                    </p>
                  )}
                </div>

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

          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-graphite-700 pt-4 sm:grid-cols-3">
            <div className="rounded-lg bg-graphite-800/60 p-3 text-center">
              <p className="text-xs text-graphite-500">Estimated parts total</p>
              <p className="mt-1 font-mono text-lg font-bold text-white">{formatPrice(total)}</p>
            </div>
            <div className="rounded-lg bg-signal-red/10 p-3 text-center ring-1 ring-signal-red/30">
              <p className="text-xs text-signal-red">Offer around</p>
              <p className="mt-1 font-mono text-lg font-bold text-signal-red">
                {formatPrice(offerPrice)}
              </p>
            </div>
            <div className="rounded-lg bg-signal-green/10 p-3 text-center ring-1 ring-signal-green/30">
              <p className="text-xs text-signal-green">Sell around</p>
              <p className="mt-1 font-mono text-lg font-bold text-signal-green">
                {formatPrice(sellPrice)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}