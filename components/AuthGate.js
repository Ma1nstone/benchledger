"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

// These stay visible without signing in: the marketing homepage (so it
// still explains the app for Google's OAuth verification), and the legal
// pages (which must be reachable without an account).
const PUBLIC_PATHS = ["/", "/privacy", "/terms"];

export default function AuthGate({ children }) {
  const pathname = usePathname();
  const { user, loading, signInWithGoogle } = useAuth();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (loading) {
    return <p className="text-sm text-graphite-500">Loading…</p>;
  }

  if (!user && !isPublic) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-display text-2xl font-bold text-white">Sign in required</h1>
        <p className="max-w-sm text-sm text-graphite-500">
          You need to sign in with Google to use PC Scout.
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