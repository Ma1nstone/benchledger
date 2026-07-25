"use client";

import Link from "next/link";
import { Lock, User } from "lucide-react";
import { getTopicConfig } from "@/lib/messageTopics";

export default function MessageCard({ message, isUnread }) {
  const topic = getTopicConfig(message.topic);
  const creatorName = message.creator?.name || message.creator?.email || "Someone";
  const isPrivate = (message.recipient_ids || []).length > 0;

  return (
    <Link
      href={`/messages/${message.id}`}
      className={`flex flex-col gap-2 rounded-xl border border-graphite-700 border-l-4 bg-graphite-900 p-4 transition hover:border-graphite-600 ${topic.ring}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${topic.bg} ${topic.text} ${topic.ring}`}
          >
            {topic.label}
          </span>
          {isPrivate && (
            <span className="flex items-center gap-1 rounded-full bg-graphite-800 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-graphite-400 ring-1 ring-graphite-700">
              <Lock size={10} />
              Private
            </span>
          )}
        </div>
        {isUnread && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-signal-red" title="Unread" />
        )}
      </div>

      <p className="font-display font-semibold text-white">{message.title}</p>

      {message.description && (
        <p className="line-clamp-2 text-sm text-graphite-500">{message.description}</p>
      )}

      <div className="mt-1 flex items-center gap-1.5 text-xs text-graphite-600">
        <User size={12} />
        {creatorName}
        <span>&middot;</span>
        {new Date(message.created_at).toLocaleDateString()}
      </div>
    </Link>
  );
}