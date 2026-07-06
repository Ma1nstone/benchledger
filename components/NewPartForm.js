"use client";

import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { CATEGORIES, MARKETPLACES } from "@/lib/constants";

const empty = {
  category: CATEGORIES[0],
  name: "",
  price: "",
  marketplace: MARKETPLACES[0],
  link: "",
};

export default function NewPartForm({ onCancel, onSave }) {
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [addMessage, setAddMessage] = useState(false);
  const [messageBody, setMessageBody] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Give the part a name.");
      return;
    }
    if (addMessage && !messageBody.trim()) {
      setError("Write a note, or uncheck \u201cAdd to Messages\u201d.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave(form, file, addMessage ? messageBody.trim() : null);
    } catch (err) {
      setError(err.message || "Something went wrong saving this part.");
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
        <h3 className="font-display text-base font-semibold text-white">
          New Part
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-graphite-500 hover:text-white"
          aria-label="Cancel"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-graphite-500">Part type</span>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2 lg:col-span-1">
          <span className="text-graphite-500">Name / model</span>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. RTX 4070 Super"
            className="rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-white placeholder:text-graphite-500"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-graphite-500">Price paid (£)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            placeholder="0.00"
            className="rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-white placeholder:text-graphite-500"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-graphite-500">Bought from</span>
          <select
            value={form.marketplace}
            onChange={(e) => update("marketplace", e.target.value)}
            className="rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-white"
          >
            {MARKETPLACES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2 lg:col-span-1">
          <span className="text-graphite-500">Listing link</span>
          <input
            value={form.link}
            onChange={(e) => update("link", e.target.value)}
            placeholder="https://…"
            className="rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-white placeholder:text-graphite-500"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-graphite-500">Photo (optional)</span>
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-graphite-600 bg-graphite-800 px-3 py-2 text-graphite-400 hover:border-trace-500/50 hover:text-trace-400">
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

      <label className="mt-4 flex items-center gap-2 text-sm text-graphite-400">
        <input
          type="checkbox"
          checked={addMessage}
          onChange={(e) => setAddMessage(e.target.checked)}
          className="h-4 w-4 rounded border-graphite-600 bg-graphite-800 accent-trace-500"
        />
        Add a note about this part to Messages
      </label>
      {addMessage && (
        <textarea
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
          placeholder="e.g. Seller says original box included, arrives Friday…"
          rows={2}
          className="mt-2 w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white placeholder:text-graphite-500"
        />
      )}

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
          Save part
        </button>
      </div>
    </form>
  );
}
