// --- Explicit "Label: value" extraction -------------------------------
// Catches itemized listings like "CPU: AMD Ryzen 7 2700X" directly and
// takes priority over the fuzzy prose scanners below.

const LABEL_MAP = {
  cpu: "CPU",
  processor: "CPU",
  gpu: "GPU",
  graphics: "GPU",
  "graphics card": "GPU",
  ram: "RAM",
  memory: "RAM",
  storage: "Storage",
  ssd: "Storage",
  hdd: "Storage",
  psu: "PSU",
  "power supply": "PSU",
  motherboard: "Motherboard",
  mobo: "Motherboard",
  case: "Case",
  chassis: "Case",
  cooler: "Cooler",
  cooling: "Cooler",
  monitor: "Monitor",
  display: "Monitor",
};

const LABEL_KEYS = Object.keys(LABEL_MAP).sort((a, b) => b.length - a.length);
const LABEL_REGEX_SOURCE = `\\b(${LABEL_KEYS.join("|")})\\s*:\\s*([^\\n]{2,100})`;

function extractLabeled(text) {
  const items = [];
  const re = new RegExp(LABEL_REGEX_SOURCE, "gi");
  let m;
  while ((m = re.exec(text))) {
    const label = m[1].toLowerCase();
    const category = LABEL_MAP[label] || "Other";
    const value = m[2].split(/[,.](?=\s|$)/)[0].trim();
    items.push({
      text: `${m[1]}: ${value}`,
      category,
      start: m.index,
      end: m.index + m[1].length + 1 + m[2].length,
    });
  }
  return items;
}

// --- Prose scanners -----------------------------------------------------
// Each scans the WHOLE text for a specific pattern anywhere it appears,
// pulling out just the matched phrase rather than the surrounding sentence.

const GPU_REGEX =
  /\b(?:nvidia\s+)?(?:geforce\s+)?(?:amd\s+)?(?:radeon\s+)?(?:rtx|gtx|rx)\s?-?\d{3,4}\s?(?:ti|super|xt)?\b/gi;

const CPU_INTEL_REGEX = /\b(?:intel\s+)?(?:core\s+)?i[3579]\s?-?\s?\d{3,5}[a-z]{0,3}\b/gi;
const CPU_RYZEN_REGEX = /\b(?:amd\s+)?ryzen\s+[3579]\s?\d{3,4}[a-z0-9]*\b/gi;

const MOBO_REGEX =
  /\b(b450|b550|b650|x470|x570|x670|h410|h510|h610|a520|b660|b760|z390|z490|z590|z690|z790)\b/gi;

const CASE_REGEX = /\b(mid[- ]tower|full[- ]tower|mini[- ]tower|pc case|computer case|atx case)\b/gi;

const COOLER_REGEX =
  /\b(stock cooler|air cooler|aio cooler|liquid cooler|liquid cooling|cpu cooler|\baio\b)\b/gi;

const MONITOR_REGEX = /\b(\d{2}\s?[- ]?inch\s?(?:monitor|display|screen)|monitor|display screen)\b/gi;

function isInsideLabeled(index, labeledSpans) {
  return labeledSpans.some(([s, e]) => index >= s && index < e);
}

function extractByRegex(text, regex, category, labeledSpans) {
  const items = [];
  const re = new RegExp(regex.source, regex.flags);
  let m;
  while ((m = re.exec(text))) {
    if (isInsideLabeled(m.index, labeledSpans)) continue;
    items.push({ text: m[0].trim(), category, start: m.index, end: m.index + m[0].length });
  }
  return items;
}

// GB/TB numbers are ambiguous on their own — decide RAM vs Storage from
// nearby words, since "16GB RAM" and "1TB Hard Drive" both just look like
// "number + unit" without context.
function extractNumUnit(text, labeledSpans) {
  const items = [];
  const regex = /(\d{1,4}(?:\.\d)?)\s?(gb|tb)\b/gi;
  let m;
  while ((m = regex.exec(text))) {
    if (isInsideLabeled(m.index, labeledSpans)) continue;
    const unit = m[2].toLowerCase();
    const start = Math.max(0, m.index - 25);
    const end = Math.min(text.length, m.index + m[0].length + 25);
    const window = text.slice(start, end).toLowerCase();

    let category;
    if (unit === "tb") category = "Storage";
    else if (/\b(ram|memory|ddr[3-5])\b/.test(window)) category = "RAM";
    else if (/\b(ssd|hdd|nvme|m\.2|hard drive|storage)\b/.test(window)) category = "Storage";
    else category = "Other";

    items.push({ text: m[0], category, start: m.index, end: m.index + m[0].length });
  }
  return items;
}

// Wattage numbers only count as a PSU if "PSU"/"power supply"/an efficiency
// rating shows up nearby — otherwise a "144Hz" or similar could false-match.
function extractPSU(text, labeledSpans) {
  const items = [];
  const regex = /(\d{3,4})\s?w(?:att)?\b/gi;
  let m;
  while ((m = regex.exec(text))) {
    if (isInsideLabeled(m.index, labeledSpans)) continue;
    const start = Math.max(0, m.index - 20);
    const end = Math.min(text.length, m.index + m[0].length + 20);
    const window = text.slice(start, end).toLowerCase();
    if (/\b(psu|power supply|bronze|gold|platinum|titanium)\b/.test(window)) {
      items.push({ text: m[0], category: "PSU", start: m.index, end: m.index + m[0].length });
    }
  }
  return items;
}

// Scans the full text (not line by line) and pulls out every recognisable
// part mention, wherever it appears in a sentence — this is what makes it
// work on real prose listings instead of only itemized spec sheets.
export function parseListingText(text) {
  if (!text) return [];

  const labeled = extractLabeled(text);
  const labeledSpans = labeled.map((l) => [l.start, l.end]);

  const found = [
    ...labeled,
    ...extractByRegex(text, GPU_REGEX, "GPU", labeledSpans),
    ...extractByRegex(text, CPU_INTEL_REGEX, "CPU", labeledSpans),
    ...extractByRegex(text, CPU_RYZEN_REGEX, "CPU", labeledSpans),
    ...extractByRegex(text, MOBO_REGEX, "Motherboard", labeledSpans),
    ...extractByRegex(text, CASE_REGEX, "Case", labeledSpans),
    ...extractByRegex(text, COOLER_REGEX, "Cooler", labeledSpans),
    ...extractByRegex(text, MONITOR_REGEX, "Monitor", labeledSpans),
    ...extractNumUnit(text, labeledSpans),
    ...extractPSU(text, labeledSpans),
  ];

  found.sort((a, b) => a.start - b.start);

  const seen = new Set();
  const deduped = [];
  for (const item of found) {
    const key = `${item.category}:${item.text.toLowerCase().replace(/\s+/g, " ").trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped.map((item, i) => ({
    id: `item-${i}-${Date.now()}`,
    text: item.text.replace(/\s+/g, " ").trim(),
    category: item.category,
  }));
}

// Capitalizes the first letter of every word without touching the rest,
// so acronyms like "NVIDIA" or "DDR4" survive untouched.
export function titleCase(str) {
  if (!str) return str;
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}