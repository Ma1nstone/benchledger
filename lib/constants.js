export const CATEGORIES = [
  "CPU",
  "GPU",
  "Motherboard",
  "RAM",
  "Storage",
  "PSU",
  "Case",
  "Cooler",
  "Monitor",
  "Peripheral",
  "Other",
];

export const ESSENTIAL_CATEGORIES = [
  "CPU",
  "GPU",
  "Motherboard",
  "PSU",
  "RAM",
  "Case",
  "Cooler",
  "Storage",
];

export const MARKETPLACES = [
  "eBay",
  "Facebook Marketplace",
];

export const BUNDLE_STATUSES = [
  "Watching",
  "Purchased",
  "Listed",
  "Sold",
];

export const PRICE_TYPES = ["Bought", "Offer"];

// Used only by the Costs system (purchase groups) — completely separate
// from anything in the Estimate system. Each new group gets the next
// unused colour from this list so groups stay visually distinct; parts
// that aren't in any group keep the app's normal default styling.
export const GROUP_COLORS = [
  "#3EF0B0", // trace green
  "#F2A93B", // amber
  "#5B8DEF", // blue
  "#E85D9E", // pink
  "#9B6BF2", // violet
  "#F0523E", // red
  "#2FD4C8", // teal
  "#D4C43E", // yellow
];

export function nextGroupColor(usedColors = []) {
  const used = new Set(usedColors);
  const free = GROUP_COLORS.find((c) => !used.has(c));
  return free || GROUP_COLORS[usedColors.length % GROUP_COLORS.length];
}

export function formatPrice(value) {
  const number = Number(value) || 0;
  return number.toLocaleString(undefined, {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  });
}

export function splitEvenly(total, count) {
  const totalCents = Math.round((Number(total) || 0) * 100);
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, i) => {
    const cents = base + (i < remainder ? 1 : 0);
    return Math.round(cents) / 100;
  });
}