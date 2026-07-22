"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckSquare, Layers, ListFilter, MonitorSmartphone, Plus, Square, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { uploadImage } from "@/lib/uploadImage";
import { CATEGORIES, MARKETPLACES, splitEvenly } from "@/lib/constants";
import SearchBar from "@/components/SearchBar";
import NewPartForm from "@/components/NewPartForm";
import NewBundleForm from "@/components/NewBundleForm";
import NewPCForm from "@/components/NewPCForm";
import PartCard from "@/components/PartCard";
import BundleCard from "@/components/BundleCard";
import MessagesPanel from "@/components/MessagesPanel";

const STATUS_OPTIONS = ["All", "Unused", "Used"];

export default function PartsPage() {
  const [parts, setParts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [builds, setBuilds] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState(null); // null | "part" | "bundle" | "pc"
  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [marketplaceFilter, setMarketplaceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    const [
      { data: partsData, error: partsError },
      { data: bundlesData, error: bundlesError },
      { data: buildsData },
      { data: messagesData },
    ] = await Promise.all([
      supabase.from("parts").select("*").order("created_at", { ascending: false }),
      supabase.from("bundles").select("*").order("created_at", { ascending: false }),
      supabase.from("builds").select("id, name, sold"),
      supabase.from("messages").select("*").order("created_at", { ascending: false }),
    ]);
    if (partsError) setErrorMsg(partsError.message);
    if (bundlesError) setErrorMsg(bundlesError.message);
    setParts(partsData || []);
    setBundles(bundlesData || []);
    setBuilds(buildsData || []);
    setMessages(messagesData || []);
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

  // Once a build is marked Sold, its parts disappear from the Parts page
  // entirely (not just tagged USED) — they're done, no longer inventory.
  const soldBuildIds = useMemo(
    () => new Set(builds.filter((b) => b.sold).map((b) => b.id)),
    [builds]
  );

  const visibleParts = useMemo(
    () => parts.filter((p) => !p.build_id || !soldBuildIds.has(p.build_id)),
    [parts, soldBuildIds]
  );

  const standaloneParts = useMemo(
    () => visibleParts.filter((p) => !p.bundle_id),
    [visibleParts]
  );

  const partsByBundleId = useMemo(() => {
    const map = {};
    visibleParts.forEach((p) => {
      if (!p.bundle_id) return;
      map[p.bundle_id] = map[p.bundle_id] || [];
      map[p.bundle_id].push(p);
    });
    return map;
  }, [visibleParts]);

  // Hide a bundle entirely once every part inside it has been sold off.
  const visibleBundles = useMemo(
    () => bundles.filter((b) => (partsByBundleId[b.id] || []).length > 0),
    [bundles, partsByBundleId]
  );

  // Merge standalone parts and bundles into one feed, newest first, then filter by search + filters.
  const feed = useMemo(() => {
    const partItems = standaloneParts.map((p) => ({ type: "part", data: p, created_at: p.created_at }));
    const bundleItems = visibleBundles.map((b) => ({ type: "bundle", data: b, created_at: b.created_at }));
    const combined = [...partItems, ...bundleItems].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const q = search.trim().toLowerCase();

    return combined.filter((item) => {
      if (item.type === "part") {
        const p = item.data;
        if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
        if (marketplaceFilter !== "All" && p.marketplace !== marketplaceFilter) return false;
        if (statusFilter === "Used" && !p.build_id) return false;
        if (statusFilter === "Unused" && p.build_id) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.marketplace.toLowerCase().includes(q)
        );
      }

      const b = item.data;
      const bundleParts = partsByBundleId[b.id] || [];
      if (categoryFilter !== "All" && !bundleParts.some((p) => p.category === categoryFilter))
        return false;
      if (marketplaceFilter !== "All" && b.marketplace !== marketplaceFilter) return false;
      if (statusFilter === "Used" && !bundleParts.some((p) => p.build_id)) return false;
      if (statusFilter === "Unused" && bundleParts.every((p) => p.build_id)) return false;
      if (!q) return true;
      return (
        (b.label || "").toLowerCase().includes(q) ||
        b.marketplace.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q) ||
        bundleParts.some(
          (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
        )
      );
    });
  }, [standaloneParts, visibleBundles, partsByBundleId, search, categoryFilter, marketplaceFilter, statusFilter]);

  const filtersActive = categoryFilter !== "All" || marketplaceFilter !== "All" || statusFilter !== "All";

  function clearFilters() {
    setCategoryFilter("All");
    setMarketplaceFilter("All");
    setStatusFilter("All");
  }

  // Only standalone part cards are selectable — bundles have their own
  // delete flow since removing them cascades to their contained parts.
  const selectableIds = useMemo(
    () => feed.filter((item) => item.type === "part").map((item) => item.data.id),
    [feed]
  );

  function toggleSelectMode() {
    setSelectMode((on) => !on);
    setSelectedIds(new Set());
  }

  function toggleSelectPart(part) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(part.id)) next.delete(part.id);
      else next.add(part.id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedIds(new Set(selectableIds));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (
      !confirm(
        `Delete ${selectedIds.size} selected part${selectedIds.size === 1 ? "" : "s"}? This can't be undone.`
      )
    )
      return;
    setBulkDeleting(true);
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from("parts").delete().in("id", ids);
    setBulkDeleting(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setParts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  }

  async function handleSavePart(form, file, messageBody) {
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
        price_type: form.price_type || "Bought",
        marketplace: form.marketplace,
        link: form.link.trim() || null,
        image_url,
      })
      .select()
      .single();

    if (error) throw error;
    setParts((prev) => [data, ...prev]);

    if (messageBody) {
      const { data: message, error: messageError } = await supabase
        .from("messages")
        .insert({ part_id: data.id, body: messageBody })
        .select()
        .single();
      if (!messageError) setMessages((prev) => [message, ...prev]);
    }

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

  async function handleSavePC(form, file) {
    let image_url = null;
    if (file) {
      image_url = await uploadImage(file, "builds");
    }

    const { data: build, error: buildError } = await supabase
      .from("builds")
      .insert({ name: form.pcName, image_url })
      .select()
      .single();

    if (buildError) throw buildError;

    const total = form.totalPrice === "" ? 0 : Number(form.totalPrice);
    const prices = splitEvenly(total, form.items.length);
    const rows = form.items.map((item, i) => ({
      category: item.category,
      name: item.name.trim(),
      price: prices[i],
      price_type: form.priceType || "Bought",
      marketplace: form.marketplace,
      link: form.link.trim() || null,
      build_id: build.id,
    }));

    const { data: newParts, error: partsError } = await supabase
      .from("parts")
      .insert(rows)
      .select();

    if (partsError) throw partsError;

    setBuilds((prev) => [{ id: build.id, name: build.name, sold: false }, ...prev]);
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
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="shrink-0">
          <h1 className="font-display text-2xl font-bold text-white">Parts</h1>
          <p className="text-sm text-graphite-500">
            Everything you&rsquo;ve bought, ready to slot into a build or flip on its own.
          </p>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-3 lg:justify-end">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search parts…"
            className="flex-1 lg:max-w-md"
          />
          <MessagesPanel
            messages={messages}
            parts={parts}
            onMarkedSeen={(ids) =>
              setMessages((prev) =>
                prev.map((m) => (ids.includes(m.id) ? { ...m, seen: true } : m))
              )
            }
          />
          <button
            onClick={toggleSelectMode}
            className={`flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
              selectMode
                ? "border-trace-500/50 bg-trace-500/10 text-trace-400"
                : "border-graphite-600 bg-graphite-800 text-white hover:border-graphite-500"
            }`}
          >
            {selectMode ? <CheckSquare size={16} /> : <Square size={16} />}
            {selectMode ? "Selecting" : "Select"}
          </button>
          <button
            onClick={() => setActiveForm(activeForm === "pc" ? null : "pc")}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-graphite-600 bg-graphite-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-graphite-500"
          >
            <MonitorSmartphone size={16} />
            Add PC
          </button>
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

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-graphite-700 bg-graphite-900/60 p-3">
        <span className="flex items-center gap-1.5 text-xs font-medium text-graphite-500">
          <ListFilter size={14} />
          Filter
        </span>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-graphite-700 bg-graphite-800 px-2.5 py-1.5 text-xs text-white"
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={marketplaceFilter}
          onChange={(e) => setMarketplaceFilter(e.target.value)}
          className="rounded-lg border border-graphite-700 bg-graphite-800 px-2.5 py-1.5 text-xs text-white"
        >
          <option value="All">All marketplaces</option>
          {MARKETPLACES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-graphite-700 bg-graphite-800 px-2.5 py-1.5 text-xs text-white"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {filtersActive && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-graphite-500 hover:text-signal-red"
          >
            <X size={13} />
            Clear filters
          </button>
        )}
      </div>

      {/* Bulk selection bar */}
      {selectMode && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-trace-500/30 bg-trace-500/5 p-3">
          <span className="text-sm text-graphite-300">
            {selectedIds.size} selected
          </span>
          <button
            onClick={selectAllVisible}
            className="text-xs font-medium text-trace-400 hover:underline"
          >
            Select all visible
          </button>
          <button
            onClick={deselectAll}
            className="text-xs font-medium text-graphite-500 hover:underline"
          >
            Deselect all
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selectedIds.size === 0 || bulkDeleting}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-signal-red/15 px-3 py-1.5 text-xs font-semibold text-signal-red ring-1 ring-signal-red/40 transition hover:bg-signal-red/25 disabled:opacity-50"
          >
            <Trash2 size={13} />
            {bulkDeleting ? "Deleting…" : `Delete selected`}
          </button>
        </div>
      )}

      {activeForm === "part" && (
        <NewPartForm onCancel={() => setActiveForm(null)} onSave={handleSavePart} />
      )}
      {activeForm === "bundle" && (
        <NewBundleForm onCancel={() => setActiveForm(null)} onSave={handleSaveBundle} />
      )}
      {activeForm === "pc" && (
        <NewPCForm onCancel={() => setActiveForm(null)} onSave={handleSavePC} />
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
            {visibleParts.length === 0 && visibleBundles.length === 0
              ? "No parts yet — click \u201cNew part\u201d to add your first one."
              : "Nothing matches your search or filters."}
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
                selectable={selectMode}
                selected={selectedIds.has(item.data.id)}
                onToggleSelect={toggleSelectPart}
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