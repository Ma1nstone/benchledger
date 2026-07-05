"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers, Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { uploadImage } from "@/lib/uploadImage";
import { splitEvenly } from "@/lib/constants";
import SearchBar from "@/components/SearchBar";
import NewPartForm from "@/components/NewPartForm";
import NewBundleForm from "@/components/NewBundleForm";
import PartCard from "@/components/PartCard";
import BundleCard from "@/components/BundleCard";

export default function PartsPage() {
  const [parts, setParts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState(null); // null | "part" | "bundle"
  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function loadData() {
    setLoading(true);
    const [
      { data: partsData, error: partsError },
      { data: bundlesData, error: bundlesError },
      { data: buildsData },
    ] = await Promise.all([
      supabase.from("parts").select("*").order("created_at", { ascending: false }),
      supabase.from("bundles").select("*").order("created_at", { ascending: false }),
      supabase.from("builds").select("id, name"),
    ]);
    if (partsError) setErrorMsg(partsError.message);
    if (bundlesError) setErrorMsg(bundlesError.message);
    setParts(partsData || []);
    setBundles(bundlesData || []);
    setBuilds(buildsData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const buildNameById = useMemo(() => {
    const map = {};
    builds.forEach((b) => (map[b.id] = b.name));
    return map;
  }, [builds]);

  const standaloneParts = useMemo(() => parts.filter((p) => !p.bundle_id), [parts]);

  const partsByBundleId = useMemo(() => {
    const map = {};
    parts.forEach((p) => {
      if (!p.bundle_id) return;
      map[p.bundle_id] = map[p.bundle_id] || [];
      map[p.bundle_id].push(p);
    });
    return map;
  }, [parts]);

  // Merge standalone parts and bundles into one feed, newest first, then filter by search.
  const feed = useMemo(() => {
    const partItems = standaloneParts.map((p) => ({ type: "part", data: p, created_at: p.created_at }));
    const bundleItems = bundles.map((b) => ({ type: "bundle", data: b, created_at: b.created_at }));
    const combined = [...partItems, ...bundleItems].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const q = search.trim().toLowerCase();
    if (!q) return combined;

    return combined.filter((item) => {
      if (item.type === "part") {
        const p = item.data;
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.marketplace.toLowerCase().includes(q)
        );
      }
      const b = item.data;
      const bundleParts = partsByBundleId[b.id] || [];
      return (
        (b.label || "").toLowerCase().includes(q) ||
        b.marketplace.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q) ||
        bundleParts.some(
          (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
        )
      );
    });
  }, [standaloneParts, bundles, partsByBundleId, search]);

  async function handleSavePart(form, file) {
    let image_url = null;
    if (file) {
      image_url = await uploadImage(file, "parts");
    }
    const { data, error } = await supabase
      .from("parts")
      .insert({
        category: form.category,
        name: form.name.trim(),
        price: form.price === "" ? 0 : Number(form.price),
        marketplace: form.marketplace,
        link: form.link.trim() || null,
        image_url,
      })
      .select()
      .single();

    if (error) throw error;
    setParts((prev) => [data, ...prev]);
    setActiveForm(null);
  }

  async function handleSaveBundle(form, file) {
    let image_url = null;
    if (file) {
      image_url = await uploadImage(file, "bundles");
    }

    const total = form.totalPrice === "" ? 0 : Number(form.totalPrice);

    const { data: bundle, error: bundleError } = await supabase
      .from("bundles")
      .insert({
        label: form.label.trim() || null,
        total_price: total,
        marketplace: form.marketplace,
        link: form.link.trim() || null,
        status: form.status,
        image_url,
      })
      .select()
      .single();

    if (bundleError) throw bundleError;

    const prices = splitEvenly(total, form.items.length);
    const rows = form.items.map((item, i) => ({
      category: item.category,
      name: item.name.trim(),
      price: prices[i],
      marketplace: form.marketplace,
      link: form.link.trim() || null,
      bundle_id: bundle.id,
    }));

    const { data: newParts, error: partsError } = await supabase
      .from("parts")
      .insert(rows)
      .select();

    if (partsError) throw partsError;

    setBundles((prev) => [bundle, ...prev]);
    setParts((prev) => [...newParts, ...prev]);
    setActiveForm(null);
  }

  async function handleDeletePart(part) {
    if (!confirm(`Delete "${part.name}"? This can't be undone.`)) return;
    const { error } = await supabase.from("parts").delete().eq("id", part.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setParts((prev) => prev.filter((p) => p.id !== part.id));
  }

  async function handleDeleteBundle(bundle) {
    if (
      !confirm(
        `Delete this bundle and all ${
          (partsByBundleId[bundle.id] || []).length
        } part(s) inside it? This can't be undone.`
      )
    )
      return;

    const { error: partsError } = await supabase
      .from("parts")
      .delete()
      .eq("bundle_id", bundle.id);
    if (partsError) {
      setErrorMsg(partsError.message);
      return;
    }
    const { error: bundleError } = await supabase.from("bundles").delete().eq("id", bundle.id);
    if (bundleError) {
      setErrorMsg(bundleError.message);
      return;
    }
    setParts((prev) => prev.filter((p) => p.bundle_id !== bundle.id));
    setBundles((prev) => prev.filter((b) => b.id !== bundle.id));
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Parts</h1>
          <p className="text-sm text-graphite-500">
            Everything you&rsquo;ve bought, ready to slot into a build or flip on its own.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search parts…" />
          <button
            onClick={() => setActiveForm(activeForm === "bundle" ? null : "bundle")}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-signal-amber/40 bg-signal-amber/10 px-4 py-2.5 text-sm font-semibold text-signal-amber transition hover:bg-signal-amber/20"
          >
            <Layers size={16} />
            New bundle
          </button>
          <button
            onClick={() => setActiveForm(activeForm === "part" ? null : "part")}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-trace-500 px-4 py-2.5 text-sm font-semibold text-graphite-950 transition hover:bg-trace-400"
          >
            <Plus size={16} />
            New part
          </button>
        </div>
      </div>

      {activeForm === "part" && (
        <NewPartForm onCancel={() => setActiveForm(null)} onSave={handleSavePart} />
      )}
      {activeForm === "bundle" && (
        <NewBundleForm onCancel={() => setActiveForm(null)} onSave={handleSaveBundle} />
      )}

      {errorMsg && (
        <p className="mb-4 rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-2 text-sm text-signal-red">
          {errorMsg}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-graphite-500">Loading parts…</p>
      ) : feed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-graphite-700 bg-graphite-900/50 p-10 text-center">
          <p className="text-graphite-400">
            {parts.length === 0 && bundles.length === 0
              ? "No parts yet — click \u201cNew part\u201d to add your first one."
              : "Nothing matches your search."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feed.map((item) =>
            item.type === "part" ? (
              <PartCard
                key={`part-${item.data.id}`}
                part={item.data}
                buildName={item.data.build_id ? buildNameById[item.data.build_id] : null}
                onDelete={handleDeletePart}
              />
            ) : (
              <BundleCard
                key={`bundle-${item.data.id}`}
                bundle={item.data}
                parts={partsByBundleId[item.data.id] || []}
                buildNameById={buildNameById}
                onDelete={handleDeleteBundle}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

