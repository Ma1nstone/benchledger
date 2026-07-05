"use client";

import Link from "next/link";
import { X, Package } from "lucide-react";
import { formatPrice } from "@/lib/constants";

export default function PartPicker({ category, options, onChoose, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl border border-graphite-700 bg-graphite-900 p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-white">
            Add {category}
          </h3>
          <button
            onClick={onClose}
            className="text-graphite-500 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {options.length === 0 ? (
          <div className="rounded-lg border border-dashed border-graphite-700 p-6 text-center">
            <p className="text-sm text-graphite-400">
              No unused {category} parts in inventory.
            </p>
            <Link
              href="/parts"
              className="mt-2 inline-block text-sm text-trace-400 hover:underline"
            >
              Add one on the Parts page →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {options.map((part) => (
              <button
                key={part.id}
                onClick={() => onChoose(part)}
                className="flex items-center gap-3 rounded-lg border border-graphite-700 bg-graphite-800 p-3 text-left transition hover:border-trace-500/50"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded bg-graphite-700">
                  {part.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={part.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package size={16} className="text-graphite-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{part.name}</p>
                  <p className="text-xs text-graphite-500">{part.marketplace}</p>
                </div>
                <span className="shrink-0 font-mono text-sm text-white">
                  {formatPrice(part.price)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
