"use client";

import { ExternalLink, Trash2, Package } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export default function PartCard({ part, buildName, onDelete }) {
  const used = Boolean(part.build_id);
  const isOffer = part.price_type === "Offer";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-graphite-700 bg-graphite-900 p-4 transition hover:border-graphite-600">
      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-graphite-800 ring-1 ring-graphite-700">
        {part.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={part.image_url}
            alt={part.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package size={20} className="text-graphite-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-graphite-800 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-trace-400 ring-1 ring-graphite-700">
            {part.category}
          </span>
          {isOffer && (
            <span className="rounded-full bg-signal-amber/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-signal-amber ring-1 ring-signal-amber/40">
              Offer
            </span>
          )}
          {used && (
            <span className="rounded-full bg-signal-red/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-signal-red ring-1 ring-signal-red/40">
              USED{buildName ? ` — ${buildName}` : ""}
            </span>
          )}
        </div>
        <p className="mt-1 truncate font-medium text-white">{part.name}</p>
        <p className="text-xs text-graphite-500">{part.marketplace}</p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-mono text-base font-semibold text-white">
          {formatPrice(part.price)}
        </p>
        {part.link && (
          <a
            href={part.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center justify-end gap-1 text-xs text-trace-400 hover:text-trace-300"
          >
            Listing <ExternalLink size={12} />
          </a>
        )}
      </div>

      <button
        onClick={() => onDelete(part)}
        className="shrink-0 rounded-lg p-2 text-graphite-500 hover:bg-signal-red/10 hover:text-signal-red"
        aria-label={`Delete ${part.name}`}
        title="Delete part"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
