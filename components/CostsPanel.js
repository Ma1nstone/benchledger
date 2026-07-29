"use client";

import { useMemo, useState } from "react";
import { Check, Layers, Plus, Trash2, Ungroup, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { formatPrice, nextGroupColor } from "@/lib/constants";

// Costs mode for a build's pricing panel. Completely independent of the
// Estimate system: it only ever reads/writes cost_groups + parts.cost_group_id
// / parts.purchase_cost, never parts.price. Parent (`app/builds/[id]/page.js`)
// owns the actual data and re-fetches it via `onRefresh` after every change
// here, so this component never needs to be the source of truth itself.
export default function CostsPanel({ buildId, parts, costGroups, onRefresh, onError }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [newGroupPrice, setNewGroupPrice] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [busy, setBusy] = useState(false);

  const groupedParts = useMemo(() => {
    const map = {};
    parts.forEach((p) => {
      if (!p.cost_group_id) return;
      map[p.cost_group_id] = map[p.cost_group_id] || [];
      map[p.cost_group_id].push(p);
    });
    return map;
  }, [parts]);

  const ungroupedParts = useMemo(
    () => parts.filter((p) => !p.cost_group_id),
    [parts]
  );

  const totalPurchaseCost = useMemo(() => {
    const groupsTotal = costGroups.reduce((sum, g) => sum + (Number(g.purchase_price) || 0), 0);
    const ungroupedTotal = ungroupedParts.reduce(
      (sum, p) => sum + (Number(p.purchase_cost) || 0),
      0
    );
    return groupsTotal + ungroupedTotal;
  }, [costGroups, ungroupedParts]);

  function toggleSelect(partId) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(partId)) next.delete(partId);
      else next.add(partId);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleCreateGroup() {
    if (selectedIds.size === 0) return;
    setBusy(true);
    try {
      const color = nextGroupColor(costGroups.map((g) => g.color));
      const { data: group, error: groupError } = await supabase
        .from("cost_groups")
        .insert({
          build_id: buildId,
          purchase_price: newGroupPrice === "" ? 0 : Number(newGroupPrice),
          color,
        })
        .select()
        .single();
      if (groupError) throw groupError;

      const { error: partsError } = await supabase
        .from("parts")
        .update({ cost_group_id: group.id })
        .in("id", Array.from(selectedIds));
      if (partsError) throw partsError;

      setNewGroupPrice("");
      setCreatingGroup(false);
      clearSelection();
      await onRefresh();
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAddToGroup(groupId) {
    if (selectedIds.size === 0) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("parts")
        .update({ cost_group_id: groupId })
        .in("id", Array.from(selectedIds));
      if (error) throw error;
      clearSelection();
      await onRefresh();
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveFromGroup(partId) {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("parts")
        .update({ cost_group_id: null })
        .eq("id", partId);
      if (error) throw error;
      await onRefresh();
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteGroup(groupId) {
    if (!confirm("Delete this purchase group? Its parts go back to ungrouped (their own purchase cost, if any, is kept).")) return;
    setBusy(true);
    try {
      // Parts' cost_group_id auto-clears via ON DELETE SET NULL.
      const { error } = await supabase.from("cost_groups").delete().eq("id", groupId);
      if (error) throw error;
      await onRefresh();
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateGroupPrice(groupId, value) {
    try {
      const { error } = await supabase
        .from("cost_groups")
        .update({ purchase_price: value === "" ? 0 : Number(value) })
        .eq("id", groupId);
      if (error) throw error;
      await onRefresh();
    } catch (err) {
      onError(err.message);
    }
  }

  async function handleUpdatePurchaseCost(partId, value) {
    try {
      const { error } = await supabase
        .from("parts")
        .update({ purchase_cost: value === "" ? null : Number(value) })
        .eq("id", partId);
      if (error) throw error;
      await onRefresh();
    } catch (err) {
      onError(err.message);
    }
  }

  if (parts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-graphite-700 bg-graphite-900/50 p-6 text-center text-sm text-graphite-500">
        Assign parts to this build first — they&rsquo;ll show up here to group into purchases.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-graphite-700 bg-graphite-900 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-graphite-500">
            Select parts bought together, then group them under one purchase price. Anything
            left ungrouped gets its own purchase cost.
          </p>
        </div>

        {selectedIds.size > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-trace-500/30 bg-trace-500/5 p-3">
            <span className="text-sm text-graphite-300">{selectedIds.size} selected</span>

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
                  onClick={handleCreateGroup}
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
                  if (e.target.value) handleAddToGroup(e.target.value);
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
              onClick={clearSelection}
              className="ml-auto text-xs text-graphite-500 hover:text-white"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Purchase groups */}
        {costGroups.length > 0 && (
          <div className="mb-4 flex flex-col gap-3">
            {costGroups.map((group, i) => (
              <div
                key={group.id}
                className="overflow-hidden rounded-lg border border-graphite-700 bg-graphite-800/40"
                style={{ borderLeftColor: group.color, borderLeftWidth: 4 }}
              >
                <div className="flex flex-wrap items-center gap-2 border-b border-graphite-700/60 p-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <p className="text-sm font-semibold text-white">Group {i + 1}</p>
                  <span className="text-xs text-graphite-500">
                    {(groupedParts[group.id] || []).length} part
                    {(groupedParts[group.id] || []).length === 1 ? "" : "s"}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-graphite-500">£</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={group.purchase_price}
                      onBlur={(e) => handleUpdateGroupPrice(group.id, e.target.value)}
                      className="w-24 rounded-lg border border-graphite-700 bg-graphite-900 px-2 py-1 text-right font-mono text-sm text-white"
                    />
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="rounded-lg p-1.5 text-graphite-500 hover:bg-signal-red/10 hover:text-signal-red"
                      aria-label="Delete group"
                      title="Delete group"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1 p-3">
                  {(groupedParts[group.id] || []).map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="rounded-full bg-graphite-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-trace-400 ring-1 ring-graphite-700">
                          {p.category}
                        </span>
                        <span className="truncate text-graphite-200">{p.name}</span>
                      </span>
                      <button
                        onClick={() => handleRemoveFromGroup(p.id)}
                        className="shrink-0 text-graphite-500 hover:text-signal-red"
                        aria-label={`Remove ${p.name} from group`}
                        title="Remove from group"
                      >
                        <Ungroup size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ungrouped parts */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-graphite-500">
            Ungrouped parts
          </p>
          {ungroupedParts.length === 0 ? (
            <p className="text-xs text-graphite-600">Everything is in a purchase group.</p>
          ) : (
            ungroupedParts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-graphite-700 bg-graphite-800/60 px-3 py-2"
              >
                <button
                  onClick={() => toggleSelect(p.id)}
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded border transition ${
                    selectedIds.has(p.id)
                      ? "border-trace-500 bg-trace-500 text-graphite-950"
                      : "border-graphite-600 bg-graphite-800"
                  }`}
                  aria-label={`Select ${p.name}`}
                >
                  {selectedIds.has(p.id) && <Check size={12} strokeWidth={3} />}
                </button>
                <span className="rounded-full bg-graphite-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-trace-400 ring-1 ring-graphite-700">
                  {p.category}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-graphite-200">{p.name}</span>
                <span className="shrink-0 text-xs text-graphite-500">£</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={p.purchase_cost ?? ""}
                  onBlur={(e) => handleUpdatePurchaseCost(p.id, e.target.value)}
                  placeholder="0.00"
                  className="w-24 shrink-0 rounded-lg border border-graphite-700 bg-graphite-900 px-2 py-1 text-right font-mono text-sm text-white placeholder:text-graphite-600"
                />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-lg bg-graphite-800/60 p-4 text-center ring-1 ring-graphite-700">
        <p className="text-xs text-graphite-500">Total Purchase Cost</p>
        <p className="mt-1 font-mono text-2xl font-bold text-white">
          {formatPrice(totalPurchaseCost)}
        </p>
        <p className="mt-1 text-[11px] text-graphite-600">
          Sum of every purchase group + every ungrouped part&rsquo;s cost. Used for profit on the
          Sales page — never affects Estimate mode.
        </p>
      </div>
    </div>
  );
}