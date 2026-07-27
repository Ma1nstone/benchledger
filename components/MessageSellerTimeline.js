"use client";

import { useState } from "react";
import { Check, Clock, MapPin, X } from "lucide-react";
import { formatPrice } from "@/lib/constants";

const STATUS_STYLES = {
  pending: {
    text: "text-graphite-400",
    bg: "bg-graphite-700/30",
    ring: "ring-graphite-600",
    icon: Clock,
    label: "Pending",
  },
  replied: {
    text: "text-signal-green",
    bg: "bg-signal-green/10",
    ring: "ring-signal-green/40",
    icon: Check,
    label: "Replied",
  },
  accepted: {
    text: "text-signal-green",
    bg: "bg-signal-green/10",
    ring: "ring-signal-green/40",
    icon: Check,
    label: "Accepted",
  },
  declined: {
    text: "text-signal-red",
    bg: "bg-signal-red/10",
    ring: "ring-signal-red/40",
    icon: X,
    label: "Declined",
  },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${s.bg} ${s.text} ${s.ring}`}
    >
      <Icon size={11} />
      {s.label}
    </span>
  );
}

// Renders the negotiation as a permanent, append-only history — every past
// entry stays visible with its final status, and only the most recent
// ("live") entry ever gets action buttons. canInteract covers both the
// message's creator AND anyone it was privately sent to — either side of
// the negotiation can advance it.
//
// onUpdate(newNegotiationArray, acceptedAmount) — acceptedAmount is only
// non-null the moment an offer/counter offer is accepted, so the parent
// can sync it onto the linked build.
export default function MessageSellerTimeline({ message, canInteract, onUpdate, onSaveCollection }) {
  const negotiation = message.metadata?.negotiation || [];
  const counterOfferAmount = message.metadata?.counter_offer;

  const [collectionDate, setCollectionDate] = useState(message.metadata?.collection?.date || "");
  const [collectionTime, setCollectionTime] = useState(message.metadata?.collection?.time || "");
  const [savingCollection, setSavingCollection] = useState(false);

  const hasAcceptedOffer = negotiation.some(
    (e) => (e.type === "offer" || e.type === "counter_offer") && e.status === "accepted"
  );

  function handleMarkReplied(entryId) {
    const updated = negotiation.map((e) => (e.id === entryId ? { ...e, status: "replied" } : e));
    updated.push({
      id: "offer1",
      type: "offer",
      label: "Offer #1",
      amount: message.metadata.first_offer,
      status: "pending",
    });
    onUpdate(updated, null);
  }

  function handleOfferDecision(entryId, decision, amount) {
    const updated = negotiation.map((e) => (e.id === entryId ? { ...e, status: decision } : e));
    if (decision === "declined" && entryId === "offer1" && counterOfferAmount != null) {
      updated.push({
        id: "counter1",
        type: "counter_offer",
        label: "Counter Offer",
        amount: counterOfferAmount,
        status: "pending",
      });
    }
    onUpdate(updated, decision === "accepted" ? amount : null);
  }

  async function handleSaveCollection() {
    setSavingCollection(true);
    await onSaveCollection({ date: collectionDate, time: collectionTime });
    setSavingCollection(false);
  }

  if (negotiation.length === 0) return null;

  return (
    <div className="mt-6 border-t border-graphite-700 pt-5">
      <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-graphite-500">
        Negotiation
      </h2>
      <div className="flex flex-col gap-3">
        {negotiation.map((entry, i) => {
          const isLast = i === negotiation.length - 1;
          const canAct = canInteract && isLast && entry.status === "pending";

          return (
            <div
              key={entry.id}
              className="rounded-lg border border-graphite-700 bg-graphite-800/60 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-white">
                  {entry.type === "question"
                    ? entry.label
                    : `${entry.label}: ${formatPrice(entry.amount)}`}
                </p>
                <StatusBadge status={entry.status} />
              </div>

              {canAct && entry.type === "question" && (
                <button
                  onClick={() => handleMarkReplied(entry.id)}
                  className="mt-2 rounded-lg bg-signal-green/15 px-3 py-1.5 text-xs font-semibold text-signal-green ring-1 ring-signal-green/40 transition hover:bg-signal-green/25"
                >
                  Mark as Replied
                </button>
              )}

              {canAct && (entry.type === "offer" || entry.type === "counter_offer") && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleOfferDecision(entry.id, "accepted", entry.amount)}
                    className="rounded-lg bg-signal-green/15 px-3 py-1.5 text-xs font-semibold text-signal-green ring-1 ring-signal-green/40 transition hover:bg-signal-green/25"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleOfferDecision(entry.id, "declined", entry.amount)}
                    className="rounded-lg bg-signal-red/15 px-3 py-1.5 text-xs font-semibold text-signal-red ring-1 ring-signal-red/40 transition hover:bg-signal-red/25"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasAcceptedOffer && (
        <div className="mt-4 rounded-lg border border-signal-green/30 bg-signal-green/5 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-signal-green">
            <MapPin size={12} />
            Collection details
          </p>
          {canInteract ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="rounded-lg border border-graphite-700 bg-graphite-800 px-2 py-1.5 text-sm text-white"
              />
              <input
                type="time"
                value={collectionTime}
                onChange={(e) => setCollectionTime(e.target.value)}
                className="rounded-lg border border-graphite-700 bg-graphite-800 px-2 py-1.5 text-sm text-white"
              />
              <button
                onClick={handleSaveCollection}
                disabled={savingCollection}
                className="rounded-lg bg-signal-green/15 px-3 py-1.5 text-xs font-semibold text-signal-green ring-1 ring-signal-green/40 transition hover:bg-signal-green/25 disabled:opacity-60"
              >
                {savingCollection ? "Saving…" : "Save"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-graphite-300">
              {collectionDate || collectionTime
                ? `${collectionDate} ${collectionTime}`.trim()
                : "Not arranged yet."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}