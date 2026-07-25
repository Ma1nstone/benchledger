// app/api/build-advice/route.js
// Given a build's current parts, asks the AI to flag upgrades that would
// meaningfully raise its resale value (old CPU gen, low RAM, HDD instead
// of SSD, weak GPU, missing essentials) — not cosmetic nitpicks.

const SYSTEM_PROMPT = `You are a PC build resale advisor. You'll be given a JSON list of the parts currently in a PC build (category, name, price paid) and the build's total cost.

Identify any parts that are outdated, underpowered, or missing that — if upgraded or added — would meaningfully increase the resale value of the whole PC. Focus on high-impact changes only (e.g. an old CPU generation, RAM under 16GB, a spinning HDD instead of SSD/NVMe, an old or weak GPU, a missing essential category). Don't suggest cosmetic or low-impact changes.

For each suggestion, estimate the rough UK secondhand cost of the upgrade and the rough amount it would add to resale value, so the person can judge if it's worth doing.

Respond with ONLY a JSON object, no markdown fences, no commentary:
{
  "overview": "<1-2 sentence plain-English summary of the build's overall resale position>",
  "suggestions": [
    {
      "category": "<CPU|GPU|RAM|Storage|PSU|Motherboard|Case|Cooler|Monitor>",
      "current": "<what's currently there, or 'None' if missing>",
      "suggestion": "<the specific upgrade recommended>",
      "reason": "<short reason why this helps resale value>",
      "upgrade_cost": <estimated GBP cost of the upgrade as a number, or null>,
      "value_add": <estimated GBP increase in resale value as a number, or null>
    }
  ]
}
If there's genuinely nothing worth changing, return "suggestions": [] and a positive overview.`;

const MODEL = "gemini-3.5-flash-lite";

export async function POST(req) {
  try {
    const { parts, total } = await req.json();
    if (!Array.isArray(parts) || parts.length === 0) {
      return Response.json({ overview: "No parts assigned yet — add some parts first.", suggestions: [] });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY not configured on the server" }, { status: 500 });
    }

    const userContent = JSON.stringify({ parts, total });

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
          contents: [{ role: "user", parts: [{ text: userContent }] }],
          generationConfig: {
            temperature: 0.2,
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
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("Gemini returned non-JSON text:", raw);
      return Response.json({ error: "Gemini returned unparseable output" }, { status: 502 });
    }

    return Response.json({
      overview: typeof parsed.overview === "string" ? parsed.overview : "",
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    });
  } catch (err) {
    console.error("build-advice route error:", err);
    return Response.json({ error: `Unexpected error: ${err.message}` }, { status: 500 });
  }
}