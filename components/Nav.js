"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Cpu, MessageSquare, ShieldCheck, Wrench, Tag } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/components/AuthProvider";
import { useNotifications } from "@/components/NotificationsProvider";

const LINKS = [
  { href: "/parts", label: "Parts", icon: Cpu },
  { href: "/builds", label: "Builds", icon: Wrench },
  { href: "/sales", label: "Sales", icon: Tag },
  { href: "/estimate", label: "Estimate", icon: Calculator },
  { href: "/messages", label: "Messages", icon: MessageSquare },
];

export default function Nav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const { profile } = useAuth();

  const links = profile?.role === "admin" ? [...LINKS, { href: "/admin", label: "Admin", icon: ShieldCheck }] : LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-graphite-700 bg-graphite-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-trace-500/10 text-trace-400 ring-1 ring-trace-500/30">
            <Cpu size={18} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            PC Scout
          </span>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-graphite-700 bg-graphite-900 p-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-trace-500/15 text-trace-400 ring-1 ring-trace-500/40"
                    : "text-graphite-500 hover:text-white"
                }`}
              >
                <Icon size={15} />
                {label}
                {href === "/messages" && unreadCount > 0 && (
                  <span className="grid h-4 min-w-[16px] shrink-0 place-items-center rounded-full bg-signal-red px-1 text-[10px] font-bold leading-none text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <UserMenu />
      </div>
    </header>
  );
}