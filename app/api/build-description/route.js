// app/api/build-description/route.js
// Generates a marketplace listing description for a build, in a specific
// house style: catchy title line, highlight bullets, intro paragraph, a
// "Full Specifications" section built from the ACTUAL parts, a
// "Performance" section with realistic (not exaggerated) game examples for
// the tier of hardware, a checkmark summary line, and a closing CTA.

const SYSTEM_PROMPT = `You write secondhand PC marketplace listing descriptions in a specific house style.

You will be given a JSON list of the actual parts in this build (category, name) and the build's name. Write a listing description using ONLY those parts — never invent a component, feature, or spec that isn't in the list. If something the style normally mentions isn't present (e.g. no separate wireless adapter, no stated OS), simply leave that line out rather than making it up.

STYLE TO FOLLOW (structure only — don't copy this example's specific hardware, just its shape and tone):

<title line combining the standout parts, e.g. "CPU model Gaming PC — GPU model — storage total">
<2-4 short bullet highlights separated by " • ", e.g. resolution target, storage speed, OS status — only include what's actually true for these parts>

<one short paragraph: what the PC is good for, that it's tested/working, ready to use>

Full Specifications
Processor <CPU name, with core/thread count and clock speed if you can reasonably state it from the model>
Graphics <GPU name>
Memory <RAM size/type if known>
Storage <storage device(s), combined total if more than one>
Motherboard <motherboard name, only if present>
Power Supply <PSU name/wattage, only if present>
Case <case name, only if present>
Wireless <only if a wireless/WiFi part is present>
Operating System <only if there's a clear OS part or note>

Performance
<1-2 sentences on what tier of gaming/use this realistically handles, calibrated honestly to the actual GPU/CPU — don't claim 1440p or high framerates for budget/older hardware, and don't undersell newer/higher-end hardware. List 4-6 example popular game titles that fit this tier.>

<a single line of 3-4 short checkmark-style highlights separated by " | ", e.g. "✅ Fully tested and working | ✅ Fast storage | ✅ Ready to use">

Open to sensible offers — please feel free to message with any questions before buying.

Respond with ONLY the description text — no JSON, no markdown code fences, no commentary before or after it.`;

const MODEL = "gemini-3.5-flash-lite";

export async function POST(req) {
  try {
    const { parts, buildName } = await req.json();
    if (!Array.isArray(parts) || parts.length === 0) {
      return Response.json({ error: "No parts to describe" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY not configured on the server" }, { status: 500 });
    }

    const userContent = JSON.stringify({
      buildName: buildName || "PC",
      parts: parts.map((p) => ({ category: p.category, name: p.name })),
    });

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
          generationConfig: { temperature: 0.4 },
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
    const description = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!description) {
      return Response.json({ error: "Gemini returned an empty description" }, { status: 502 });
    }

    return Response.json({ description });
  } catch (err) {
    console.error("build-description route error:", err);
    return Response.json({ error: `Unexpected error: ${err.message}` }, { status: 500 });
  }
}