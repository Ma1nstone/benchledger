// Rough built-in UK secondhand price bands (£), baked into the app so it
// works with zero API calls and zero cost. These are ballpark estimates,
// not live market data — treat them as a starting point, not gospel.

const GPU_PRICES = [
  { pattern: /rtx\s?4090/i, range: [1300, 1700] },
  { pattern: /rtx\s?4080/i, range: [800, 1000] },
  { pattern: /rtx\s?4070\s?ti/i, range: [550, 650] },
  { pattern: /rtx\s?4070/i, range: [400, 500] },
  { pattern: /rtx\s?4060\s?ti/i, range: [300, 370] },
  { pattern: /rtx\s?4060/i, range: [230, 280] },
  { pattern: /rtx\s?3090\s?ti/i, range: [650, 800] },
  { pattern: /rtx\s?3090/i, range: [550, 700] },
  { pattern: /rtx\s?3080\s?ti/i, range: [450, 550] },
  { pattern: /rtx\s?3080/i, range: [350, 450] },
  { pattern: /rtx\s?3070\s?ti/i, range: [300, 370] },
  { pattern: /rtx\s?3070/i, range: [230, 290] },
  { pattern: /rtx\s?3060\s?ti/i, range: [190, 240] },
  { pattern: /rtx\s?3060/i, range: [160, 210] },
  { pattern: /rtx\s?3050/i, range: [120, 160] },
  { pattern: /gtx\s?1660\s?ti/i, range: [110, 150] },
  { pattern: /gtx\s?1660\s?super/i, range: [100, 140] },
  { pattern: /gtx\s?1660/i, range: [90, 120] },
  { pattern: /gtx\s?1650/i, range: [60, 90] },
  { pattern: /gtx\s?1080\s?ti/i, range: [140, 190] },
  { pattern: /gtx\s?1080/i, range: [100, 140] },
  { pattern: /gtx\s?1070\s?ti/i, range: [90, 120] },
  { pattern: /gtx\s?1070/i, range: [80, 110] },
  { pattern: /gtx\s?1060/i, range: [50, 80] },
  { pattern: /gtx\s?1050\s?ti/i, range: [35, 55] },
  { pattern: /rx\s?7900\s?xtx/i, range: [750, 900] },
  { pattern: /rx\s?7900\s?xt/i, range: [600, 750] },
  { pattern: /rx\s?7800\s?xt/i, range: [420, 500] },
  { pattern: /rx\s?7700\s?xt/i, range: [330, 400] },
  { pattern: /rx\s?7600/i, range: [200, 250] },
  { pattern: /rx\s?6950\s?xt/i, range: [400, 500] },
  { pattern: /rx\s?6900\s?xt/i, range: [350, 450] },
  { pattern: /rx\s?6800\s?xt/i, range: [300, 380] },
  { pattern: /rx\s?6800/i, range: [260, 330] },
  { pattern: /rx\s?6750\s?xt/i, range: [220, 270] },
  { pattern: /rx\s?6700\s?xt/i, range: [200, 250] },
  { pattern: /rx\s?6650\s?xt/i, range: [150, 190] },
  { pattern: /rx\s?6600\s?xt/i, range: [140, 180] },
  { pattern: /rx\s?6600/i, range: [120, 160] },
  { pattern: /rx\s?6500\s?xt/i, range: [80, 110] },
  { pattern: /rx\s?580/i, range: [40, 70] },
  { pattern: /rx\s?570/i, range: [35, 60] },
];

const CPU_PRICES = [
  { pattern: /ryzen\s?9\s?7950x3d/i, range: [450, 550] },
  { pattern: /ryzen\s?9\s?7950x/i, range: [380, 460] },
  { pattern: /ryzen\s?9\s?7900x3d/i, range: [350, 420] },
  { pattern: /ryzen\s?9\s?7900x/i, range: [300, 370] },
  { pattern: /ryzen\s?7\s?7800x3d/i, range: [320, 390] },
  { pattern: /ryzen\s?7\s?7700x/i, range: [220, 280] },
  { pattern: /ryzen\s?5\s?7600x/i, range: [160, 210] },
  { pattern: /ryzen\s?9\s?5950x/i, range: [220, 280] },
  { pattern: /ryzen\s?9\s?5900x/i, range: [170, 220] },
  { pattern: /ryzen\s?7\s?5800x3d/i, range: [200, 260] },
  { pattern: /ryzen\s?7\s?5800x/i, range: [120, 160] },
  { pattern: /ryzen\s?7\s?5700x/i, range: [110, 150] },
  { pattern: /ryzen\s?5\s?5600x/i, range: [80, 110] },
  { pattern: /ryzen\s?5\s?5600/i, range: [70, 100] },
  { pattern: /ryzen\s?7\s?3700x/i, range: [80, 110] },
  { pattern: /ryzen\s?7\s?3800x/i, range: [90, 120] },
  { pattern: /ryzen\s?5\s?3600x/i, range: [60, 85] },
  { pattern: /ryzen\s?5\s?3600/i, range: [55, 75] },
  { pattern: /ryzen\s?7\s?2700x/i, range: [45, 65] },
  { pattern: /ryzen\s?7\s?2700/i, range: [40, 60] },
  { pattern: /ryzen\s?5\s?2600x/i, range: [35, 50] },
  { pattern: /ryzen\s?5\s?2600/i, range: [30, 45] },
  { pattern: /i9-?14900k/i, range: [400, 480] },
  { pattern: /i9-?13900k/i, range: [350, 430] },
  { pattern: /i7-?14700k/i, range: [280, 340] },
  { pattern: /i7-?13700k/i, range: [250, 310] },
  { pattern: /i5-?14600k/i, range: [200, 250] },
  { pattern: /i5-?13600k/i, range: [180, 230] },
  { pattern: /i9-?12900k/i, range: [220, 280] },
  { pattern: /i7-?12700k/i, range: [180, 230] },
  { pattern: /i5-?12600k/i, range: [140, 180] },
  { pattern: /i9-?11900k/i, range: [140, 180] },
  { pattern: /i7-?11700k/i, range: [120, 160] },
  { pattern: /i5-?11600k/i, range: [90, 120] },
  { pattern: /i9-?10900k/i, range: [130, 170] },
  { pattern: /i7-?10700k/i, range: [110, 150] },
  { pattern: /i5-?10600k/i, range: [80, 110] },
  { pattern: /i7-?9700k/i, range: [90, 120] },
  { pattern: /i5-?9600k/i, range: [60, 85] },
  { pattern: /i7-?8700k/i, range: [70, 100] },
  { pattern: /i5-?8600k/i, range: [50, 75] },
];

const RAM_PRICE_PER_GB = { ddr5: 2.2, ddr4: 1.4, ddr3: 0.6, default: 1.2 };
const STORAGE_PRICE_PER_GB = { nvme: 0.06, ssd: 0.05, hdd: 0.015, default: 0.04 };
const PSU_PRICE_PER_WATT = 0.12;

// Returns a rough [low, high] £ price band for a detected line, or null if
// nothing matched (in which case the user just types a price manually).
export function estimateRange(text, category) {
  const t = (text || "").toLowerCase();

  if (category === "GPU") {
    const match = GPU_PRICES.find((g) => g.pattern.test(t));
    if (match) return match.range;
  }

  if (category === "CPU") {
    const match = CPU_PRICES.find((c) => c.pattern.test(t));
    if (match) return match.range;
  }

  if (category === "RAM") {
    const gbMatch = t.match(/(\d{1,3})\s?gb/);
    if (gbMatch) {
      const gb = Number(gbMatch[1]);
      const type = /ddr5/.test(t) ? "ddr5" : /ddr4/.test(t) ? "ddr4" : /ddr3/.test(t) ? "ddr3" : "default";
      const base = gb * RAM_PRICE_PER_GB[type];
      return [Math.round(base * 0.8), Math.round(base * 1.2)];
    }
  }

  if (category === "Storage") {
    const tbMatch = t.match(/(\d{1,2}(?:\.\d)?)\s?tb/);
    const gbMatch = t.match(/(\d{2,4})\s?gb/);
    let gb = null;
    if (tbMatch) gb = Number(tbMatch[1]) * 1000;
    else if (gbMatch) gb = Number(gbMatch[1]);
    if (gb) {
      const type = /nvme|m\.2/.test(t) ? "nvme" : /ssd/.test(t) ? "ssd" : /hdd/.test(t) ? "hdd" : "default";
      const base = gb * STORAGE_PRICE_PER_GB[type];
      return [Math.round(base * 0.75), Math.round(base * 1.25)];
    }
  }

  if (category === "PSU") {
    const wMatch = t.match(/(\d{3,4})\s?w/);
    if (wMatch) {
      const watts = Number(wMatch[1]);
      const base = watts * PSU_PRICE_PER_WATT;
      return [Math.round(base * 0.8), Math.round(base * 1.3)];
    }
  }

  return null;
}