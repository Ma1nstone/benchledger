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
export const ESSENTIAL_CATEGORIES = ["CPU", "GPU", "Motherboard", "PSU", "RAM", "Case", "Cooler"];

export const MARKETPLACES = ["eBay", "Facebook Marketplace"];

export function formatPrice(value) {
  const number = Number(value) || 0;
  return number.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}
