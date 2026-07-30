"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function UserMenu() {
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the moment a click lands anywhere outside the button/menu —
  // covers clicking elsewhere on the page, not just picking a menu item.
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (loading) return null;

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-2 rounded-lg border border-graphite-600 bg-graphite-800 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-graphite-500"
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-graphite-700 bg-graphite-800 p-1 pr-3 text-sm text-white hover:border-graphite-600"
      >
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-graphite-700">
            <User size={14} className="text-graphite-400" />
          </span>
        )}
        <span className="max-w-[110px] truncate">{profile?.name || user.email}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-lg border border-graphite-700 bg-graphite-900 p-1 shadow-xl">
          {profile?.role === "admin" && (
            <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-trace-400">
              Admin
            </p>
          )}
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-graphite-300 hover:bg-graphite-800 hover:text-white"
          >
            <Settings size={14} />
            Settings
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-graphite-300 hover:bg-graphite-800 hover:text-white"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}