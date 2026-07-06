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