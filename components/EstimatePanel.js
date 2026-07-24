"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Link2, Sparkles, Trash2, Wrench } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIES, formatPrice } from "@/lib/constants";
import { parseListingText, titleCase } from "@/lib/estimateParser";
import { estimateRange } from "@/lib/priceReference";

export default function EstimatePanel() {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [items, setItems] = useState([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [buildName, setBuildName] = useState("");
  const [buildLink, setBuildLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function priceItem(item) {
    const range = estimateRange(item.text, item.category);
    const suggested = range ? Math.round((range[0] + range[1]) / 2) : "";
    return { ...item, range, price: suggested === "" ? "" : String(suggested) };
  }

  function handleAnalyze() {
    setErrorMsg("");
    setItems(parseListingText(raw).map(priceItem));
    setAnalyzed(true);
  }

  // Only asks the AI to look for categories the free parser didn't find at
  // all — it fills gaps, it doesn't re-do or second-guess what's already there.
  async function handleAIFillGaps() {
    setAiLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/parse-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: raw }),
      });
      const data = await res.json();
      if (data?.error) throw new Error(data.error);

      const existingCategories = new Set(items.map((it) => it.category));
      const gaps = (Array.isArray(data) ? data : []).filter(
        (it) => !existingCategories.has(it.category)
      );

      if (gaps.length === 0) {
        setErrorMsg("AI didn't find anything the free parser missed.");
        return;
      }

      setItems((prev) => [...prev, ...gaps.map(priceItem)]);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setAiLoading(false);
    }
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

  async function handleAddToBuilds() {
    if (items.length === 0) return;
    setSaving(true);
    setErrorMsg("");
    try {
      // sell_price is only ever written here — that's what makes it
      // exclusive to builds created through the estimator.
      const { data: build, error: buildError } = await supabase
        .from("builds")
        .insert({
          name: buildName.trim() || "Estimated Build",
          link: buildLink.trim() || null,
          offer_price: offerPrice,
          sell_price: sellPrice,
        })
        .select()
        .single();
      if (buildError) throw buildError;

      const rows = items.map((item) => ({
        category: item.category,
        name: titleCase(item.text),
        price: Number(item.price) || 0,
        price_type: "Bought",
        marketplace: "eBay",
        link: buildLink.trim() || null,
        build_id: build.id,
      }));

      const { error: partsError } = await supabase.from("parts").insert(rows);
      if (partsError) throw partsError;

      router.push(`/builds/${build.id}`);
    } catch (err) {
      setErrorMsg(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-graphite-700 bg-graphite-900 p-4">
        <label className="mb-2 block text-xs text-graphite-500">
          Paste the listing description
        </label>
        <textarea
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setAnalyzed(false);
          }}
          rows={6}
          placeholder="Paste the full parts list / description here..."
          className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white placeholder:text-graphite-500"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={!raw.trim()}
            className="flex items-center gap-2 rounded-lg bg-trace-500 px-4 py-2 text-sm font-semibold text-graphite-950 transition hover:bg-trace-400 disabled:opacity-50"
          >
            <Calculator size={16} />
            Analyze
          </button>

          {analyzed && (
            <button
              onClick={handleAIFillGaps}
              disabled={aiLoading}
              className="flex items-center gap-2 rounded-lg border border-trace-500/40 bg-trace-500/10 px-4 py-2 text-sm font-semibold text-trace-400 transition hover:bg-trace-500/20 disabled:opacity-50"
            >
              <Sparkles size={16} />
              {aiLoading ? "Filling gaps…" : "Fill gaps with AI"}
            </button>
          )}
        </div>
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

          {errorMsg && (
            <p className="mt-3 rounded-lg border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-xs text-signal-red">
              {errorMsg}
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2 border-t border-graphite-700 pt-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                placeholder="Build name (optional)"
                className="flex-1 rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white placeholder:text-graphite-500"
              />
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-graphite-700 bg-graphite-800 px-3">
                <Link2 size={14} className="shrink-0 text-graphite-500" />
                <input
                  value={buildLink}
                  onChange={(e) => setBuildLink(e.target.value)}
                  placeholder="Listing link (optional)"
                  className="w-full bg-transparent py-2 text-sm text-white placeholder:text-graphite-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleAddToBuilds}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-lg bg-trace-500 px-4 py-2.5 text-sm font-semibold text-graphite-950 transition hover:bg-trace-400 disabled:opacity-60"
            >
              <Wrench size={16} />
              {saving ? "Adding…" : "Add to Builds"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}