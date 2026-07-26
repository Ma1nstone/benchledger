"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ban, Check, Lock, RotateCcw, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { formatPrice } from "@/lib/constants";
import { useAuth } from "@/components/AuthProvider";
import { getTopicConfig } from "@/lib/messageTopics";

const TABS = ["Users", "Builds", "Messages"];

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [tab, setTab] = useState("Users");
  const [users, setUsers] = useState([]);
  const [builds, setBuilds] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!isAdmin) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function loadAll() {
    setLoading(true);
    const [{ data: usersData }, { data: buildsData }, { data: messagesData }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase
        .from("builds")
        .select("*, owner:profiles!owner_id(name, email)")
        .order("created_at", { ascending: false }),
      supabase
        .from("site_messages")
        .select("*, creator:profiles!creator_id(name, email)")
        .order("created_at", { ascending: false }),
    ]);
    setUsers(usersData || []);
    setBuilds(buildsData || []);
    setMessages(messagesData || []);
    setLoading(false);
  }

  async function toggleRole(u) {
    const newRole = u.role === "admin" ? "user" : "admin";
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", u.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, role: newRole } : p)));
  }

  async function toggleDisabled(u) {
    const { error } = await supabase
      .from("profiles")
      .update({ disabled: !u.disabled })
      .eq("id", u.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, disabled: !p.disabled } : p)));
  }

  async function softDeleteBuild(build) {
    if (!confirm(`Soft-delete "${build.name}"? It'll be hidden from normal views but recoverable here.`))
      return;
    const { error } = await supabase
      .from("builds")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", build.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setBuilds((prev) => prev.map((b) => (b.id === build.id ? { ...b, deleted_at: new Date().toISOString() } : b)));
  }

  async function restoreBuild(build) {
    const { error } = await supabase.from("builds").update({ deleted_at: null }).eq("id", build.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setBuilds((prev) => prev.map((b) => (b.id === build.id ? { ...b, deleted_at: null } : b)));
  }

  if (authLoading) return <p className="text-sm text-graphite-500">Loading…</p>;

  if (!user || !isAdmin) {
    return (
      <div>
        <h1 className="mb-4 font-display text-2xl font-bold text-white">Admin</h1>
        <p className="text-sm text-graphite-500">You don&rsquo;t have access to this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <ShieldCheck size={22} className="text-trace-400" />
        <h1 className="font-display text-2xl font-bold text-white">Admin</h1>
      </div>

      <div className="mb-5 flex gap-1 rounded-full border border-graphite-700 bg-graphite-900 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t
                ? "bg-trace-500/15 text-trace-400 ring-1 ring-trace-500/40"
                : "text-graphite-500 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-2 text-sm text-signal-red">
          {errorMsg}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-graphite-500">Loading…</p>
      ) : tab === "Users" ? (
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-4 rounded-xl border border-graphite-700 bg-graphite-900 p-4"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-graphite-800">
                {u.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserCog size={16} className="text-graphite-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{u.name || "Unnamed"}</p>
                <p className="truncate text-xs text-graphite-500">{u.email}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
                  u.role === "admin"
                    ? "bg-trace-500/10 text-trace-400 ring-trace-500/30"
                    : "bg-graphite-800 text-graphite-500 ring-graphite-700"
                }`}
              >
                {u.role}
              </span>
              {u.disabled && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-signal-red/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-signal-red ring-1 ring-signal-red/40">
                  <Ban size={10} />
                  Disabled
                </span>
              )}
              <button
                onClick={() => toggleRole(u)}
                className="shrink-0 rounded-lg bg-graphite-800 px-3 py-1.5 text-xs font-medium text-graphite-300 hover:bg-graphite-700"
              >
                {u.role === "admin" ? "Demote" : "Promote"}
              </button>
              <button
                onClick={() => toggleDisabled(u)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  u.disabled
                    ? "bg-signal-green/15 text-signal-green hover:bg-signal-green/25"
                    : "bg-signal-red/15 text-signal-red hover:bg-signal-red/25"
                }`}
              >
                {u.disabled ? "Enable" : "Disable"}
              </button>
            </div>
          ))}
        </div>
      ) : tab === "Builds" ? (
        <div className="flex flex-col gap-2">
          {builds.map((b) => {
            const status = b.deleted_at ? "Deleted" : b.sold ? "Sold" : "Active";
            const statusStyle =
              status === "Deleted"
                ? "bg-signal-red/10 text-signal-red ring-signal-red/40"
                : status === "Sold"
                ? "bg-graphite-800 text-graphite-400 ring-graphite-700"
                : "bg-signal-green/10 text-signal-green ring-signal-green/40";
            return (
              <div
                key={b.id}
                className="flex items-center gap-4 rounded-xl border border-graphite-700 bg-graphite-900 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{b.name}</p>
                  <p className="truncate text-xs text-graphite-500">
                    {b.owner?.name || b.owner?.email || "No owner"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${statusStyle}`}
                >
                  {status}
                </span>
                <Link
                  href={`/builds/${b.id}`}
                  className="shrink-0 rounded-lg bg-graphite-800 px-3 py-1.5 text-xs font-medium text-graphite-300 hover:bg-graphite-700"
                >
                  Open
                </Link>
                {b.deleted_at ? (
                  <button
                    onClick={() => restoreBuild(b)}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-signal-green/15 px-3 py-1.5 text-xs font-medium text-signal-green hover:bg-signal-green/25"
                  >
                    <RotateCcw size={13} />
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={() => softDeleteBuild(b)}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-signal-red/15 px-3 py-1.5 text-xs font-medium text-signal-red hover:bg-signal-red/25"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {messages.map((m) => {
            const topic = getTopicConfig(m.topic);
            const isPrivate = (m.recipient_ids || []).length > 0;
            return (
              <Link
                key={m.id}
                href={`/messages/${m.id}`}
                className="flex items-center gap-3 rounded-xl border border-graphite-700 bg-graphite-900 p-4 hover:border-graphite-600"
              >
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${topic.bg} ${topic.text} ${topic.ring}`}
                >
                  {topic.label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{m.title}</p>
                  <p className="truncate text-xs text-graphite-500">
                    {m.creator?.name || m.creator?.email || "Someone"}
                  </p>
                </div>
                {isPrivate && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-graphite-800 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-graphite-400 ring-1 ring-graphite-700">
                    <Lock size={10} />
                    Private
                  </span>
                )}
                <span className="shrink-0 text-xs text-graphite-600">
                  {new Date(m.created_at).toLocaleDateString()}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}