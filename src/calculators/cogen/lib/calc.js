export const DEF = {
  projectName: 'Мій Енерго-Проєкт',
  elMW: 1.0,
  thMW: 1.1,
  eff: 0.4,
  gp: 21000,
  rdm: 5800,
  trans: 713,
  distr: 2112,
  hp: 1800,
  sh: 1,
  elB: 0.45,
  vrfW: 0.35,
  vrfS: 0.25,
  capex: 32e6,
  opex: 4,
  av: 0.92,
};

export function calc(p) {
  const EL = p.elMW ?? 1.0;
  const TH = p.thMW ?? 1.1;
  const EFF = p.eff ?? 0.4;

  const GHV = 8.5;
  const GHP = 0.15;
  const DHW = 1700;

  const h = Math.round(8760 * p.av);
  const hW = Math.round((h * 5) / 12);
  const hS = h - hW;

  const gm3 = (EL * 1000) / EFF / GHV;
  const gAnn = gm3 * h;
  const gCost = (gAnn / 1000) * p.gp;

  const thG = TH - GHP;
  const gcW = thG * 0.86 * hW;
  const gcS = thG * 0.86 * hS * p.sh;
  const gcT = gcW + gcS;
  const gcI = GHP * 0.86 * h;
  const hRev = gcT * p.hp;
  const hIS = gcI * DHW;

  const ep = (p.rdm + p.trans + p.distr) / 1000;

  const lW = p.elB + p.vrfW;
  const lS = p.elB + p.vrfS;
  const cW = Math.min(EL, lW);
  const cS = Math.min(EL, lS);
  const iW = Math.max(0, lW - EL);
  const iS = Math.max(0, lS - EL);
  const sW = Math.max(0, EL - lW);
  const sS = Math.max(0, EL - lS);

  const ks = cW * 1000 * hW + cS * 1000 * hS;
  const eSav = ks * ep;
  const kGen = EL * 1000 * h;
  const ecg = gCost / kGen;

  const opexCost = p.capex * (p.opex / 100);
  const tot = eSav + hRev + hIS;
  const net = tot - gCost - opexCost;
  const pb = net > 0 ? p.capex / net : null;

  const cf = [-(p.capex / 1e6)];
  for (let i = 1; i <= 15; i += 1) {
    cf.push(+(-(p.capex / 1e6) + (net / 1e6) * i).toFixed(2));
  }

  return {
    h,
    hW,
    hS,
    gm3,
    gAnn,
    gCost,
    thG,
    gcW,
    gcS,
    gcT,
    gcI,
    hRev,
    hIS,
    ep,
    lW,
    lS,
    cW,
    cS,
    iW,
    iS,
    sW,
    sS,
    ks,
    eSav,
    kGen,
    ecg,
    opex: opexCost,
    tot,
    net,
    pb,
    cf,
  };
}
