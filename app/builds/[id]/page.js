"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, ImagePlus, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { uploadImage } from "@/lib/uploadImage";
import { CATEGORIES, ESSENTIAL_CATEGORIES, formatPrice } from "@/lib/constants";
import PartPicker from "@/components/PartPicker";

const OPTIONAL_CATEGORIES = CATEGORIES.filter(
  (c) => !ESSENTIAL_CATEGORIES.includes(c)
);

export default function BuildDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [build, setBuild] = useState(null);
  const [name, setName] = useState("");
  const [allParts, setAllParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickerCategory, setPickerCategory] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [soldPrice, setSoldPrice] = useState("");
  const [markingSold, setMarkingSold] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: buildData, error: buildError }, { data: partsData }] =
      await Promise.all([
        supabase.from("builds").select("*").eq("id", id).single(),
        supabase.from("parts").select("*"),
      ]);
    if (buildError) {
      setErrorMsg("Build not found.");
      setLoading(false);
      return;
    }
    setBuild(buildData);
    setName(buildData.name);
    setAllParts(partsData || []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const assignedParts = useMemo(
    () => allParts.filter((p) => p.build_id === id),
    [allParts, id]
  );
  const total = assignedParts.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  const complete = ESSENTIAL_CATEGORIES.every((cat) =>
    assignedParts.some((p) => p.category === cat)
  );

  async function saveName() {
    if (!build || name === build.name) return;
    setSaving(true);
    const { error } = await supabase.from("builds").update({ name }).eq("id", id);
    setSaving(false);
    if (error) setErrorMsg(error.message);
    else setBuild((b) => ({ ...b, name }));
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const image_url = await uploadImage(file, "builds");
      const { error } = await supabase.from("builds").update({ image_url }).eq("id", id);
      if (error) throw error;
      setBuild((b) => ({ ...b, image_url }));
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  function optionsFor(category) {
    return allParts.filter((p) => p.category === category && !p.build_id);
  }

  async function assignPart(part) {
    const { error } = await supabase
      .from("parts")
      .update({ build_id: id })
      .eq("id", part.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setAllParts((prev) =>
      prev.map((p) => (p.id === part.id ? { ...p, build_id: id } : p))
    );
    setPickerCategory(null);
  }

  async function removePart(part) {
    const { error } = await supabase
      .from("parts")
      .update({ build_id: null })
      .eq("id", part.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setAllParts((prev) =>
      prev.map((p) => (p.id === part.id ? { ...p, build_id: null } : p))
    );
  }

  async function markAsSold() {
    setMarkingSold(true);
    const { error } = await supabase
      .from("builds")
      .update({
        sold: true,
        sold_price: soldPrice === "" ? null : Number(soldPrice),
        sold_at: new Date().toISOString(),
      })
      .eq("id", id);
    setMarkingSold(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    router.push("/sales");
  }

  if (loading) return <p className="text-sm text-graphite-500">Loading build…</p>;
  if (!build)
    return (
      <div>
        <p className="mb-4 text-sm text-signal-red">{errorMsg || "Build not found."}</p>
        <Link href="/builds" className="text-trace-400 hover:underline">
          ← Back to builds
        </Link>
      </div>
    );

  const renderCategorySection = (category) => {
    const items = assignedParts.filter((p) => p.category === category);
    const essential = ESSENTIAL_CATEGORIES.includes(category);
    return (
      <div
        key={category}
        className="rounded-xl border border-graphite-700 bg-graphite-900 p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-mono text-xs uppercase tracking-wide text-trace-400">
              {category}
            </p>
            {essential && (
              <span className="rounded-full bg-graphite-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-graphite-500 ring-1 ring-graphite-700">
                required
              </span>
            )}
          </div>
          <button
            onClick={() => setPickerCategory(category)}
            className="flex items-center gap-1 rounded-lg bg-graphite-800 px-2.5 py-1 text-xs font-medium text-trace-400 hover:bg-graphite-700"
          >
            <Plus size={13} />
            Add {category}
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-graphite-500">Nothing assigned.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-graphite-800/60 px-3 py-2 text-sm"
              >
                <span className="truncate text-white">{p.name}</span>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-mono text-graphite-400">
                    {formatPrice(p.price)}
                  </span>
                  <button
                    onClick={() => removePart(p)}
                    className="text-graphite-500 hover:text-signal-red"
                    aria-label={`Remove ${p.name}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Link
        href="/builds"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-graphite-500 hover:text-white"
      >
        <ArrowLeft size={15} />
        Back to builds
      </Link>

      <div className="mb-6 flex flex-col gap-5 rounded-xl border border-graphite-700 bg-graphite-900 p-5 sm:flex-row sm:items-center">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-graphite-800 ring-1 ring-graphite-700">
          {build.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={build.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={22} className="text-graphite-500" />
          )}
        </div>

        <div className="flex-1">
          <label className="mb-1 block text-xs text-graphite-500">Build name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            className="w-full max-w-sm rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 font-display text-lg font-semibold text-white"
          />
          <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 text-xs text-trace-400 hover:underline">
            <ImagePlus size={13} />
            {build.image_url ? "Change photo" : "Add photo"}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        <div className="flex shrink-0 items-center gap-6 sm:flex-col sm:items-end sm:gap-1">
          <div className="text-right">
            <p className="text-xs text-graphite-500">Total cost</p>
            <p className="font-mono text-2xl font-bold text-white">{formatPrice(total)}</p>
          </div>
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              complete
                ? "bg-signal-green/10 text-signal-green ring-1 ring-signal-green/40"
                : "bg-signal-red/10 text-signal-red ring-1 ring-signal-red/40"
            }`}
          >
            <span className="status-dot h-2 w-2 rounded-full bg-current" />
            {complete ? "Complete" : "Missing parts"}
          </span>
        </div>

        {build.sold ? (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-signal-green/10 px-3 py-1.5 text-xs font-semibold text-signal-green ring-1 ring-signal-green/40 sm:ml-2">
            <Check size={13} />
            Sold{build.sold_price != null ? ` for ${formatPrice(build.sold_price)}` : ""}
          </span>
        ) : (
          <div className="flex shrink-0 flex-col gap-2 sm:ml-2 sm:w-44">
            <input
              type="number"
              step="0.01"
              min="0"
              value={soldPrice}
              onChange={(e) => setSoldPrice(e.target.value)}
              placeholder="Sale price ($)"
              className="rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white placeholder:text-graphite-500"
            />
            <button
              onClick={markAsSold}
              disabled={markingSold}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-signal-green/15 px-3 py-2 text-xs font-semibold text-signal-green ring-1 ring-signal-green/40 transition hover:bg-signal-green/25 disabled:opacity-60"
            >
              <Check size={14} />
              Mark as Sold
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-2 text-sm text-signal-red">
          {errorMsg}
        </p>
      )}

      <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-graphite-500">
        Essential parts
      </h2>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ESSENTIAL_CATEGORIES.map(renderCategorySection)}
      </div>

      <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-graphite-500">
        Optional parts
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {OPTIONAL_CATEGORIES.map(renderCategorySection)}
      </div>

      {pickerCategory && (
        <PartPicker
          category={pickerCategory}
          options={optionsFor(pickerCategory)}
          onChoose={assignPart}
          onClose={() => setPickerCategory(null)}
        />
      )}
    </div>
  );
}
