"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import BuildCard from "@/components/BuildCard";

const SUBTABS = [
  { key: "manual", label: "Builds" },
  { key: "estimate", label: "Estimate Builds" },
];

export default function BuildsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [builds, setBuilds] = useState([]);
  const [parts, setParts] = useState([]);
  const [costGroups, setCostGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [subtab, setSubtab] = useState("manual");

  async function loadData() {
    if (!user) return;
    setLoading(true);
    const ownershipFilter = `owner_id.eq.${user.id},shared_user_ids.cs.{${user.id}}`;
    const [{ data: buildsData, error: buildsError }, { data: partsData }, { data: costGroupsData }] =
      await Promise.all([
        supabase
          .from("builds")
          .select("*, owner:profiles!owner_id(name, email)")
          .eq("sold", false)
          .is("deleted_at", null)
          .or(ownershipFilter)
          .order("created_at", { ascending: false }),
        supabase.from("parts").select("*").not("build_id", "is", null),
        supabase.from("cost_groups").select("*"),
      ]);
    if (buildsError) setErrorMsg(buildsError.message);
    setBuilds(buildsData || []);
    setParts(partsData || []);
    setCostGroups(costGroupsData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const visibleBuilds = useMemo(
    () => builds.filter((b) => (b.source || "manual") === subtab),
    [builds, subtab]
  );

  async function handleNewBuild() {
    setCreating(true);
    const { data, error } = await supabase
      .from("builds")
      .insert({ name: "New Build", source: "manual", owner_id: user.id })
      .select()
      .single();
    setCreating(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    // The `new=1` flag tells the build detail page this was just created
    // via this button (as opposed to an existing build being opened) —
    // if nothing gets changed before leaving that page, it deletes itself
    // instead of sitting around as an empty "New Build" entry.
    router.push(`/builds/${data.id}?new=1`);
  }

  async function handleDelete(build) {
    if (
      !confirm(
        `Delete "${build.name}"? Parts assigned to it will go back to unused inventory.`
      )
    )
      return;

    const { error: partsError } = await supabase
      .from("parts")
      .update({ build_id: null, cost_group_id: null })
      .eq("build_id", build.id);
    if (partsError) {
      setErrorMsg(partsError.message);
      return;
    }

    const { error } = await supabase
      .from("builds")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", build.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setBuilds((prev) => prev.filter((b) => b.id !== build.id));
  }

  async function handleMoveTab(build) {
    const newSource = (build.source || "manual") === "manual" ? "estimate" : "manual";
    const { error } = await supabase
      .from("builds")
      .update({ source: newSource })
      .eq("id", build.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setBuilds((prev) => prev.map((b) => (b.id === build.id ? { ...b, source: newSource } : b)));
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Builds</h1>
          <p className="text-sm text-graphite-500">
            Click a build to expand it. Green means every essential slot is filled. Only builds
            you own or that have been shared with you show up here.
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

      <div className="mb-5 flex w-fit gap-1 rounded-full border border-graphite-700 bg-graphite-900 p-1">
        {SUBTABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSubtab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              subtab === t.key
                ? "bg-trace-500/15 text-trace-400 ring-1 ring-trace-500/40"
                : "text-graphite-500 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-2 text-sm text-signal-red">
          {errorMsg}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-graphite-500">Loading builds…</p>
      ) : visibleBuilds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-graphite-700 bg-graphite-900/50 p-10 text-center">
          <p className="text-graphite-400">
            {subtab === "manual"
              ? "No builds here yet — click \u201cNew build\u201d to start assembling one."
              : "No Estimate-created builds yet — use the Estimate tool's \u201cAdd to Builds\u201d to create one."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleBuilds.map((build) => (
            <BuildCard
              key={build.id}
              build={build}
              parts={parts.filter((p) => p.build_id === build.id)}
              costGroups={costGroups.filter((g) => g.build_id === build.id)}
              ownerName={build.owner?.name || build.owner?.email}
              showOwner={build.owner_id !== user?.id}
              onDelete={handleDelete}
              onMoveTab={handleMoveTab}
            />
          ))}
        </div>
      )}
    </div>
  );
}