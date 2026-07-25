"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

export default function SettingsPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setName(profile?.name || "");
  }, [profile]);

  async function saveName() {
    if (!user || name.trim() === (profile?.name || "")) return;
    setSaving(true);
    setErrorMsg("");
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim() })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    await refreshProfile();
  }

  if (!user) {
    return (
      <div>
        <h1 className="mb-4 font-display text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-graphite-500">Sign in to view your settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 font-display text-2xl font-bold text-white">Settings</h1>

      <div className="mb-6 flex items-center gap-4 rounded-xl border border-graphite-700 bg-graphite-900 p-5">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-graphite-800 ring-1 ring-graphite-700">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <User size={22} className="text-graphite-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-xs text-graphite-500">Display name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            placeholder="Your name"
            className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-1.5 text-sm font-medium text-white placeholder:text-graphite-500"
          />
          <p className="mt-1 truncate text-xs text-graphite-500">{profile?.email || user.email}</p>
          {profile?.role === "admin" && (
            <span className="mt-1 inline-block rounded-full bg-trace-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-trace-400 ring-1 ring-trace-500/30">
              Admin
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-lg border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-xs text-signal-red">
          {errorMsg}
        </p>
      )}
      {saving && <p className="mb-4 text-xs text-graphite-500">Saving…</p>}

      <div className="mb-6 rounded-xl border border-graphite-700 bg-graphite-900 p-5">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-graphite-500">
          Legal
        </h2>
        <div className="flex flex-col gap-2">
          <Link
            href="/privacy"
            className="flex items-center gap-1.5 text-sm text-trace-400 hover:text-trace-300 hover:underline"
          >
            Privacy Policy <ExternalLink size={13} />
          </Link>
          <Link
            href="/terms"
            className="flex items-center gap-1.5 text-sm text-trace-400 hover:text-trace-300 hover:underline"
          >
            Terms of Service <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      <button
        onClick={signOut}
        className="flex items-center gap-2 rounded-lg border border-signal-red/40 bg-signal-red/10 px-4 py-2.5 text-sm font-semibold text-signal-red transition hover:bg-signal-red/20"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  );
}