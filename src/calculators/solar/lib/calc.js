export const DEF = {
  projectName: 'Мій СЕС-проєкт',
  pvMW: 1.0,
  specificYield: 1200,
  degradation: 0.7,
  selfUseShare: 0.6,
  gridPrice: 7.2,
  feedInTariff: 4.2,
  reserveShare: 0.35,
  reserveEfficiency: 0.88,
  reserveCyclesYear: 250,
  reservePeakPremium: 1.5,
  capex: 28000000,
  opex: 1.5,
};

export function calc(p) {
  const pvMW = Math.max(0, p.pvMW ?? 0);
  const specificYield = Math.max(0, p.specificYield ?? 0);
  const selfUseShare = Math.max(0, Math.min(1, p.selfUseShare ?? 0));
  const degradation = Math.max(0, Math.min(100, p.degradation ?? 0));
  const reserveShare = Math.max(0, Math.min(1, p.reserveShare ?? 0));
  const reserveEfficiency = Math.max(0.5, Math.min(1, p.reserveEfficiency ?? 0.88));
  const reservePeakPremium = Math.max(0, p.reservePeakPremium ?? 0);

  const year1Gen = pvMW * 1000 * specificYield;
  const selfUseKwh = year1Gen * selfUseShare;
  const exportKwh = year1Gen - selfUseKwh;

  const reserveInKwh = exportKwh * reserveShare;
  const reserveOutKwh = reserveInKwh * reserveEfficiency;
  const reserveLossKwh = reserveInKwh - reserveOutKwh;
  const directExportKwh = exportKwh - reserveInKwh;

  const feedInTariff = Math.max(0, p.feedInTariff ?? 0);
  const peakTariff = feedInTariff + reservePeakPremium;

  const savings = selfUseKwh * Math.max(0, p.gridPrice ?? 0);
  const directExportRevenue = directExportKwh * feedInTariff;
  const reserveExportRevenue = reserveOutKwh * peakTariff;
  const reserveRevenue = reserveExportRevenue - reserveInKwh * feedInTariff;
  const exportRevenue = directExportRevenue + reserveExportRevenue;

  const opexCost = Math.max(0, p.capex * (Math.max(0, p.opex ?? 0) / 100));
  const totalRevenue = savings + exportRevenue;
  const net = totalRevenue - opexCost;

  const cf = [-(p.capex / 1e6)];
  let cumulative = -(p.capex / 1e6);
  const yearly = [];
  let pb = null;

  for (let year = 1; year <= 15; year += 1) {
    const degFactor = Math.pow(1 - degradation / 100, year - 1);
    const gen = year1Gen * degFactor;
    const ySelfUse = gen * selfUseShare;
    const yExportRaw = gen - ySelfUse;
    const yReserveIn = yExportRaw * reserveShare;
    const yReserveOut = yReserveIn * reserveEfficiency;
    const yDirectExport = yExportRaw - yReserveIn;

    const ySavings = ySelfUse * Math.max(0, p.gridPrice ?? 0);
    const yExport = yDirectExport * feedInTariff + yReserveOut * peakTariff;
    const yNet = ySavings + yExport - opexCost;

    cumulative += yNet / 1e6;
    cf.push(+cumulative.toFixed(2));
    yearly.push({ year, gen, net: yNet, degFactor, reserveIn: yReserveIn, reserveOut: yReserveOut });
    if (pb === null && cumulative >= 0) pb = year;
  }

  const totalGen15y = yearly.reduce((acc, y) => acc + y.gen, 0);
  const lcoe = totalGen15y > 0 ? (p.capex + opexCost * 15) / totalGen15y : 0;

  return {
    year1Gen,
    selfUseKwh,
    exportKwh,
    directExportKwh,
    reserveInKwh,
    reserveOutKwh,
    reserveLossKwh,
    savings,
    exportRevenue,
    directExportRevenue,
    reserveExportRevenue,
    reserveRevenue,
    opexCost,
    totalRevenue,
    net,
    pb,
    cf,
    yearly,
    lcoe,
  };
}
