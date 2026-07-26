// app/api/parse-listing/route.js
// Uses Gemini to extract PC parts from a pasted listing, estimate a
// realistic current secondhand price for each, AND fill in any missing
// essential components with a compatible, budget-appropriate choice.

import { ESSENTIAL_CATEGORIES } from "@/lib/constants";

const CATEGORIES = [
  "CPU", "GPU", "RAM", "Storage", "PSU",
  "Motherboard", "Case", "Cooler", "Monitor", "Other",
];

const SYSTEM_PROMPT = `You are a PC hardware listing analyzer with deep knowledge of PC hardware compatibility.

Read the secondhand PC/parts listing text below and extract every actual hardware component mentioned. For each one, give your best estimate of a realistic CURRENT UK secondhand/used price in GBP (eBay/Facebook Marketplace sold-listing territory, not retail/new price) based on your knowledge of the part.

CATEGORY RULES for what's actually mentioned — read carefully, these are commonly confused:
- RAM: memory capacity — normally 4/8/16/32/64GB, described with the words "RAM", "memory", or "DDR3/DDR4/DDR5". A number of GB is ONLY RAM if the text actually calls it RAM/memory/DDR.
- Storage: SSD, HDD, NVMe, "hard drive", "hard disk", or a capacity described as storage/disk space — this includes GB or TB values. Do NOT classify a storage capacity as RAM just because it's a number of GB. If a GB/TB figure has no explicit RAM/memory/DDR wording nearby, assume it is Storage, not RAM.
- GPU: graphics card model (RTX/GTX/RX/Radeon, etc).
- CPU: processor model (Intel Core i3/i5/i7/i9, AMD Ryzen, etc).
- Motherboard, PSU, Case, Cooler, Monitor: as named.
- If a spec doesn't clearly fit any of the above, use "Other".
- If the listing mentions several identical items (e.g. "2 monitors" or "comes with 2 monitors"), create ONE item describing the quantity — don't invent duplicate entries.
- Ignore filler, greetings, and sales pitch language — only real hardware specs.

FILLING GAPS — this is important. After extracting what's mentioned, check which of these essential categories are missing from the listing: ${ESSENTIAL_CATEGORIES.join(", ")}. For each one that's missing, infer a realistic, budget-appropriate, and fully COMPATIBLE component to complete the build, based on what IS mentioned (especially the CPU and GPU). Never leave the specification incomplete, and never invent something that would be physically or electrically incompatible.

COMPATIBILITY RULES YOU MUST FOLLOW WHEN INFERRING:
- CPU socket determines the motherboard: match the exact platform (e.g. an Intel 12th/13th-gen CPU, "F" suffix or not, needs an LGA1700 board; a Ryzen 5000-series CPU needs AM4; Ryzen 7000-series needs AM5).
- Prefer a sensible BUDGET chipset unless the rest of the build clearly justifies more (LGA1700 → H610/B660/B760 rather than Z790; AM4 → A520/B450/B550 rather than X570 — unless a high-end GPU is present, in which case a mid-tier board is reasonable).
- RAM generation (DDR4 vs DDR5) must match whichever motherboard is mentioned or inferred — never pair DDR5-only RAM with a DDR4-only board or vice versa.
- PSU wattage must suit the CPU + GPU actually present (roughly: budget/mid GPU ~450-550W, RTX 3070/3080-class ~650-750W, higher-end more). Use a reliable budget or mid-range PSU model, not a premium one, unless the GPU demands it.
- Case must support the inferred motherboard's form factor (ATX/mATX/ITX).
- Cooler must physically fit the CPU's socket — a stock cooler is fine for lower-power CPUs; higher-TDP or overclockable CPUs may need a budget aftermarket cooler.
- Storage, if missing, should suit the apparent age/budget of the build (a budget SATA SSD for an older system, NVMe for a newer one) — don't assume premium storage on a budget build.

Respond with ONLY a JSON array. Each item:
{"text": "<the part as named in the listing, or your inferred choice>", "category": "<${CATEGORIES.join("|")}>", "price": <your best GBP price estimate as a number, or null if you genuinely can't estimate>, "inferred": <true if you added this because it wasn't mentioned in the listing at all, false if it was actually stated>}

If nothing is found at all, respond with exactly: []`;

// gemini-2.5-flash-lite has been retired — gemini-3.5-flash-lite is the
// current lightweight production model as of mid-2026.
const MODEL = "gemini-3.5-flash-lite";

export async function POST(req) {
  try {
    const { text } = await req.json();
    if (!text || !text.trim()) {
      return Response.json([]);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY not configured on the server" }, { status: 500 });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text }] }],
          generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      return Response.json(
        { error: `Gemini API error (${res.status}): ${errText.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

    let items;
    try {
      items = JSON.parse(raw);
    } catch {
      console.error("Gemini returned non-JSON text:", raw);
      return Response.json({ error: "Gemini returned unparseable output" }, { status: 502 });
    }

    if (!Array.isArray(items)) items = [];

    const shaped = items
      .filter((it) => it && typeof it.text === "string" && CATEGORIES.includes(it.category))
      .map((it, i) => ({
        id: `ai-item-${i}-${Date.now()}`,
        text: it.text.trim(),
        category: it.category,
        price: typeof it.price === "number" ? it.price : null,
        inferred: Boolean(it.inferred),
      }));

    return Response.json(shaped);
  } catch (err) {
    console.error("parse-listing route error:", err);
    return Response.json({ error: `Unexpected error: ${err.message}` }, { status: 500 });
  }
}