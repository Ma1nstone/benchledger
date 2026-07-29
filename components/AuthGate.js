"use client";

import { usePathname } from "next/navigation";
import { Ban } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

// These stay visible without signing in: the marketing homepage (so it
// still explains the app for Google's OAuth verification), and the legal
// pages (which must be reachable without an account).
const PUBLIC_PATHS = ["/", "/privacy", "/terms"];

export default function AuthGate({ children }) {
  const pathname = usePathname();
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (loading) {
    return <p className="text-sm text-graphite-500">Loading…</p>;
  }

  // A disabled account is blocked everywhere, even the public pages —
  // this was previously just a flag on the profile row with nothing
  // actually checking it, so "Disable" in Admin had no real effect.
  if (user && profile?.disabled) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-signal-red/10 text-signal-red ring-1 ring-signal-red/40">
          <Ban size={26} />
        </span>
        <h1 className="font-display text-2xl font-bold text-white">
          Your account has been disabled
        </h1>
        <p className="max-w-sm text-sm text-graphite-500">
          You don&rsquo;t have access to PCScout right now. If you think this is a mistake,
          contact an admin.
        </p>
        <button
          onClick={signOut}
          className="rounded-lg border border-graphite-700 px-5 py-2.5 text-sm font-semibold text-graphite-300 transition hover:bg-graphite-800"
        >
          Sign out
        </button>
      </div>
    );
  }

  if (!user && !isPublic) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-display text-2xl font-bold text-white">Sign in required</h1>
        <p className="max-w-sm text-sm text-graphite-500">
          You need to sign in with Google to use PCScout.
        </p>
        <button
          onClick={signInWithGoogle}
          className="rounded-lg bg-trace-500 px-5 py-2.5 text-sm font-semibold text-graphite-950 transition hover:bg-trace-400"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return children;
}