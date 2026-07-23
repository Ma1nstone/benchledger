// Rough built-in UK secondhand price bands (£), baked into the app so it
// works with zero API calls and zero cost. These are ballpark estimates,
// not live market data — treat them as a starting point, not gospel.

const GPU_PRICES = [
  // NVIDIA RTX 50 Series
  { pattern: /(?:rtx|geforce)?\s?5090/i, range: [1600, 2000] },
  { pattern: /(?:rtx|geforce)?\s?5080/i, range: [950, 1200] },
  { pattern: /(?:rtx|geforce)?\s?5070\s?ti/i, range: [700, 850] },
  { pattern: /(?:rtx|geforce)?\s?5070/i, range: [550, 680] },
  { pattern: /(?:rtx|geforce)?\s?5060\s?ti/i, range: [380, 480] },
  { pattern: /(?:rtx|geforce)?\s?5060/i, range: [280, 350] },

  // NVIDIA RTX 40 Series
  { pattern: /(?:rtx|geforce)?\s?4090/i, range: [1300, 1700] },
  { pattern: /(?:rtx|geforce)?\s?4080\s?super/i, range: [850, 1050] },
  { pattern: /(?:rtx|geforce)?\s?4080/i, range: [800, 1000] },
  { pattern: /(?:rtx|geforce)?\s?4070\s?ti\s?super/i, range: [650, 780] },
  { pattern: /(?:rtx|geforce)?\s?4070\s?ti/i, range: [550, 650] },
  { pattern: /(?:rtx|geforce)?\s?4070\s?super/i, range: [470, 560] },
  { pattern: /(?:rtx|geforce)?\s?4070/i, range: [400, 500] },
  { pattern: /(?:rtx|geforce)?\s?4060\s?ti\s?16\s?gb/i, range: [340, 420] },
  { pattern: /(?:rtx|geforce)?\s?4060\s?ti/i, range: [300, 370] },
  { pattern: /(?:rtx|geforce)?\s?4060/i, range: [230, 280] },

  // NVIDIA RTX 30 Series
  { pattern: /(?:rtx|geforce)?\s?3090\s?ti/i, range: [650, 800] },
  { pattern: /(?:rtx|geforce)?\s?3090/i, range: [550, 700] },
  { pattern: /(?:rtx|geforce)?\s?3080\s?ti/i, range: [450, 550] },
  { pattern: /(?:rtx|geforce)?\s?3080\s?12\s?gb/i, range: [380, 480] },
  { pattern: /(?:rtx|geforce)?\s?3080/i, range: [350, 450] },
  { pattern: /(?:rtx|geforce)?\s?3070\s?ti/i, range: [300, 370] },
  { pattern: /(?:rtx|geforce)?\s?3070/i, range: [230, 290] },
  { pattern: /(?:rtx|geforce)?\s?3060\s?ti/i, range: [190, 240] },
  { pattern: /(?:rtx|geforce)?\s?3060\s?12\s?gb/i, range: [170, 220] },
  { pattern: /(?:rtx|geforce)?\s?3060/i, range: [160, 210] },
  { pattern: /(?:rtx|geforce)?\s?3050\s?8\s?gb/i, range: [120, 160] },
  { pattern: /(?:rtx|geforce)?\s?3050\s?6\s?gb/i, range: [100, 130] },
  { pattern: /(?:rtx|geforce)?\s?3050/i, range: [120, 160] },

  // NVIDIA RTX 20 Series
  { pattern: /(?:rtx|geforce)?\s?2080\s?ti/i, range: [240, 310] },
  { pattern: /(?:rtx|geforce)?\s?2080\s?super/i, range: [190, 240] },
  { pattern: /(?:rtx|geforce)?\s?2080/i, range: [170, 210] },
  { pattern: /(?:rtx|geforce)?\s?2070\s?super/i, range: [160, 200] },
  { pattern: /(?:rtx|geforce)?\s?2070/i, range: [140, 180] },
  { pattern: /(?:rtx|geforce)?\s?2060\s?super/i, range: [130, 160] },
  { pattern: /(?:rtx|geforce)?\s?2060/i, range: [110, 140] },

  // NVIDIA GTX 16 Series
  { pattern: /(?:gtx|geforce)?\s?1660\s?ti/i, range: [110, 150] },
  { pattern: /(?:gtx|geforce)?\s?1660\s?super/i, range: [100, 140] },
  { pattern: /(?:gtx|geforce)?\s?1660/i, range: [90, 120] },
  { pattern: /(?:gtx|geforce)?\s?1650\s?super/i, range: [70, 100] },
  { pattern: /(?:gtx|geforce)?\s?1650/i, range: [60, 90] },

  // NVIDIA GTX 10 Series
  { pattern: /(?:gtx|geforce)?\s?1080\s?ti/i, range: [140, 190] },
  { pattern: /(?:gtx|geforce)?\s?1080/i, range: [100, 140] },
  { pattern: /(?:gtx|geforce)?\s?1070\s?ti/i, range: [90, 120] },
  { pattern: /(?:gtx|geforce)?\s?1070/i, range: [80, 110] },
  { pattern: /(?:gtx|geforce)?\s?1060\s?6\s?gb/i, range: [55, 85] },
  { pattern: /(?:gtx|geforce)?\s?1060\s?3\s?gb/i, range: [40, 65] },
  { pattern: /(?:gtx|geforce)?\s?1060/i, range: [50, 80] },
  { pattern: /(?:gtx|geforce)?\s?1050\s?ti/i, range: [35, 55] },
  { pattern: /(?:gtx|geforce)?\s?1050/i, range: [25, 45] },
  { pattern: /(?:gtx|gt)?\s?1030/i, range: [20, 35] },

  // NVIDIA GTX 900 / 700 Series
  { pattern: /(?:gtx)?\s?980\s?ti/i, range: [70, 100] },
  { pattern: /(?:gtx)?\s?980/i, range: [50, 80] },
  { pattern: /(?:gtx)?\s?970/i, range: [35, 60] },
  { pattern: /(?:gtx)?\s?960/i, range: [25, 45] },
  { pattern: /(?:gtx)?\s?950/i, range: [20, 35] },
  { pattern: /(?:gtx)?\s?780\s?ti/i, range: [40, 65] },
  { pattern: /(?:gtx)?\s?780/i, range: [30, 50] },
  { pattern: /(?:gtx)?\s?770/i, range: [25, 40] },
  { pattern: /(?:gtx)?\s?760/i, range: [20, 35] },
  { pattern: /(?:gtx)?\s?750\s?ti/i, range: [20, 35] },
  { pattern: /(?:gtx)?\s?750/i, range: [15, 25] },

  // NVIDIA Titan & Quadro
  { pattern: /titan\s?rtx/i, range: [450, 650] },
  { pattern: /titan\s?v/i, range: [350, 500] },
  { pattern: /titan\s?xp/i, range: [160, 230] },
  { pattern: /titan\s?x\s?pascal/i, range: [130, 180] },
  { pattern: /titan\s?x\s?maxwell/i, range: [90, 130] },
  { pattern: /rtx\s?a6000/i, range: [1800, 2400] },
  { pattern: /rtx\s?a5000/i, range: [1000, 1400] },
  { pattern: /rtx\s?a4000/i, range: [450, 600] },
  { pattern: /rtx\s?a2000/i, range: [200, 280] },
  { pattern: /p6000/i, range: [250, 350] },
  { pattern: /p5000/i, range: [150, 220] },
  { pattern: /p4000/i, range: [100, 150] },
  { pattern: /k4200/i, range: [30, 50] },
  { pattern: /k2200/i, range: [20, 35] },

  // AMD RX 9000 & RX 7000 Series
  { pattern: /(?:rx|radeon)?\s?9070\s?xt/i, range: [650, 800] },
  { pattern: /(?:rx|radeon)?\s?9070/i, range: [520, 650] },
  { pattern: /(?:rx|radeon)?\s?9060\s?xt/i, range: [380, 480] },
  { pattern: /(?:rx|radeon)?\s?9060/i, range: [280, 360] },
  { pattern: /(?:rx|radeon)?\s?7900\s?xtx/i, range: [750, 900] },
  { pattern: /(?:rx|radeon)?\s?7900\s?xt/i, range: [600, 750] },
  { pattern: /(?:rx|radeon)?\s?7900\s?gre/i, range: [480, 560] },
  { pattern: /(?:rx|radeon)?\s?7800\s?xt/i, range: [420, 500] },
  { pattern: /(?:rx|radeon)?\s?7700\s?xt/i, range: [330, 400] },
  { pattern: /(?:rx|radeon)?\s?7600\s?xt/i, range: [240, 290] },
  { pattern: /(?:rx|radeon)?\s?7600/i, range: [200, 250] },

  // AMD RX 6000 Series
  { pattern: /(?:rx|radeon)?\s?6950\s?xt/i, range: [400, 500] },
  { pattern: /(?:rx|radeon)?\s?6900\s?xt/i, range: [350, 450] },
  { pattern: /(?:rx|radeon)?\s?6800\s?xt/i, range: [300, 380] },
  { pattern: /(?:rx|radeon)?\s?6800/i, range: [260, 330] },
  { pattern: /(?:rx|radeon)?\s?6750\s?xt/i, range: [220, 270] },
  { pattern: /(?:rx|radeon)?\s?6700\s?xt/i, range: [200, 250] },
  { pattern: /(?:rx|radeon)?\s?6700/i, range: [180, 220] },
  { pattern: /(?:rx|radeon)?\s?6650\s?xt/i, range: [150, 190] },
  { pattern: /(?:rx|radeon)?\s?6600\s?xt/i, range: [140, 180] },
  { pattern: /(?:rx|radeon)?\s?6600/i, range: [120, 160] },
  { pattern: /(?:rx|radeon)?\s?6500\s?xt/i, range: [80, 110] },
  { pattern: /(?:rx|radeon)?\s?6400/i, range: [60, 85] },

  // AMD RX 5000, Vega & RX 500 / 400 / R9 Series
  { pattern: /(?:rx|radeon)?\s?5700\s?xt/i, range: [120, 160] },
  { pattern: /(?:rx|radeon)?\s?5700/i, range: [100, 135] },
  { pattern: /(?:rx|radeon)?\s?5600\s?xt/i, range: [90, 120] },
  { pattern: /(?:rx|radeon)?\s?5500\s?xt/i, range: [65, 95] },
  { pattern: /radeon\s?vii/i, range: [150, 220] },
  { pattern: /vega\s?64/i, range: [90, 130] },
  { pattern: /vega\s?56/i, range: [75, 110] },
  { pattern: /(?:rx|radeon)?\s?590/i, range: [50, 80] },
  { pattern: /(?:rx|radeon)?\s?580\s?8\s?gb/i, range: [45, 75] },
  { pattern: /(?:rx|radeon)?\s?580\s?4\s?gb/i, range: [35, 55] },
  { pattern: /(?:rx|radeon)?\s?580/i, range: [40, 70] },
  { pattern: /(?:rx|radeon)?\s?570\s?8\s?gb/i, range: [40, 65] },
  { pattern: /(?:rx|radeon)?\s?570\s?4\s?gb/i, range: [30, 50] },
  { pattern: /(?:rx|radeon)?\s?570/i, range: [35, 60] },
  { pattern: /(?:rx|radeon)?\s?560/i, range: [25, 45] },
  { pattern: /(?:rx|radeon)?\s?550/i, range: [20, 35] },
  { pattern: /(?:rx|radeon)?\s?480/i, range: [35, 55] },
  { pattern: /(?:rx|radeon)?\s?470/i, range: [28, 45] },
  { pattern: /(?:rx|radeon)?\s?460/i, range: [20, 35] },
  { pattern: /r9\s?390x/i, range: [45, 70] },
  { pattern: /r9\s?390/i, range: [35, 55] },
  { pattern: /r9\s?380x/i, range: [30, 48] },
  { pattern: /r9\s?380/i, range: [25, 40] },
  { pattern: /r9\s?290x/i, range: [35, 55] },
  { pattern: /r9\s?290/i, range: [28, 45] },
  { pattern: /r9\s?280x/i, range: [25, 40] },
];

const CPU_PRICES = [
  // AMD Ryzen 9000 & 8000G Series
  { pattern: /ryzen\s?9\s?9950x3d/i, range: [580, 680] },
  { pattern: /ryzen\s?9\s?9950x/i, range: [480, 570] },
  { pattern: /ryzen\s?9\s?9900x3d/i, range: [460, 540] },
  { pattern: /ryzen\s?9\s?9900x/i, range: [360, 430] },
  { pattern: /ryzen\s?7\s?9800x3d/i, range: [420, 500] },
  { pattern: /ryzen\s?7\s?9700x/i, range: [260, 320] },
  { pattern: /ryzen\s?5\s?9600x/i, range: [190, 240] },
  { pattern: /ryzen\s?7\s?8700g/i, range: [220, 270] },
  { pattern: /ryzen\s?5\s?8600g/i, range: [150, 190] },
  { pattern: /ryzen\s?5\s?8500g/i, range: [110, 145] },

  // AMD Ryzen 7000 Series
  { pattern: /ryzen\s?9\s?7950x3d/i, range: [450, 550] },
  { pattern: /ryzen\s?9\s?7950x/i, range: [380, 460] },
  { pattern: /ryzen\s?9\s?7900x3d/i, range: [350, 420] },
  { pattern: /ryzen\s?9\s?7900x/i, range: [300, 370] },
  { pattern: /ryzen\s?9\s?7900\b/i, range: [280, 340] },
  { pattern: /ryzen\s?7\s?7800x3d/i, range: [320, 390] },
  { pattern: /ryzen\s?7\s?7700x/i, range: [220, 280] },
  { pattern: /ryzen\s?7\s?7700\b/i, range: [190, 240] },
  { pattern: /ryzen\s?5\s?7600x/i, range: [160, 210] },
  { pattern: /ryzen\s?5\s?7600\b/i, range: [140, 180] },
  { pattern: /ryzen\s?5\s?7500f/i, range: [110, 145] },

  // AMD Ryzen 5000 Series
  { pattern: /ryzen\s?9\s?5950x/i, range: [220, 280] },
  { pattern: /ryzen\s?9\s?5900xt/i, range: [200, 250] },
  { pattern: /ryzen\s?9\s?5900x/i, range: [170, 220] },
  { pattern: /ryzen\s?9\s?5900\b/i, range: [150, 190] },
  { pattern: /ryzen\s?7\s?5800x3d/i, range: [200, 260] },
  { pattern: /ryzen\s?7\s?5800xt/i, range: [140, 180] },
  { pattern: /ryzen\s?7\s?5800x/i, range: [120, 160] },
  { pattern: /ryzen\s?7\s?5700x3d/i, range: [150, 190] },
  { pattern: /ryzen\s?7\s?5700x/i, range: [110, 150] },
  { pattern: /ryzen\s?7\s?5700/i, range: [90, 130] },
  { pattern: /ryzen\s?5\s?5600x3d/i, range: [120, 160] },
  { pattern: /ryzen\s?5\s?5600x/i, range: [80, 110] },
  { pattern: /ryzen\s?5\s?5600gt/i, range: [85, 115] },
  { pattern: /ryzen\s?5\s?5600g/i, range: [75, 105] },
  { pattern: /ryzen\s?5\s?5600\b/i, range: [70, 100] },
  { pattern: /ryzen\s?5\s?5500/i, range: [55, 80] },
  { pattern: /ryzen\s?3\s?5300g/i, range: [45, 65] },

  // AMD Ryzen 3000 Series
  { pattern: /ryzen\s?9\s?3950x/i, range: [180, 230] },
  { pattern: /ryzen\s?9\s?3900xt/i, range: [140, 180] },
  { pattern: /ryzen\s?9\s?3900x/i, range: [120, 160] },
  { pattern: /ryzen\s?7\s?3800xt/i, range: [100, 135] },
  { pattern: /ryzen\s?7\s?3800x/i, range: [90, 120] },
  { pattern: /ryzen\s?7\s?3700x/i, range: [80, 110] },
  { pattern: /ryzen\s?5\s?3600xt/i, range: [70, 95] },
  { pattern: /ryzen\s?5\s?3600x/i, range: [60, 85] },
  { pattern: /ryzen\s?5\s?3600\b/i, range: [55, 75] },
  { pattern: /ryzen\s?5\s?3500/i, range: [45, 65] },
  { pattern: /ryzen\s?3\s?3200g/i, range: [35, 55] },

  // AMD Ryzen 2000, 1000 & Threadripper
  { pattern: /ryzen\s?7\s?2700x/i, range: [45, 65] },
  { pattern: /ryzen\s?7\s?2700\b/i, range: [40, 60] },
  { pattern: /ryzen\s?5\s?2600x/i, range: [35, 50] },
  { pattern: /ryzen\s?5\s?2600\b/i, range: [30, 45] },
  { pattern: /ryzen\s?5\s?2400g/i, range: [30, 45] },
  { pattern: /ryzen\s?3\s?2200g/i, range: [25, 40] },
  { pattern: /ryzen\s?7\s?1800x/i, range: [40, 60] },
  { pattern: /ryzen\s?7\s?1700x/i, range: [35, 50] },
  { pattern: /ryzen\s?7\s?1700\b/i, range: [30, 45] },
  { pattern: /ryzen\s?5\s?1600af/i, range: [28, 42] },
  { pattern: /ryzen\s?5\s?1600x/i, range: [25, 40] },
  { pattern: /ryzen\s?5\s?1600\b/i, range: [20, 35] },
  { pattern: /ryzen\s?5\s?1500x/i, range: [20, 32] },
  { pattern: /ryzen\s?5\s?1400/i, range: [15, 28] },
  { pattern: /threadripper\s?3990x/i, range: [1200, 1600] },
  { pattern: /threadripper\s?3970x/i, range: [600, 800] },
  { pattern: /threadripper\s?3960x/i, range: [450, 600] },
  { pattern: /threadripper\s?2950x/i, range: [200, 300] },
  { pattern: /threadripper\s?1950x/i, range: [140, 200] },

  // Intel Core Ultra Series
  { pattern: /(?:core\s?ultra\s?9|ultra\s?9)/i, range: [380, 480] },
  { pattern: /(?:core\s?ultra\s?7|ultra\s?7)/i, range: [280, 360] },
  { pattern: /(?:core\s?ultra\s?5|ultra\s?5)/i, range: [190, 250] },

  // Intel 14th Gen
  { pattern: /(?:i9[-?\s]?14900ks)/i, range: [480, 580] },
  { pattern: /(?:i9[-?\s]?14900kf)/i, range: [380, 450] },
  { pattern: /(?:i9[-?\s]?14900k)/i, range: [400, 480] },
  { pattern: /(?:i9[-?\s]?14900)/i, range: [360, 430] },
  { pattern: /(?:i7[-?\s]?14700kf)/i, range: [260, 320] },
  { pattern: /(?:i7[-?\s]?14700k)/i, range: [280, 340] },
  { pattern: /(?:i7[-?\s]?14700)/i, range: [240, 290] },
  { pattern: /(?:i5[-?\s]?14600kf)/i, range: [180, 230] },
  { pattern: /(?:i5[-?\s]?14600k)/i, range: [200, 250] },
  { pattern: /(?:i5[-?\s]?14600)/i, range: [170, 210] },
  { pattern: /(?:i5[-?\s]?14500)/i, range: [150, 190] },
  { pattern: /(?:i5[-?\s]?14400f)/i, range: [120, 155] },
  { pattern: /(?:i5[-?\s]?14400)/i, range: [130, 170] },

  // Intel 13th Gen
  { pattern: /(?:i9[-?\s]?13900ks)/i, range: [420, 500] },
  { pattern: /(?:i9[-?\s]?13900kf)/i, range: [330, 400] },
  { pattern: /(?:i9[-?\s]?13900k)/i, range: [350, 430] },
  { pattern: /(?:i9[-?\s]?13900)/i, range: [310, 380] },
  { pattern: /(?:i7[-?\s]?13700kf)/i, range: [230, 290] },
  { pattern: /(?:i7[-?\s]?13700k)/i, range: [250, 310] },
  { pattern: /(?:i7[-?\s]?13700)/i, range: [210, 260] },
  { pattern: /(?:i5[-?\s]?13600kf)/i, range: [160, 210] },
  { pattern: /(?:i5[-?\s]?13600k)/i, range: [180, 230] },
  { pattern: /(?:i5[-?\s]?13600)/i, range: [150, 190] },
  { pattern: /(?:i5[-?\s]?13500)/i, range: [140, 180] },
  { pattern: /(?:i5[-?\s]?13400f)/i, range: [110, 145] },
  { pattern: /(?:i5[-?\s]?13400)/i, range: [120, 155] },
  { pattern: /(?:i3[-?\s]?13100f)/i, range: [60, 85] },
  { pattern: /(?:i3[-?\s]?13100)/i, range: [70, 95] },

  // Intel 12th Gen
  { pattern: /(?:i9[-?\s]?12900ks)/i, range: [260, 330] },
  { pattern: /(?:i9[-?\s]?12900kf)/i, range: [200, 250] },
  { pattern: /(?:i9[-?\s]?12900k)/i, range: [220, 280] },
  { pattern: /(?:i9[-?\s]?12900)/i, range: [190, 240] },
  { pattern: /(?:i7[-?\s]?12700kf)/i, range: [160, 200] },
  { pattern: /(?:i7[-?\s]?12700k)/i, range: [180, 230] },
  { pattern: /(?:i7[-?\s]?12700)/i, range: [150, 190] },
  { pattern: /(?:i5[-?\s]?12600kf)/i, range: [125, 160] },
  { pattern: /(?:i5[-?\s]?12600k)/i, range: [140, 180] },
  { pattern: /(?:i5[-?\s]?12600)/i, range: [120, 155] },
  { pattern: /(?:i5[-?\s]?12500)/i, range: [110, 145] },
  { pattern: /(?:i5[-?\s]?12400f)/i, range: [85, 115] },
  { pattern: /(?:i5[-?\s]?12400)/i, range: [95, 125] },
  { pattern: /(?:i3[-?\s]?12100f)/i, range: [50, 75] },
  { pattern: /(?:i3[-?\s]?12100)/i, range: [60, 85] },

  // Intel 11th Gen & 10th Gen
  { pattern: /(?:i9[-?\s]?11900kf)/i, range: [130, 165] },
  { pattern: /(?:i9[-?\s]?11900k)/i, range: [140, 180] },
  { pattern: /(?:i7[-?\s]?11700k)/i, range: [120, 160] },
  { pattern: /(?:i7[-?\s]?11700)/i, range: [100, 135] },
  { pattern: /(?:i5[-?\s]?11600k)/i, range: [90, 120] },
  { pattern: /(?:i5[-?\s]?11600)/i, range: [80, 105] },
  { pattern: /(?:i5[-?\s]?11400f)/i, range: [65, 90] },
  { pattern: /(?:i5[-?\s]?11400)/i, range: [75, 100] },
  { pattern: /(?:i9[-?\s]?10900kf)/i, range: [120, 155] },
  { pattern: /(?:i9[-?\s]?10900k)/i, range: [130, 170] },
  { pattern: /(?:i7[-?\s]?10850k)/i, range: [120, 155] },
  { pattern: /(?:i7[-?\s]?10700k)/i, range: [110, 150] },
  { pattern: /(?:i7[-?\s]?10700)/i, range: [90, 125] },
  { pattern: /(?:i5[-?\s]?10600k)/i, range: [80, 110] },
  { pattern: /(?:i5[-?\s]?10600)/i, range: [65, 90] },
  { pattern: /(?:i5[-?\s]?10400f)/i, range: [50, 75] },
  { pattern: /(?:i5[-?\s]?10400)/i, range: [55, 80] },
  { pattern: /(?:i3[-?\s]?10100f)/i, range: [30, 48] },

  // Intel Older Generations
  { pattern: /(?:i9[-?\s]?9900ks)/i, range: [140, 180] },
  { pattern: /(?:i9[-?\s]?9900k)/i, range: [110, 150] },
  { pattern: /(?:i7[-?\s]?9700k)/i, range: [90, 120] },
  { pattern: /(?:i7[-?\s]?9700)/i, range: [75, 105] },
  { pattern: /(?:i5[-?\s]?9600k)/i, range: [60, 85] },
  { pattern: /(?:i5[-?\s]?9600)/i, range: [50, 75] },
  { pattern: /(?:i5[-?\s]?9400f)/i, range: [40, 60] },
  { pattern: /(?:i5[-?\s]?9400)/i, range: [45, 65] },
  { pattern: /(?:i7[-?\s]?8700k)/i, range: [70, 100] },
  { pattern: /(?:i7[-?\s]?8700)/i, range: [60, 85] },
  { pattern: /(?:i5[-?\s]?8600k)/i, range: [50, 75] },
  { pattern: /(?:i5[-?\s]?8600)/i, range: [40, 65] },
  { pattern: /(?:i5[-?\s]?8500)/i, range: [35, 55] },
  { pattern: /(?:i5[-?\s]?8400)/i, range: [30, 50] },
  { pattern: /(?:i7[-?\s]?7700k)/i, range: [55, 80] },
  { pattern: /(?:i7[-?\s]?7700)/i, range: [45, 65] },
  { pattern: /(?:i5[-?\s]?7600k)/i, range: [35, 55] },
  { pattern: /(?:i5[-?\s]?7600)/i, range: [28, 45] },
  { pattern: /(?:i5[-?\s]?7500)/i, range: [22, 38] },
  { pattern: /(?:i7[-?\s]?6700k)/i, range: [45, 65] },
  { pattern: /(?:i7[-?\s]?6700)/i, range: [35, 55] },
  { pattern: /(?:i5[-?\s]?6600k)/i, range: [28, 45] },
  { pattern: /(?:i5[-?\s]?6600)/i, range: [22, 38] },
  { pattern: /(?:i5[-?\s]?6500)/i, range: [18, 30] },

  // Xeons
  { pattern: /e5-2690\s?v3/i, range: [25, 40] },
  { pattern: /e5-2680\s?v4/i, range: [20, 35] },
  { pattern: /e5-2667\s?v3/i, range: [18, 32] },
  { pattern: /e5-1650\s?v4/i, range: [25, 40] },
  { pattern: /e5-1650\s?v3/i, range: [18, 30] },
];

const MOTHERBOARD_PRICES = [
  // AMD Chipsets
  { pattern: /x870e/i, range: [220, 320] },
  { pattern: /x870/i, range: [170, 240] },
  { pattern: /x670e/i, range: [180, 260] },
  { pattern: /x670/i, range: [140, 200] },
  { pattern: /b650e/i, range: [130, 180] },
  { pattern: /b650/i, range: [90, 140] },
  { pattern: /a620/i, range: [55, 80] },
  { pattern: /x570/i, range: [80, 130] },
  { pattern: /b550/i, range: [55, 90] },
  { pattern: /a520/i, range: [35, 55] },
  { pattern: /x470/i, range: [50, 80] },
  { pattern: /b450/i, range: [35, 60] },
  { pattern: /x370/i, range: [40, 65] },
  { pattern: /b350/i, range: [25, 45] },
  { pattern: /a320/i, range: [20, 35] },

  // Intel Chipsets
  { pattern: /z790/i, range: [130, 220] },
  { pattern: /h770/i, range: [90, 130] },
  { pattern: /b760/i, range: [75, 120] },
  { pattern: /z690/i, range: [100, 160] },
  { pattern: /h670/i, range: [70, 110] },
  { pattern: /b660/i, range: [60, 95] },
  { pattern: /z590/i, range: [75, 120] },
  { pattern: /h570/i, range: [50, 80] },
  { pattern: /b560/i, range: [45, 75] },
  { pattern: /z490/i, range: [65, 100] },
  { pattern: /h470/i, range: [45, 70] },
  { pattern: /b460/i, range: [40, 65] },
  { pattern: /z390/i, range: [55, 90] },
  { pattern: /b365/i, range: [35, 55] },
  { pattern: /h370/i, range: [35, 55] },
  { pattern: /b360/i, range: [30, 50] },
  { pattern: /z370/i, range: [45, 75] },
  { pattern: /z270/i, range: [40, 65] },
  { pattern: /h270/i, range: [25, 45] },
  { pattern: /b250/i, range: [25, 40] },
  { pattern: /z170/i, range: [35, 55] },
  { pattern: /h170/i, range: [25, 40] },
  { pattern: /b150/i, range: [20, 35] },
  { pattern: /h110/i, range: [18, 30] },
];

const COOLER_PRICES = [
  { pattern: /nh-d15/i, range: [50, 75] },
  { pattern: /nh-u12a/i, range: [45, 65] },
  { pattern: /dark\s?rock(?:\s?pro)?\s?4/i, range: [40, 60] },
  { pattern: /dark\s?rock(?:\s?pro)?\s?5/i, range: [50, 70] },
  { pattern: /ak620/i, range: [30, 48] },
  { pattern: /ak400/i, range: [18, 28] },
  { pattern: /peerless\s?assassin/i, range: [22, 32] },
  { pattern: /phantom\s?spirit/i, range: [24, 35] },
  { pattern: /hyper\s?212/i, range: [12, 22] },
  { pattern: /arctic\s?freezer\s?iii?\s?420/i, range: [60, 85] },
  { pattern: /arctic\s?freezer\s?iii?\s?360/i, range: [50, 75] },
  { pattern: /arctic\s?freezer\s?iii?\s?280/i, range: [45, 65] },
  { pattern: /arctic\s?freezer\s?iii?\s?240/i, range: [40, 55] },
  { pattern: /kraken\s?elite?\s?360/i, range: [110, 160] },
  { pattern: /kraken\s?elite?\s?280/i, range: [90, 130] },
  { pattern: /kraken\s?elite?\s?240/i, range: [80, 110] },
  { pattern: /galahad\s?360/i, range: [70, 105] },
  { pattern: /galahad\s?240/i, range: [50, 80] },
  { pattern: /corsair\s?icue\s?h150/i, range: [70, 110] },
  { pattern: /corsair\s?icue\s?h100/i, range: [50, 80] },
  { pattern: /stock\s?cooler|amd\s?wraith|intel\s?stock/i, range: [0, 8] },
];

const CASE_PRICES = [
  { pattern: /hyte\s?y70/i, range: [180, 240] },
  { pattern: /hyte\s?y60/i, range: [110, 150] },
  { pattern: /o11\s?dynamic|o11d/i, range: [75, 120] },
  { pattern: /fractal\s?north/i, range: [85, 120] },
  { pattern: /fractal\s?torrent/i, range: [90, 135] },
  { pattern: /fractal\s?meshify/i, range: [50, 85] },
  { pattern: /fractal\s?pop\s?air/i, range: [40, 60] },
  { pattern: /corsair\s?6500x/i, range: [100, 140] },
  { pattern: /corsair\s?5000d/i, range: [70, 100] },
  { pattern: /corsair\s?4000d/i, range: [45, 65] },
  { pattern: /nzxt\s?h9/i, range: [90, 130] },
  { pattern: /nzxt\s?h7/i, range: [60, 90] },
  { pattern: /nzxt\s?h6/i, range: [55, 80] },
  { pattern: /nzxt\s?h5/i, range: [40, 60] },
  { pattern: /lancool\s?216/i, range: [50, 75] },
  { pattern: /eclipse\s?g360a|eclipse\s?p400/i, range: [35, 55] },
  { pattern: /air\s?903/i, range: [35, 50] },
  { pattern: /ch560/i, range: [45, 65] },
  { pattern: /td500/i, range: [40, 60] },
  { pattern: /pano\s?m100/i, range: [45, 65] },
];

const RAM_PRICE_PER_GB = { ddr5: 2.2, ddr4: 1.4, ddr3: 0.6, default: 1.2 };
const STORAGE_PRICE_PER_GB = { nvme: 0.06, ssd: 0.05, hdd: 0.015, default: 0.04 };
const PSU_PRICE_PER_WATT = 0.12;

// Returns a rough [low, high] £ price band for a detected line, or null if
// nothing matched (in which case the user just types a price manually).
export function estimateRange(text, category) {
  const t = (text || "").toLowerCase();

  let range = null;

  if (category === "GPU") {
    const match = GPU_PRICES.find((g) => g.pattern.test(t));
    if (match) range = [...match.range];
  }

  if (category === "CPU") {
    const match = CPU_PRICES.find((c) => c.pattern.test(t));
    if (match) range = [...match.range];
  }

  if (category === "Motherboard") {
    const match = MOTHERBOARD_PRICES.find((m) => m.pattern.test(t));
    if (match) {
      range = [...match.range];
      if (/rog\s?maximus|rog\s?crosshair|taichi|aorus\s?master/i.test(t)) {
        range[0] += 40;
        range[1] += 80;
      } else if (/rog\s?strix|aorus\s?elite|tomahawk|carbon/i.test(t)) {
        range[0] += 15;
        range[1] += 30;
      }
    }
  }

  if (category === "RAM") {
    const gbMatch = t.match(/(\d{1,3})\s?gb/);
    if (gbMatch) {
      const gb = Number(gbMatch[1]);
      const type = /ddr5/.test(t) ? "ddr5" : /ddr4/.test(t) ? "ddr4" : /ddr3/.test(t) ? "ddr3" : "default";
      const base = gb * RAM_PRICE_PER_GB[type];
      range = [Math.round(base * 0.8), Math.round(base * 1.2)];
    }
  }

  if (category === "Storage") {
    const tbMatch = t.match(/(\d{1,2}(?:\.\d)?)\s?tb/);
    const gbMatch = t.match(/(\d{2,4})\s?gb/);
    let gb = null;
    if (tbMatch) gb = Number(tbMatch[1]) * 1000;
    else if (gbMatch) gb = Number(gbMatch[1]);
    if (gb) {
      const type = /gen5|pcie\s?5/i.test(t) ? "nvme" : /nvme|m\.2/i.test(t) ? "nvme" : /ssd/i.test(t) ? "ssd" : /hdd/i.test(t) ? "hdd" : "default";
      let base = gb * STORAGE_PRICE_PER_GB[type];
      if (/gen5|pcie\s?5/i.test(t)) base *= 1.8;
      range = [Math.round(base * 0.75), Math.round(base * 1.25)];
    }
  }

  if (category === "PSU") {
    const wMatch = t.match(/(\d{3,4})\s?w/);
    if (wMatch) {
      const watts = Number(wMatch[1]);
      let base = watts * PSU_PRICE_PER_WATT;

      if (/titanium/i.test(t)) base *= 1.5;
      else if (/platinum/i.test(t)) base *= 1.3;
      else if (/gold/i.test(t)) base *= 1.1;
      else if (/bronze/i.test(t)) base *= 0.85;

      range = [Math.round(base * 0.8), Math.round(base * 1.3)];
    }
  }

  if (category === "Cooler") {
    const match = COOLER_PRICES.find((c) => c.pattern.test(t));
    if (match) {
      range = [...match.range];
    } else {
      const radMatch = t.match(/(360|280|240|420)\s?mm/);
      if (radMatch) {
        const size = Number(radMatch[1]);
        const base = size * 0.2;
        range = [Math.round(base * 0.8), Math.round(base * 1.3)];
      }
    }
  }

  if (category === "Case") {
    const match = CASE_PRICES.find((c) => c.pattern.test(t));
    if (match) range = [...match.range];
  }

  // Common multipliers applied across all components
  if (range) {
    if (/founders\s?edition|\bfe\b/i.test(t)) {
      range[0] = Math.round(range[0] * 1.05);
      range[1] = Math.round(range[1] * 1.08);
    }
    if (/white(?:\s?edition)?/i.test(t)) {
      range[0] = Math.round(range[0] * 1.05);
      range[1] = Math.round(range[1] * 1.1);
    }
    if (/\brgb\b/i.test(t)) {
      range[0] = Math.round(range[0] * 1.03);
      range[1] = Math.round(range[1] * 1.05);
    }
  }

  return range;
}