"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { getTopicConfig } from "@/lib/messageTopics";

export default function MessageDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_messages")
      .select("*, creator:profiles!creator_id(name, email, avatar_url)")
      .eq("id", id)
      .single();

    if (error) {
      setErrorMsg("Message not found.");
      setLoading(false);
      return;
    }

    setMessage(data);
    setLoading(false);

    // Mark as read for whoever's viewing it (not the creator — they never
    // got a notification row for their own message).
    if (user && data.creator_id !== user.id) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("message_id", id)
        .eq("user_id", user.id);
    }
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-sm text-graphite-500">Loading message…</p>;
  if (!message)
    return (
      <div>
        <p className="mb-4 text-sm text-signal-red">{errorMsg}</p>
        <Link href="/messages" className="text-trace-400 hover:underline">
          ← Back to messages
        </Link>
      </div>
    );

  const topic = getTopicConfig(message.topic);
  const creatorName = message.creator?.name || message.creator?.email || "Someone";

  return (
    <div className="max-w-2xl">
      <Link
        href="/messages"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-graphite-500 hover:text-white"
      >
        <ArrowLeft size={15} />
        Back to messages
      </Link>

      <div className="rounded-xl border border-graphite-700 bg-graphite-900 p-6">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${topic.bg} ${topic.text} ${topic.ring}`}
        >
          {topic.label}
        </span>

        <h1 className="mt-3 font-display text-xl font-bold text-white">{message.title}</h1>

        <div className="mt-1 flex items-center gap-1.5 text-xs text-graphite-500">
          <User size={12} />
          {creatorName}
          <span>&middot;</span>
          {new Date(message.created_at).toLocaleString()}
        </div>

        {message.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-graphite-300">
            {message.description}
          </p>
        )}

        {message.linked_build_id && (
          <Link
            href={`/builds/${message.linked_build_id}`}
            className="mt-4 inline-block text-sm text-trace-400 hover:underline"
          >
            View linked build →
          </Link>
        )}
      </div>
    </div>
  );
}