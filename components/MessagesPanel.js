"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Mail } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function MessagesPanel({ messages, parts, onMarkedSeen }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const unseenCount = messages.filter((m) => !m.seen).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unseenCount > 0) {
      const unseenIds = messages.filter((m) => !m.seen).map((m) => m.id);
      const { error } = await supabase
        .from("messages")
        .update({ seen: true })
        .in("id", unseenIds);
      if (!error) onMarkedSeen(unseenIds);
    }
  }

  function partFor(message) {
    return parts.find((p) => p.id === message.part_id) || null;
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={handleOpen}
        className="relative flex shrink-0 items-center gap-2 rounded-lg border border-graphite-700 bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-graphite-600"
      >
        <Mail size={16} />
        Messages
        {unseenCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-signal-red ring-2 ring-graphite-950" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-graphite-700 bg-graphite-900 p-3 shadow-2xl">
          {messages.length === 0 ? (
            <p className="p-3 text-sm text-graphite-500">
              No messages yet. Check the box when adding a part to leave a note here.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((m) => {
                const part = partFor(m);
                const hasLink = Boolean(part?.link);
                const Wrapper = hasLink ? "a" : "div";
                const wrapperProps = hasLink
                  ? { href: part.link, target: "_blank", rel: "noopener noreferrer" }
                  : {};
                return (
                  <Wrapper
                    key={m.id}
                    {...wrapperProps}
                    className={`block rounded-lg border border-graphite-700 bg-graphite-800 p-3 text-sm ${
                      hasLink ? "cursor-pointer transition hover:border-trace-500/50" : ""
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold uppercase tracking-wide text-trace-400">
                        {part ? part.name : "Unknown part"}
                      </span>
                      {hasLink && (
                        <ExternalLink size={12} className="shrink-0 text-graphite-500" />
                      )}
                    </div>
                    <p className="text-graphite-200">{m.body}</p>
                    <p className="mt-1 text-xs text-graphite-500">
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                  </Wrapper>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
