const CATEGORY_PATTERNS = [
  { category: "GPU", pattern: /\b(rtx|gtx|radeon|rx)\s?-?\d{3,4}\s?(ti|super|xt)?\b/i },
  { category: "CPU", pattern: /\b(ryzen|core\s?i[3579]|i[3579]-\d{3,5}|threadripper|xeon)\b/i },
  { category: "Motherboard", pattern: /\b(motherboard|mobo|b550|b650|x570|x670|z690|z790|h610|a520|itx|atx board)\b/i },
  { category: "RAM", pattern: /\b\d{1,3}\s?gb\s?(ddr[3-5])?\s?(ram|memory)?\b/i },
  { category: "Storage", pattern: /\b\d{2,4}\s?(gb|tb)\b|\b(ssd|hdd|nvme|m\.2)\b/i },
  { category: "PSU", pattern: /\b\d{3,4}\s?w(att)?\b|\bpsu\b|\bpower supply\b/i },
  { category: "Case", pattern: /\b(case|tower|chassis)\b/i },
  { category: "Cooler", pattern: /\b(cooler|aio|liquid cool|air cooler)\b/i },
  { category: "Monitor", pattern: /\b(monitor|display|\d{2}\s?inch)\b/i },
];

// Splits pasted text into fragments and guesses a category for each one
// using keyword/regex matching. No AI, no API key, no cost.
export function parseListingText(text) {
  if (!text) return [];
  const fragments = text
    .split(/\r?\n|,|;|\u2022|-{2,}/)
    .map((f) => f.trim())
    .filter((f) => f.length > 1);

  return fragments.map((fragment, i) => {
    let category = "Other";
    for (const { category: cat, pattern } of CATEGORY_PATTERNS) {
      if (pattern.test(fragment)) {
        category = cat;
        break;
      }
    }
    return {
      id: `item-${i}-${Date.now()}`,
      text: fragment,
      category,
    };
  });
}

// Builds a link to eBay UK "sold & completed" listings for a search term —
// the most reliable free source of real market prices.
export function ebaySoldLink(query) {
  const q = encodeURIComponent(query);
  return `https://www.ebay.co.uk/sch/i.html?_nkw=${q}&LH_Sold=1&LH_Complete=1`;
}