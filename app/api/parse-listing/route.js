// app/api/parse-listing/route.js
// Calls Gemini's free tier to extract PC parts from pasted listing text.
// Returns the SAME shape as lib/estimateParser.js's parseListingText(),
// so EstimatePanel.js can call either one interchangeably.

const CATEGORIES = [
  "CPU", "GPU", "RAM", "Storage", "PSU",
  "Motherboard", "Case", "Cooler", "Monitor", "Other",
];

const SYSTEM_PROMPT = `You extract PC hardware parts mentioned in a secondhand listing.
Return ONLY a JSON array, no markdown fences, no prose. Each item:
{"text": "<the part as named in the listing>", "category": "<one of: ${CATEGORIES.join(", ")}>"}
Rules:
- Only include actual parts (CPU, GPU, RAM, storage, PSU, motherboard, case, cooler, monitor).
- Ignore filler, greetings, and sales pitch language.
- If a part doesn't fit any category, use "Other".
- If nothing is found, return [].`;

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
      }));

    return Response.json(shaped);
  } catch (err) {
    console.error("parse-listing route error:", err);
    return Response.json({ error: `Unexpected error: ${err.message}` }, { status: 500 });
  }
}