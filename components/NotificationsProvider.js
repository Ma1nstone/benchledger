"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

const NotificationsContext = createContext({
  unreadCount: 0,
  markMessageRead: async () => {},
  soundEnabled: true,
  setSoundEnabled: () => {},
});

// A short beep generated on the fly — no audio file needed.
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not available in this browser/context — fail silently.
  }
}

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" && window.localStorage.getItem("notif_sound");
    if (stored != null) setSoundEnabled(stored === "true");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("notif_sound", String(soundEnabled));
  }, [soundEnabled]);

  const refreshCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setUnreadCount(count || 0);
  }, [user]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  // Listens for new notification rows aimed at this user in real time —
  // this is what makes online users get an instant popup instead of only
  // seeing unread messages after their next sign-in.
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          setUnreadCount((c) => c + 1);
          if (soundEnabled) playBeep();

          const { data: msg } = await supabase
            .from("site_messages")
            .select("id, title, topic")
            .eq("id", payload.new.message_id)
            .single();

          if (msg) {
            const toastId = `${payload.new.id}-${Date.now()}`;
            setToasts((prev) => [
              ...prev,
              { id: toastId, messageId: msg.id, title: msg.title, topic: msg.topic },
            ]);
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== toastId));
            }, 6000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, soundEnabled]);

  // Used by the message detail page instead of updating Supabase directly,
  // so the nav badge count stays in sync the moment something is read.
  async function markMessageRead(messageId) {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("message_id", messageId)
      .eq("user_id", user.id)
      .eq("read", false)
      .select("id");
    if (data && data.length > 0) {
      setUnreadCount((c) => Math.max(0, c - data.length));
    }
  }

  function dismissToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function goToToast(toast) {
    dismissToast(toast.id);
    router.push(`/messages/${toast.messageId}`);
  }

  return (
    <NotificationsContext.Provider value={{ unreadCount, markMessageRead, soundEnabled, setSoundEnabled }}>
      {children}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <button
            key={t.id}
            onClick={() => goToToast(t)}
            className="flex w-72 items-start gap-2 rounded-lg border border-graphite-700 bg-graphite-900 p-3 text-left shadow-xl transition hover:border-trace-500/50"
          >
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-trace-400" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase tracking-wide text-trace-400">
                New message
              </span>
              <span className="block truncate text-sm text-white">{t.title}</span>
            </span>
          </button>
        ))}
      </div>
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}