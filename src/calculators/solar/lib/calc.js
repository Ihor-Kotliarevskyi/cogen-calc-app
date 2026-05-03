export const DEF = {
  projectName: 'Мій СЕС-проєкт',
  pvMW: 1.0,
  specificYield: 1200,
  degradation: 0.7,
  selfUseShare: 0.6,
  gridPrice: 7.2,
  feedInTariff: 4.2,
  capex: 28000000,
  opex: 1.5,
};

export function calc(p) {
  const year1Gen = p.pvMW * 1000 * p.specificYield;
  const selfUseKwh = year1Gen * p.selfUseShare;
  const exportKwh = year1Gen - selfUseKwh;

  const savings = selfUseKwh * p.gridPrice;
  const exportRevenue = exportKwh * p.feedInTariff;
  const opexCost = p.capex * (p.opex / 100);
  const totalRevenue = savings + exportRevenue;
  const net = totalRevenue - opexCost;
  const pb = net > 0 ? p.capex / net : null;

  const cf = [-(p.capex / 1e6)];
  let cumulative = -(p.capex / 1e6);
  const yearly = [];

  for (let year = 1; year <= 15; year += 1) {
    const degFactor = Math.pow(1 - p.degradation / 100, year - 1);
    const gen = year1Gen * degFactor;
    const ySavings = gen * p.selfUseShare * p.gridPrice;
    const yExport = gen * (1 - p.selfUseShare) * p.feedInTariff;
    const yNet = ySavings + yExport - opexCost;
    cumulative += yNet / 1e6;
    cf.push(+cumulative.toFixed(2));
    yearly.push({ year, gen, net: yNet, degFactor });
  }

  const lcoe = (p.capex + opexCost * 15) / yearly.reduce((acc, y) => acc + y.gen, 0);

  return {
    year1Gen,
    selfUseKwh,
    exportKwh,
    savings,
    exportRevenue,
    opexCost,
    totalRevenue,
    net,
    pb,
    cf,
    yearly,
    lcoe,
  };
}
