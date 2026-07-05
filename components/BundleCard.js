"use client";

import { ExternalLink, Layers, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export default function BundleCard({ bundle, parts, buildNameById, onDelete }) {
  return (
    <div className="rounded-xl border border-signal-amber/25 bg-graphite-900 p-4">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-graphite-800 ring-1 ring-graphite-700">
          {bundle.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bundle.image_url}
              alt={bundle.label || "Bundle"}
              className="h-full w-full object-cover"
            />
          ) : (
            <Layers size={20} className="text-graphite-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-signal-amber/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-signal-amber ring-1 ring-signal-amber/40">
              <Layers size={11} />
              Bundle
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
                bundle.status === "Bought"
                  ? "bg-signal-green/10 text-signal-green ring-signal-green/40"
                  : "bg-graphite-700/60 text-graphite-300 ring-graphite-600"
              }`}
            >
              {bundle.status}
            </span>
          </div>
          <p className="mt-1 truncate font-medium text-white">
            {bundle.label || `${parts.length}-part bundle`}
          </p>
          <p className="text-xs text-graphite-500">{bundle.marketplace}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-mono text-base font-semibold text-white">
            {formatPrice(bundle.total_price)}
          </p>
          {bundle.link && (
            <a
              href={bundle.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center justify-end gap-1 text-xs text-trace-400 hover:text-trace-300"
            >
              Listing <ExternalLink size={12} />
            </a>
          )}
        </div>

        <button
          onClick={() => onDelete(bundle)}
          className="shrink-0 rounded-lg p-2 text-graphite-500 hover:bg-signal-red/10 hover:text-signal-red"
          aria-label="Delete bundle"
          title="Delete bundle and its parts"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 border-t border-graphite-700 pt-3">
        {parts.map((p) => {
          const used = Boolean(p.build_id);
          return (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className="rounded-full bg-graphite-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-trace-400 ring-1 ring-graphite-700">
                  {p.category}
                </span>
                <span className="truncate text-graphite-200">{p.name}</span>
                {used && (
                  <span className="shrink-0 rounded-full bg-signal-red/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-signal-red ring-1 ring-signal-red/40">
                    USED{buildNameById[p.build_id] ? ` — ${buildNameById[p.build_id]}` : ""}
                  </span>
                )}
              </div>
              <span className="shrink-0 font-mono text-graphite-400">
                {formatPrice(p.price)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
