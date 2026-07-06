"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import BuildCard from "@/components/BuildCard";

export default function BuildsPage() {
  const router = useRouter();
  const [builds, setBuilds] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function loadData() {
    setLoading(true);
    const [{ data: buildsData, error: buildsError }, { data: partsData }] =
      await Promise.all([
        supabase
          .from("builds")
          .select("*")
          .eq("sold", false)
          .order("created_at", { ascending: false }),
        supabase.from("parts").select("*").not("build_id", "is", null),
      ]);
    if (buildsError) setErrorMsg(buildsError.message);
    setBuilds(buildsData || []);
    setParts(partsData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleNewBuild() {
    setCreating(true);
    const { data, error } = await supabase
      .from("builds")
      .insert({ name: "New Build" })
      .select()
      .single();
    setCreating(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    router.push(`/builds/${data.id}`);
  }

  async function handleDelete(build) {
    if (
      !confirm(
        `Delete "${build.name}"? Parts assigned to it will go back to unused inventory.`
      )
    )
      return;
    const { error } = await supabase.from("builds").delete().eq("id", build.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setBuilds((prev) => prev.filter((b) => b.id !== build.id));
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Builds</h1>
          <p className="text-sm text-graphite-500">
            Click a build to expand it. Green means every essential slot is filled.
          </p>
        </div>
        <button
          onClick={handleNewBuild}
          disabled={creating}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-trace-500 px-4 py-2.5 text-sm font-semibold text-graphite-950 transition hover:bg-trace-400 disabled:opacity-60"
        >
          <Plus size={16} />
          New build
        </button>
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-2 text-sm text-signal-red">
          {errorMsg}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-graphite-500">Loading builds…</p>
      ) : builds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-graphite-700 bg-graphite-900/50 p-10 text-center">
          <p className="text-graphite-400">
            No builds yet — click &ldquo;New build&rdquo; to start assembling one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {builds.map((build) => (
            <BuildCard
              key={build.id}
              build={build}
              parts={parts.filter((p) => p.build_id === build.id)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
