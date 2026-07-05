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

// A build is only considered "complete" once it has at least one part
// assigned in each of these categories.
export const ESSENTIAL_CATEGORIES = ["CPU", "GPU", "Motherboard", "PSU", "RAM", "SSD", "CASE", "COOLER"];

export const MARKETPLACES = ["eBay", "Facebook Marketplace"];

export const BUNDLE_STATUSES = ["Watching", "Bought"];

export function formatPrice(value) {
  const number = Number(value) || 0;
  return number.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

// Splits a total price evenly across `count` parts, in whole cents, so the
// individual amounts always add back up to exactly the original total
// (e.g. $90 across 3 parts -> [30, 30, 30]; $100 across 3 -> [33.34, 33.33, 33.33]).
export function splitEvenly(total, count) {
  const totalCents = Math.round((Number(total) || 0) * 100);
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, i) => {
    const cents = base + (i < remainder ? 1 : 0);
    return Math.round(cents) / 100;
  });
}
