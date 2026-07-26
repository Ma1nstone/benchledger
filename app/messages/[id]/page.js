"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Lock, MapPin, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { formatPrice } from "@/lib/constants";
import { useAuth } from "@/components/AuthProvider";
import { useNotifications } from "@/components/NotificationsProvider";
import { getTopicConfig } from "@/lib/messageTopics";
import MessageSellerTimeline from "@/components/MessageSellerTimeline";

export default function MessageDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { markMessageRead } = useNotifications();
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
    // got a notification row for their own message). Goes through the
    // shared notifications context so the nav badge updates immediately.
    if (user && data.creator_id !== user.id) {
      await markMessageRead(id);
    }
  }, [id, user, markMessageRead]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleNegotiationUpdate(newNegotiation) {
    const newMetadata = { ...message.metadata, negotiation: newNegotiation };
    const { error } = await supabase
      .from("site_messages")
      .update({ metadata: newMetadata })
      .eq("id", message.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setMessage((m) => ({ ...m, metadata: newMetadata }));
  }

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
  const isPrivate = (message.recipient_ids || []).length > 0;
  const isMessageSeller = message.topic === "message_seller";
  const isOwner = user && message.creator_id === user.id;

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
        <div className="flex items-center gap-2">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${topic.bg} ${topic.text} ${topic.ring}`}
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

        {isMessageSeller && (
          <div className="mt-5 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-400">
              Listing details
            </p>
            <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm text-graphite-300 sm:grid-cols-2">
              <p>
                <span className="text-graphite-500">Marketplace:</span> {message.metadata.marketplace}
              </p>
              <p>
                <span className="text-graphite-500">Listing price:</span>{" "}
                {formatPrice(message.metadata.listing_price)}
              </p>
              <p>
                <span className="text-graphite-500">Seller:</span> {message.metadata.seller_name}
              </p>
              <p className="flex items-center gap-1">
                <MapPin size={12} className="text-graphite-500" />
                {message.metadata.seller_location}
              </p>
            </div>
            {message.metadata.listing_url && (
              <a
                href={message.metadata.listing_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-fit items-center gap-1 text-xs text-trace-400 hover:underline"
              >
                Open listing <ExternalLink size={11} />
              </a>
            )}
            {message.metadata.notes && (
              <p className="mt-2 text-xs text-graphite-500">{message.metadata.notes}</p>
            )}
          </div>
        )}

        {isMessageSeller && (
          <MessageSellerTimeline
            message={message}
            isOwner={isOwner}
            onUpdate={handleNegotiationUpdate}
          />
        )}
      </div>
    </div>
  );
}