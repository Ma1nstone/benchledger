const CATEGORY_PATTERNS = [
  { category: "GPU", pattern: /\b(rtx|gtx|radeon|rx)\s?-?\d{3,4}\s?(ti|super|xt)?\b/i },
  { category: "CPU", pattern: /\b(ryzen|core\s?i[3579]|i[3579]-\d{3,5}|threadripper|xeon)\b/i },
  { category: "Motherboard", pattern: /\b(motherboard|mobo|b550|b650|x570|x670|z690|z790|h610|a520|itx board|atx board)\b/i },
  { category: "RAM", pattern: /\b\d{1,3}\s?gb\s?(ddr[3-5])?\s?(ram|memory)?\b/i },
  { category: "Storage", pattern: /\b\d{2,4}\s?(gb|tb)\b|\b(ssd|hdd|nvme|m\.2)\b/i },
  { category: "PSU", pattern: /\b\d{3,4}\s?w(att)?\b|\bpsu\b|\bpower supply\b/i },
  { category: "Case", pattern: /\b(case|tower|chassis)\b/i },
  { category: "Cooler", pattern: /\b(cooler|aio|liquid cool|air cooler)\b/i },
  { category: "Monitor", pattern: /\b(monitor|display|\d{2}\s?inch)\b/i },
];

// A line only counts as a spec line if it actually contains part-like
// signal (a number+unit, a colon-separated label, or a known part keyword).
// This filters out marketing fluff like "Hi", "I am selling my old pc!".
const SPEC_SIGNAL = new RegExp(
  [
    "\\d+\\s?(gb|tb|w(att)?|ghz|mhz|core|thread)",
    ":",
    "\\brtx\\b",
    "\\bgtx\\b",
    "\\brx\\b",
    "\\bryzen\\b",
    "\\bcore\\s?i[3579]\\b",
    "\\bssd\\b",
    "\\bnvme\\b",
    "\\bhdd\\b",
    "\\bpsu\\b",
    "\\bmotherboard\\b",
    "\\bmobo\\b",
  ].join("|"),
  "i"
);

// Splits pasted text into fragments and guesses a category for each one.
// Splits ONLY on newlines/bullets (not commas) so a spec like
// "8 cores, 16 threads @ 3.7GHz" stays on one line, then drops any line
// that doesn't look like a spec at all.
export function parseListingText(text) {
  if (!text) return [];
  const rawFragments = text
    .split(/\r?\n|\u2022/)
    .map((f) => f.trim())
    .filter((f) => f.length > 1);

  const fragments = rawFragments.filter((f) => SPEC_SIGNAL.test(f));

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

// Capitalizes the first letter of every word without touching the rest,
// so acronyms like "NVIDIA" or "DDR4" survive untouched.
export function titleCase(str) {
  if (!str) return str;
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}