// app/api/fetch-listing/route.js
// Best-effort auto-fill from a pasted listing URL (Facebook Marketplace,
// eBay, etc) using the page's public Open Graph meta tags — the same data
// used for link preview cards. This is free and needs no API key, but it
// is NOT reliable for Facebook specifically: Marketplace listings usually
// require being logged into Facebook to view, so a server-side fetch like
// this often gets Facebook's generic login-wall page instead of the real
// listing. Seller name/location are never available this way — Facebook
// doesn't expose those in public metadata at all.

function extractMeta(html, property) {
  const re = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, "i");
  const match = html.match(re);
  return match ? match[1] : null;
}

export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url || !url.trim()) {
      return Response.json({ error: "No URL provided" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      return Response.json({ error: `Couldn't fetch that page (status ${res.status})` }, { status: 502 });
    }

    const html = await res.text();
    const title = extractMeta(html, "og:title");
    const description = extractMeta(html, "og:description");

    // Facebook/marketplace titles often lead with the price, e.g. "£250 · Gaming PC".
    let price = null;
    const priceMatch = (title || "").match(/[£$]\s?(\d{1,4}(?:[.,]\d{2})?)/);
    if (priceMatch) price = Number(priceMatch[1].replace(",", ""));

    if (!title && !description) {
      return Response.json(
        {
          error:
            "Couldn't read any details from that link — this is common with Facebook Marketplace, which usually requires being logged in to view a listing.",
        },
        { status: 502 }
      );
    }

    return Response.json({ title, description, price });
  } catch (err) {
    return Response.json({ error: `Unexpected error: ${err.message}` }, { status: 500 });
  }
}