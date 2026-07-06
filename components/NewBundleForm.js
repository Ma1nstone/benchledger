"use client";

import { useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { CATEGORIES, MARKETPLACES, BUNDLE_STATUSES } from "@/lib/constants";

const emptyItem = () => ({ category: CATEGORIES[0], name: "" });

export default function NewBundleForm({ onCancel, onSave }) {
  const [label, setLabel] = useState("");
  const [items, setItems] = useState([emptyItem(), emptyItem()]);
  const [totalPrice, setTotalPrice] = useState("");
  const [marketplace, setMarketplace] = useState(MARKETPLACES[0]);
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("Watching");
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
    setItems((prev) => [...prev, emptyItem()]);
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
    if (namedItems.length < 2) {
      setError("Add at least two parts to a bundle (for a single part, use \u201cNew part\u201d instead).");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave({ label, items: namedItems, totalPrice, marketplace, link, status }, file);
    } catch (err) {
      setError(err.message || "Something went wrong saving this bundle.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 rounded-xl border border-signal-amber/30 bg-graphite-900 p-5 shadow-lg shadow-black/20"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-white">New Bundle</h3>
          <p className="text-xs text-graphite-500">
            Several parts bought together for one combined price.
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
        <span className="text-graphite-500">Bundle label (optional)</span>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. eBay lot — CPU, Motherboard, RAM"
          className="rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-white placeholder:text-graphite-500"
        />
      </label>

      <div className="mb-4 flex flex-col gap-3">
        <span className="text-sm text-graphite-500">Parts in this bundle</span>
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
              disabled={items.length <= 2}
              className="shrink-0 self-start rounded-lg p-2 text-graphite-500 hover:bg-signal-red/10 hover:text-signal-red disabled:opacity-30 sm:self-auto"
              aria-label="Remove this part"
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
          Add another part
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-graphite-500">Total price paid (£)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            placeholder="90.00"
            className="rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-white placeholder:text-graphite-500"
          />
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
          <span className="text-graphite-500">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-white"
          >
            {BUNDLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
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

        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2 lg:col-span-4">
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
          className="flex items-center gap-2 rounded-lg bg-signal-amber px-4 py-2 text-sm font-semibold text-graphite-950 transition hover:brightness-95 disabled:opacity-60"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Save bundle
        </button>
      </div>
    </form>
  );
}
