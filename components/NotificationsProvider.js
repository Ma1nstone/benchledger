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
  sendTestPing: () => {},
  notifPermission: "unsupported",
  requestNotifPermission: async () => {},
});

const BASE_TITLE = "PC Scout";
const BASE_FAVICON = "/favicon.svg?v=2";

function browserNotifSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

// A short beep generated on the fly — no audio file needed. Only used for
// the in-app toast fallback; real OS notifications already make their own
// sound, so we don't want to double up.
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

// Draws the real favicon onto a canvas, adds a red count badge in the
// corner if count > 0, and swaps the tab icon to the result.
function updateFavicon(count) {
  if (typeof document === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = BASE_FAVICON;
  img.onload = () => {
    ctx.clearRect(0, 0, 64, 64);
    ctx.drawImage(img, 0, 0, 64, 64);

    if (count > 0) {
      const radius = 20;
      const cx = 64 - radius / 1.3;
      const cy = radius / 1.3;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#0a0a0f";
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(count > 9 ? "9+" : String(count), cx, cy + 2);
    }

    document.querySelectorAll("link[data-dynamic-favicon]").forEach((el) => el.remove());

    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.setAttribute("data-dynamic-favicon", "true");
    link.href = canvas.toDataURL("image/png");
    document.head.appendChild(link);
  };
}

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifPermission, setNotifPermission] = useState("unsupported");

  useEffect(() => {
    if (browserNotifSupported()) setNotifPermission(Notification.permission);
  }, []);

  // Must be called from a real click (browsers block permission prompts
  // that aren't triggered by direct user interaction).
  async function requestNotifPermission() {
    if (!browserNotifSupported()) return "unsupported";
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    return result;
  }

  // Fires a real OS-level notification if permitted; otherwise falls back
  // to the in-app bottom-right toast.
  function notify(title, body, messageId) {
    if (browserNotifSupported() && notifPermission === "granted") {
      const n = new Notification(title, {
        body: body || "PC Scout",
        icon: "/favicon.svg?v=2",
      });
      n.onclick = () => {
        window.focus();
        if (messageId) router.push(`/messages/${messageId}`);
        n.close();
      };
      return;
    }

    // Fallback: in-app toast, since native notifications aren't available
    // or the user hasn't granted permission yet.
    if (soundEnabled) playBeep();
    const toastId = `${messageId || "toast"}-${Date.now()}`;
    setToasts((prev) => [...prev, { id: toastId, messageId, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 6000);
  }

  useEffect(() => {
    const stored = typeof window !== "undefined" && window.localStorage.getItem("notif_sound");
    if (stored != null) setSoundEnabled(stored === "true");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("notif_sound", String(soundEnabled));
  }, [soundEnabled]);

  // Tab title + favicon badge — Discord/Gmail-style unread indicator.
  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount > 9 ? "9+" : unreadCount}) ${BASE_TITLE}` : BASE_TITLE;
    updateFavicon(unreadCount);
  }, [unreadCount]);

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

          const { data: msg } = await supabase
            .from("site_messages")
            .select("id, title, topic")
            .eq("id", payload.new.message_id)
            .single();

          if (msg) {
            notify(msg.title, "New message on PC Scout", msg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, soundEnabled, notifPermission]);

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
    if (toast.messageId) router.push(`/messages/${toast.messageId}`);
  }

  // Confirms notifications are actually working on this device/browser —
  // fires a real OS notification if permitted, otherwise the in-app toast.
  function sendTestPing() {
    notify("Test ping", "Notifications are working!", null);
  }

  return (
    <NotificationsContext.Provider
      value={{
        unreadCount,
        markMessageRead,
        soundEnabled,
        setSoundEnabled,
        sendTestPing,
        notifPermission,
        requestNotifPermission,
      }}
    >
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
                {t.messageId ? "New message" : "Test"}
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