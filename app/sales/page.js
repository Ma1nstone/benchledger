"use client";

import { useEffect, useState } from "react";
import { Tag, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { formatPrice } from "@/lib/constants";

export default function SalesPage() {
  const [builds, setBuilds] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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
      supabase.from("parts").select("id, build_id, price"),
    ]);
    setBuilds(buildsData || []);
    setParts(partsData || []);
    setLoading(false);
  }

  function costFor(buildId) {
    return parts
      .filter((p) => p.build_id === buildId)
      .reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  }

  async function handleDelete(build) {
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Sales</h1>
        <p className="text-sm text-graphite-500">
          Builds you&rsquo;ve marked as sold, most recent first.
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
            const cost = costFor(build.id);
            const profit = (Number(build.sold_price) || 0) - cost;
            return (
              <div
                key={build.id}
                className="flex items-center gap-4 rounded-xl border border-graphite-700 bg-graphite-900 p-4"
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
                  <p className="truncate font-display font-semibold text-white">{build.name}</p>
                  <p className="text-xs text-graphite-500">
                    Sold {build.sold_at ? new Date(build.sold_at).toLocaleDateString() : ""}
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
                  onClick={() => handleDelete(build)}
                  className="shrink-0 rounded-lg p-2 text-graphite-500 hover:bg-signal-red/10 hover:text-signal-red"
                  aria-label={`Delete sale record for ${build.name}`}
                  title="Delete this sale record"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
