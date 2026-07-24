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

export async function POST(req) {
  try {
    const { text } = await req.json();
    if (!text || !text.trim()) {
      return Response.json([]);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
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
      console.error("Gemini API error:", errText);
      return Response.json({ error: "AI parse failed" }, { status: 502 });
    }

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

    let items;
    try {
      items = JSON.parse(raw);
    } catch {
      items = [];
    }
    if (!Array.isArray(items)) items = [];

    // Map into the same {id, text, category} shape estimateParser.js returns.
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
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}