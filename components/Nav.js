"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, Wrench, Tag } from "lucide-react";

const LINKS = [
  { href: "/parts", label: "Parts", icon: Cpu },
  { href: "/builds", label: "Builds", icon: Wrench },
  { href: "/sales", label: "Sales", icon: Tag },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-graphite-700 bg-graphite-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/parts" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-trace-500/10 text-trace-400 ring-1 ring-trace-500/30">
            <Cpu size={18} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            Bench<span className="text-trace-400">Ledger</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-graphite-700 bg-graphite-900 p-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-trace-500/15 text-trace-400 ring-1 ring-trace-500/40"
                    : "text-graphite-500 hover:text-white"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
