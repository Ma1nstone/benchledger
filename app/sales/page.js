import { Wrench } from "lucide-react";

export default function SalesPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-graphite-700 bg-graphite-900 p-10 text-center shadow-xl shadow-black/30">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-signal-amber/10 blur-3xl" />

        <div className="relative mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-signal-amber/10 ring-1 ring-signal-amber/30">
          <Wrench size={28} className="animate-pulse text-signal-amber" />
        </div>

        <span className="relative mb-3 inline-block rounded-full bg-graphite-800 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-signal-amber ring-1 ring-graphite-700">
          Under construction
        </span>

        <h1 className="relative font-display text-2xl font-bold text-white">
          Sales tracking is on the bench
        </h1>
        <p className="relative mx-auto mt-2 max-w-sm text-sm text-graphite-500">
          This is where finished builds will get listed, priced, and marked sold.
          Come back soon — it&rsquo;s being wired up.
        </p>

        <div className="relative mt-6 flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-signal-amber"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
