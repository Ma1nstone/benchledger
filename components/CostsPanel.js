"use client";

import { useMemo, useState } from "react";
import { Check, Layers, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/constants";

// Costs mode's toolbar: select parts (selection + per-part rendering both
// live in the shared category grid in the build page, so Estimate and
// Costs look identical), then group them here. Purely UI state + the
// callbacks the parent wires up to Supabase — this component holds no
// data of its own beyond the "creating a new group" input.
export default function CostsPanel({
  costGroups,
  partCountByGroup,
  selectedIds,
  onClearSelection,
  onCreateGroup,
  onAddToGroup,
  onUpdateGroupPrice,
  onDeleteGroup,
  totalPurchaseCost,
  busy,
}) {
  const [newGroupPrice, setNewGroupPrice] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  const selectedCount = selectedIds.size;

  const hasSelection = selectedCount > 0;

  function submitNewGroup() {
    onCreateGroup(newGroupPrice);
    setNewGroupPrice("");
    setCreatingGroup(false);
  }

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="rounded-xl border border-graphite-700 bg-graphite-900 p-4">
        <p className="text-xs text-graphite-500">
          Tick parts bought together below, then group them under one purchase price. Anything
          left ungrouped keeps its own purchase cost field.
        </p>

        {hasSelection && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-trace-500/30 bg-trace-500/5 p-3">
            <span className="text-sm text-graphite-300">{selectedCount} selected</span>

            {!creatingGroup ? (
              <button
                onClick={() => setCreatingGroup(true)}
                className="flex items-center gap-1.5 rounded-lg bg-trace-500 px-3 py-1.5 text-xs font-semibold text-graphite-950 hover:bg-trace-400"
              >
                <Layers size={13} />
                Group selected
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-graphite-500">£</span>
                <input
                  autoFocus
                  type="number"
                  step="0.01"
                  min="0"
                  value={newGroupPrice}
                  onChange={(e) => setNewGroupPrice(e.target.value)}
                  placeholder="Total paid"
                  className="w-28 rounded-lg border border-graphite-700 bg-graphite-800 px-2 py-1.5 text-sm text-white placeholder:text-graphite-500"
                />
                <button
                  onClick={submitNewGroup}
                  disabled={busy}
                  className="flex items-center gap-1 rounded-lg bg-trace-500 px-3 py-1.5 text-xs font-semibold text-graphite-950 hover:bg-trace-400 disabled:opacity-60"
                >
                  <Check size={13} />
                  Create group
                </button>
                <button
                  onClick={() => setCreatingGroup(false)}
                  className="text-xs text-graphite-500 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}

            {costGroups.length > 0 && !creatingGroup && (
              <select
                onChange={(e) => {
                  if (e.target.value) onAddToGroup(e.target.value);
                  e.target.value = "";
                }}
                defaultValue=""
                className="rounded-lg border border-graphite-700 bg-graphite-800 px-2 py-1.5 text-xs text-white"
              >
                <option value="" disabled>
                  Add to existing group…
                </option>
                {costGroups.map((g, i) => (
                  <option key={g.id} value={g.id}>
                    Group {i + 1} ({formatPrice(g.purchase_price)})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={onClearSelection}
              className="ml-auto text-xs text-graphite-500 hover:text-white"
            >
              Clear selection
            </button>
          </div>
        )}

        {costGroups.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {costGroups.map((group) => (
              <div
                key={group.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-graphite-700 bg-graphite-800/40 p-2.5"
                style={{ borderLeftColor: group.color, borderLeftWidth: 4 }}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-xs text-graphite-500">
                  {partCountByGroup[group.id] || 0} part
                  {(partCountByGroup[group.id] || 0) === 1 ? "" : "s"}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-graphite-500">£</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={group.purchase_price}
                    onBlur={(e) => onUpdateGroupPrice(group.id, e.target.value)}
                    className="w-24 rounded-lg border border-graphite-700 bg-graphite-900 px-2 py-1 text-right font-mono text-sm text-white"
                  />
                  <button
                    onClick={() => onDeleteGroup(group.id)}
                    className="rounded-lg p-1.5 text-graphite-500 hover:bg-signal-red/10 hover:text-signal-red"
                    aria-label="Delete group"
                    title="Delete group"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-graphite-800/60 p-4 text-center ring-1 ring-graphite-700">
        <p className="text-xs text-graphite-500">Total Purchase Cost</p>
        <p className="mt-1 font-mono text-2xl font-bold text-white">
          {formatPrice(totalPurchaseCost)}
        </p>
        <p className="mt-1 text-[11px] text-graphite-600">
          Sum of every purchase group + every ungrouped part&rsquo;s cost. Never affects Estimate
          mode.
        </p>
      </div>
    </div>
  );
}