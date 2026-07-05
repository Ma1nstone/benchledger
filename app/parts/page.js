"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { uploadImage } from "@/lib/uploadImage";
import SearchBar from "@/components/SearchBar";
import NewPartForm from "@/components/NewPartForm";
import PartCard from "@/components/PartCard";

export default function PartsPage() {
  const [parts, setParts] = useState([]);
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function loadData() {
    setLoading(true);
    const [{ data: partsData, error: partsError }, { data: buildsData }] =
      await Promise.all([
        supabase.from("parts").select("*").order("created_at", { ascending: false }),
        supabase.from("builds").select("id, name"),
      ]);
    if (partsError) setErrorMsg(partsError.message);
    setParts(partsData || []);
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return parts;
    return parts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.marketplace.toLowerCase().includes(q)
    );
  }, [parts, search]);

  async function handleSave(form, file) {
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
    setShowForm(false);
  }

  async function handleDelete(part) {
    if (!confirm(`Delete "${part.name}"? This can't be undone.`)) return;
    const { error } = await supabase.from("parts").delete().eq("id", part.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setParts((prev) => prev.filter((p) => p.id !== part.id));
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
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search parts…" />
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-trace-500 px-4 py-2.5 text-sm font-semibold text-graphite-950 transition hover:bg-trace-400"
          >
            <Plus size={16} />
            New part
          </button>
        </div>
      </div>

      {showForm && (
        <NewPartForm onCancel={() => setShowForm(false)} onSave={handleSave} />
      )}

      {errorMsg && (
        <p className="mb-4 rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-2 text-sm text-signal-red">
          {errorMsg}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-graphite-500">Loading parts…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-graphite-700 bg-graphite-900/50 p-10 text-center">
          <p className="text-graphite-400">
            {parts.length === 0
              ? "No parts yet — click \u201cNew part\u201d to add your first one."
              : "No parts match your search."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((part) => (
            <PartCard
              key={part.id}
              part={part}
              buildName={part.build_id ? buildNameById[part.build_id] : null}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
