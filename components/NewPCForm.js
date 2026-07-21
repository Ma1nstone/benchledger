"use client";

import { useState } from "react";
import { ImagePlus, Loader2, MonitorSmartphone, Plus, Trash2, X } from "lucide-react";
import { CATEGORIES, ESSENTIAL_CATEGORIES, MARKETPLACES, PRICE_TYPES } from "@/lib/constants";

const startingItems = ESSENTIAL_CATEGORIES.map((category) => ({ category, name: "" }));

export default function NewPCForm({ onCancel, onSave }) {
  const [pcName, setPcName] = useState("");
  const [items, setItems] = useState(startingItems);
  const [totalPrice, setTotalPrice] = useState("");
  const [priceType, setPriceType] = useState("Bought");
  const [marketplace, setMarketplace] = useState(MARKETPLACES[0]);
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateItem(index, field, value) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { category: CATEGORIES[0], name: "" }]);
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const namedItems = items.filter((it) => it.name.trim());
    if (namedItems.length === 0) {
      setError("Add at least one component with a name.");
      return;
    }
    if (!pcName.trim()) {
      setError("Give this PC a name.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave(
        { pcName: pcName.trim(), items: namedItems, totalPrice, priceType, marketplace, link },
        file
      );
    } catch (err) {
      setError(err.message || "Something went wrong saving this PC.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 rounded-xl border border-trace-500/30 bg-graphite-900 p-5 shadow-lg shadow-black/20"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-white">
            <MonitorSmartphone size={16} className="text-trace-400" />
            Add a PC
          </h3>
          <p className="text-xs text-graphite-500">
            A whole pre-built PC — this creates a build and adds all its parts at once.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-graphite-500 hover:text-white"
          aria-label="Cancel"
        >
          <X size={18} />
        </button>
      </div>

      <label className="mb-4 flex flex-col gap-1.5 text-sm">
        <span className="text-graphite-500">PC name</span>
        <input
          value={pcName}
          onChange={(e) => setPcName(e.target.value)}
          placeholder="e.g. Dell OptiPlex prebuilt"
          className="rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-white placeholder:text-graphite-500"
        />
      </label>

      <div className="mb-4 flex flex-col gap-3">
        <span className="text-sm text-graphite-500">Components</span>
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={item.category}
              onChange={(e) => updateItem(i, "category", e.target.value)}
              className="rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white sm:w-40"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={item.name}
              onChange={(e) => updateItem(i, "name", e.target.value)}
              placeholder="Name / model"
              className="flex-1 rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white placeholder:text-graphite-500"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              disabled={items.length <= 1}
              className="shrink-0 self-start rounded-lg p-2 text-graphite-500 hover:bg-signal-red/10 hover:text-signal-red disabled:opacity-30 sm:self-auto"
              aria-label="Remove this component"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="flex w-fit items-center gap-1.5 rounded-lg bg-graphite-800 px-3 py-1.5 text-xs font-medium text-trace-400 hover:bg-graphite-700"
        >
          <Plus size={14} />
          Add another component
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-graphite-500">
            {priceType === "Offer" ? "Offer price (£)" : "Bought price (£)"}
          </span>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              placeholder="200.00"
              className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-white placeholder:text-graphite-500"
            />
            <div className="flex shrink-0 overflow-hidden rounded-lg border border-graphite-700">
              {PRICE_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPriceType(t)}
                  className={`px-2.5 py-2 text-xs font-semibold transition ${
                    priceType === t
                      ? t === "Offer"
                        ? "bg-signal-amber/20 text-signal-amber"
                        : "bg-trace-500/20 text-trace-400"
                      : "bg-graphite-800 text-graphite-500 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-graphite-500">Bought from</span>
          <select
            value={marketplace}
            onChange={(e) => setMarketplace(e.target.value)}
            className="rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-white"
          >
            {MARKETPLACES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-graphite-500">Listing link</span>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://…"
            className="rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-white placeholder:text-graphite-500"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-graphite-500">Photo (optional)</span>
          <div className="flex items-center gap-3">
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-graphite-600 bg-graphite-800 px-3 py-2 text-graphite-400 hover:border-trace-500/50 hover:text-trace-400">
              <ImagePlus size={16} />
              <span className="text-xs">Choose file</span>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-10 w-10 rounded object-cover" />
            )}
          </div>
        </label>
      </div>

      <p className="mt-3 text-xs text-graphite-500">
        The price above splits evenly across every component you&rsquo;ve named. Each part
        still shows up individually on the Parts page, already tagged USED.
      </p>

      {error && <p className="mt-3 text-sm text-signal-red">{error}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-graphite-400 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-trace-500 px-4 py-2 text-sm font-semibold text-graphite-950 transition hover:bg-trace-400 disabled:opacity-60"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Save PC
        </button>
      </div>
    </form>
  );
}
