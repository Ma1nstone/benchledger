"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MonitorSmartphone, Pencil, Trash2 } from "lucide-react";
import { ESSENTIAL_CATEGORIES, formatPrice } from "@/lib/constants";

export default function BuildCard({ build, parts, onDelete }) {
  const [open, setOpen] = useState(false);

  const total = parts.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  const complete = ESSENTIAL_CATEGORIES.every((cat) =>
    parts.some((p) => p.category === cat)
  );

  const grouped = parts.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div className="overflow-hidden rounded-xl border border-graphite-700 bg-graphite-900 transition hover:border-graphite-600">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-4 p-4"
      >
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-graphite-800 ring-1 ring-graphite-700">
          {build.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={build.image_url}
              alt={build.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <MonitorSmartphone size={24} className="text-graphite-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-semibold text-white">
            {build.name}
          </p>
          <p className="text-xs text-graphite-500">
            {parts.length} part{parts.length === 1 ? "" : "s"} assigned
          </p>
        </div>

        <p className="shrink-0 font-mono text-lg font-semibold text-white">
          {formatPrice(total)}
        </p>

        <span
          className={`status-dot h-3 w-3 shrink-0 rounded-full ${
            complete ? "bg-signal-green text-signal-green" : "bg-signal-red text-signal-red"
          }`}
          title={complete ? "Build complete" : "Missing essential parts"}
        />

        <Link
          href={`/builds/${build.id}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 rounded-lg p-2 text-graphite-500 hover:bg-graphite-800 hover:text-trace-400"
          aria-label="Edit build"
          title="Edit build"
        >
          <Pencil size={16} />
        </Link>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(build);
          }}
          className="shrink-0 rounded-lg p-2 text-graphite-500 hover:bg-signal-red/10 hover:text-signal-red"
          aria-label="Delete build"
          title="Delete build"
        >
          <Trash2 size={16} />
        </button>

        <ChevronDown
          size={20}
          className={`chevron-flip shrink-0 text-graphite-500 ${open ? "open" : ""}`}
        />
      </div>

      <div className={`collapse-panel ${open ? "open" : ""}`}>
        <div>
          <div className="border-t border-graphite-700 px-4 pb-4 pt-3">
            {parts.length === 0 ? (
              <p className="text-sm text-graphite-500">
                No parts assigned yet.{" "}
                <Link href={`/builds/${build.id}`} className="text-trace-400 hover:underline">
                  Add some
                </Link>
                .
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category} className="rounded-lg bg-graphite-800/60 p-3">
                    <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-trace-400">
                      {category}
                    </p>
                    {items.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
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
            {!complete && (
              <p className="mt-3 text-xs text-signal-red">
                Missing:{" "}
                {ESSENTIAL_CATEGORIES.filter(
                  (cat) => !parts.some((p) => p.category === cat)
                ).join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
