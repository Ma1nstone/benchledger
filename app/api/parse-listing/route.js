// app/api/parse-listing/route.js
// Uses Gemini + Google Search grounding to both extract PC parts from a
// pasted listing AND look up a realistic current secondhand price for each.

const CATEGORIES = [
  "CPU", "GPU", "RAM", "Storage", "PSU",
  "Motherboard", "Case", "Cooler", "Monitor", "Other",
];

const SYSTEM_PROMPT = `You are a PC hardware listing analyzer with access to Google Search for current pricing.

Read the secondhand PC/parts listing text below and extract every actual hardware component mentioned. Then use Google Search to find a realistic CURRENT UK secondhand/used price (eBay sold listings, Facebook Marketplace — not retail/new price) for each one, and give your best single-number estimate in GBP.

CATEGORY RULES — read carefully, these are commonly confused:
- RAM: memory capacity — normally 4/8/16/32/64GB, described with the words "RAM", "memory", or "DDR3/DDR4/DDR5". A number of GB is ONLY RAM if the text actually calls it RAM/memory/DDR.
- Storage: SSD, HDD, NVMe, "hard drive", "hard disk", or a capacity described as storage/disk space — this includes GB or TB values. Do NOT classify a storage capacity as RAM just because it's a number of GB. If a GB/TB figure has no explicit RAM/memory/DDR wording nearby, assume it is Storage, not RAM.
- GPU: graphics card model (RTX/GTX/RX/Radeon, etc).
- CPU: processor model (Intel Core i3/i5/i7/i9, AMD Ryzen, etc).
- Motherboard, PSU, Case, Cooler, Monitor: as named.
- If a spec doesn't clearly fit any of the above, use "Other".
- If the listing mentions several identical items (e.g. "2 monitors" or "comes with 2 monitors"), create ONE item describing the quantity — don't invent duplicate entries.
- Ignore filler, greetings, and sales pitch language — only real hardware specs.

Respond with ONLY a raw JSON array — no markdown code fences, no commentary, no text before or after it. Each item:
{"text": "<the part as named in the listing>", "category": "<${CATEGORIES.join("|")}>", "price": <your researched GBP price estimate as a number, or null if you genuinely can't find one>}

If nothing is found, respond with exactly: []`;

// gemini-2.5-flash-lite has been retired — gemini-3.5-flash-lite is the
// current lightweight production model as of mid-2026.
const MODEL = "gemini-3.5-flash-lite";

function extractJsonArray(raw) {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  const jsonStr = start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(jsonStr);
}

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
          // Grounds the price lookups in real, current search results
          // instead of the model guessing from training data.
          tools: [{ google_search: {} }],
          generationConfig: {
            temperature: 0,
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
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const raw = parts.map((p) => p.text || "").join("");

    let items;
    try {
      items = extractJsonArray(raw);
    } catch {
      console.error("Gemini returned unparseable output:", raw);
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
      }));

    return Response.json(shaped);
  } catch (err) {
    console.error("parse-listing route error:", err);
    return Response.json({ error: `Unexpected error: ${err.message}` }, { status: 500 });
  }
}