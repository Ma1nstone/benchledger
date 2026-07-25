"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import SearchBar from "@/components/SearchBar";
import MessageCard from "@/components/MessageCard";
import { MESSAGE_TOPICS } from "@/lib/messageTopics";

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [notifMap, setNotifMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("All");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadData() {
    setLoading(true);
    const { data: messagesData, error } = await supabase
      .from("site_messages")
      .select("*, creator:profiles!creator_id(name, email, avatar_url)")
      .order("created_at", { ascending: false });
    if (error) setErrorMsg(error.message);
    setMessages(messagesData || []);

    if (user) {
      const { data: notifData } = await supabase
        .from("notifications")
        .select("message_id, read")
        .eq("user_id", user.id);
      const map = {};
      (notifData || []).forEach((n) => (map[n.message_id] = n.read));
      setNotifMap(map);
    }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      if (topicFilter !== "All" && m.topic !== topicFilter) return false;
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) || (m.description || "").toLowerCase().includes(q)
      );
    });
  }, [messages, search, topicFilter]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Messages</h1>
          <p className="text-sm text-graphite-500">Site-wide messages from every user.</p>
        </div>
        <Link
          href="/messages/new"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-trace-500 px-4 py-2.5 text-sm font-semibold text-graphite-950 transition hover:bg-trace-400"
        >
          <Plus size={16} />
          Create Message
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search messages…"
          className="flex-1 lg:max-w-md"
        />
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white"
        >
          <option value="All">All topics</option>
          {Object.values(MESSAGE_TOPICS).map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-2 text-sm text-signal-red">
          {errorMsg}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-graphite-500">Loading messages…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-graphite-700 bg-graphite-900/50 p-10 text-center">
          <MessageSquare size={22} className="mx-auto mb-3 text-graphite-600" />
          <p className="text-graphite-400">
            {messages.length === 0 ? "No messages yet." : "Nothing matches your search or filter."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((m) => {
            const isOwn = user && m.creator_id === user.id;
            const isUnread = !isOwn && notifMap[m.id] === false;
            return <MessageCard key={m.id} message={m} isUnread={isUnread} />;
          })}
        </div>
      )}
    </div>
  );
}