"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Tag, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { formatPrice } from "@/lib/constants";
import { ChevronDown, Tag, Trash2, RotateCcw } from "lucide-react";

export default function SalesPage() {
  const [builds, setBuilds] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [{ data: buildsData }, { data: partsData }] = await Promise.all([
      supabase
        .from("builds")
        .select("*")
        .eq("sold", true)
        .order("sold_at", { ascending: false }),
      supabase.from("parts").select("id, build_id, name, category, price"),
    ]);
    setBuilds(buildsData || []);
    setParts(partsData || []);
    setLoading(false);
  }

  function partsFor(buildId) {
    return parts.filter((p) => p.build_id === buildId);
  }

  function costFor(buildId) {
    return partsFor(buildId).reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  }

  async function handleDelete(e, build) {
    e.stopPropagation();
    if (
      !confirm(
        `Delete the sale record for "${build.name}"? Its parts will go back to unused inventory. This can't be undone.`
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
  async function handleRestore(e, build) {
    e.stopPropagation();
    if (!confirm(`Move "${build.name}" back to Builds? It'll be marked as unsold.`)) return;
    const { error } = await supabase
      .from("builds")
      .update({ sold: false, sold_price: null, sold_at: null })
      .eq("id", build.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setBuilds((prev) => prev.filter((b) => b.id !== build.id));
  }


  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Sales</h1>
        <p className="text-sm text-graphite-500">
          Builds you&rsquo;ve marked as sold, most recent first. Click a row to see what was inside.
        </p>
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-2 text-sm text-signal-red">
          {errorMsg}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-graphite-500">Loading sales…</p>
      ) : builds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-graphite-700 bg-graphite-900/50 p-10 text-center">
          <Tag size={22} className="mx-auto mb-3 text-graphite-600" />
          <p className="text-graphite-400">
            No sold builds yet — mark a build as sold from its edit page and it&rsquo;ll show up here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {builds.map((build) => {
            const buildParts = partsFor(build.id);
            const cost = costFor(build.id);
            const profit = (Number(build.sold_price) || 0) - cost;
            const isOpen = openId === build.id;

            const grouped = buildParts.reduce((acc, p) => {
              acc[p.category] = acc[p.category] || [];
              acc[p.category].push(p);
              return acc;
            }, {});

            return (
              <div
                key={build.id}
                className="overflow-hidden rounded-xl border border-graphite-700 bg-graphite-900 transition hover:border-graphite-600"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenId(isOpen ? null : build.id)}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    setOpenId(isOpen ? null : build.id)
                  }
                  className="flex cursor-pointer items-center gap-4 p-4"
                >
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-graphite-800 ring-1 ring-graphite-700">
                    {build.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={build.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Tag size={20} className="text-graphite-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-semibold text-white">
                      {build.name}
                    </p>
                    <p className="text-xs text-graphite-500">
                      Sold {build.sold_at ? new Date(build.sold_at).toLocaleDateString() : ""} &middot;{" "}
                      {buildParts.length} part{buildParts.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs text-graphite-500">Sold for</p>
                    <p className="font-mono text-lg font-semibold text-white">
                      {formatPrice(build.sold_price)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-graphite-500">Profit</p>
                    <p
                      className={`font-mono text-lg font-semibold ${
                        profit >= 0 ? "text-signal-green" : "text-signal-red"
                      }`}
                    >
                      {formatPrice(profit)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleRestore(e, build)}
                    className="shrink-0 rounded-lg p-2 text-graphite-500 hover:bg-signal-green/10 hover:text-signal-green"
                    aria-label={`Move ${build.name} back to Builds`}
                    title="Move back to Builds"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, build)}
                    className="shrink-0 rounded-lg p-2 text-graphite-500 hover:bg-signal-red/10 hover:text-signal-red"
                    aria-label={`Delete sale record for ${build.name}`}
                    title="Delete this sale record"
                  >
                    <Trash2 size={16} />
                  </button>

                  <ChevronDown
                    size={20}
                    className={`chevron-flip shrink-0 text-graphite-500 ${isOpen ? "open" : ""}`}
                  />
                </div>

                <div className={`collapse-panel ${isOpen ? "open" : ""}`}>
                  <div>
                    <div className="border-t border-graphite-700 px-4 pb-4 pt-3">
                      {buildParts.length === 0 ? (
                        <p className="text-sm text-graphite-500">
                          No parts were assigned to this build.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {Object.entries(grouped).map(([category, items]) => (
                            <div key={category} className="rounded-lg bg-graphite-800/60 p-3">
                              <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-trace-400">
                                {category}
                              </p>
                              {items.map((p) => (
                                <div
                                  key={p.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="truncate text-graphite-300">{p.name}</span>
                                  <span className="ml-2 shrink-0 font-mono text-graphite-400">
                                    {formatPrice(p.price)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
