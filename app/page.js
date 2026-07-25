"use client";

import Link from "next/link";
import { Cpu, LineChart, ShoppingBag, Wrench } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const FEATURES = [
  {
    icon: Cpu,
    title: "Track your parts inventory",
    body: "Log every part you buy — CPUs, GPUs, RAM, storage and more — with price, marketplace, and condition.",
  },
  {
    icon: Wrench,
    title: "Assemble builds",
    body: "Combine parts into complete PC builds and see your total cost update automatically as you add or remove pieces.",
  },
  {
    icon: LineChart,
    title: "AI-assisted price estimates",
    body: "Paste a listing description and get an instant breakdown of its parts with realistic offer and resale price suggestions.",
  },
  {
    icon: ShoppingBag,
    title: "Manage sales",
    body: "Mark builds as sold, record the sale price, and keep a running history of your profit on every flip.",
  },
];

export default function HomePage() {
  const { user, signInWithGoogle } = useAuth();

  return (
    <div className="flex flex-col gap-16">
      <section className="mx-auto max-w-2xl pt-8 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">PCScout</h1>
        <p className="mt-4 text-lg text-graphite-400">
          The inventory, build, and resale tracker for people who buy, build, and flip PCs.
        </p>
        <p className="mt-3 text-sm text-graphite-500">
          Keep track of every part you own, assemble them into builds, estimate what a listing
          is really worth, and log what you make when you sell.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          {user ? (
            <Link
              href="/parts"
              className="rounded-lg bg-trace-500 px-5 py-2.5 text-sm font-semibold text-graphite-950 transition hover:bg-trace-400"
            >
              Go to your inventory
            </Link>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="rounded-lg bg-trace-500 px-5 py-2.5 text-sm font-semibold text-graphite-950 transition hover:bg-trace-400"
            >
              Sign in with Google to get started
            </button>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-graphite-700 bg-graphite-900 p-5"
          >
            <span className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-trace-500/10 text-trace-400 ring-1 ring-trace-500/30">
              <Icon size={18} />
            </span>
            <h2 className="font-display text-sm font-semibold text-white">{title}</h2>
            <p className="mt-1.5 text-sm text-graphite-500">{body}</p>
          </div>
        ))}
      </section>

      <footer className="flex justify-center gap-6 border-t border-graphite-800 pt-6 text-xs text-graphite-600">
        <Link href="/privacy" className="hover:text-graphite-400 hover:underline">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-graphite-400 hover:underline">
          Terms of Service
        </Link>
      </footer>
    </div>
  );
}