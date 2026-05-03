// Pure calculation & formatting utilities — EnergyROI / КГУ модуль

export const DEF = {
  // ── Проект ──
  projectName: 'Мій Енерго-Проект',

  // ── Установка ──
  elMW: 1.0,   // Електрична потужність, МВт
  thMW: 1.1,   // Теплова потужність, МВт
  eff:  0.40,  // Електричний ККД

  // ── Ринкові ціни ──
  gp:    21000, // Ціна газу, грн/тис.м³
  rdm:   5800,  // РДН, грн/МВт·год
  trans: 713,   // Передача, грн/МВт·год
  distr: 2112,  // Розподіл, грн/МВт·год

  // ── Тепло ──
  hp: 1800, // Ціна тепла, грн/Гкал
  sh: 1,    // Частка тепла влітку (0 / 0.5 / 1)

  // ── Навантаження БЦ ──
  elB:  0.45, // Базове ел. навантаження, МВт
  vrfW: 0.35, // VRF взимку, МВт
  vrfS: 0.25, // VRF влітку, МВт

  // ── Інвестиції ──
  capex: 32e6, // CAPEX, грн
  opex:  4,    // OPEX, % від CAPEX/рік
  av:    0.92, // Коефіцієнт доступності
};

export function calc(p) {
  // ── Параметри установки (тепер із p, а не хардкод) ──
  const EL  = p.elMW ?? 1.0;   // Ел. потужність, МВт
  const TH  = p.thMW ?? 1.1;   // Теплова потужність, МВт
  const EFF = p.eff  ?? 0.40;  // ККД електричний

  const GHV = 8.5;   // Нижча теплота згорання газу, кВт·год/м³
  const GHP = 0.15;  // Теплова потужність ГВП, МВт
  const DHW = 1700;  // Ціна ГВП-тепла, грн/Гкал

  // ── Час роботи ──
  const h  = Math.round(8760 * p.av);
  const hW = Math.round((h * 5) / 12); // Зимові години (5/12 року)
  const hS = h - hW;

  // ── Газ ──
  const gm3   = (EL * 1000) / EFF / GHV;  // Витрата газу, м³/год
  const gAnn  = gm3 * h;                   // Річна витрата, м³
  const gCost = (gAnn / 1000) * p.gp;      // Вартість газу/рік

  // ── Тепло ──
  const thG = TH - GHP;                        // Тепло в мережу, МВт
  const gcW = thG * 0.86 * hW;                 // Зимовий продаж, Гкал
  const gcS = thG * 0.86 * hS * p.sh;          // Літній продаж, Гкал
  const gcT = gcW + gcS;                        // Річний продаж, Гкал
  const gcI = GHP * 0.86 * h;                  // ГВП внутрішнє, Гкал
  const hRev = gcT * p.hp;                      // Дохід від тепла
  const hIS  = gcI * DHW;                       // Економія ГВП

  // ── Електрика ──
  const ep = (p.rdm + p.trans + p.distr) / 1000; // Ціна мережі, грн/кВт·год

  const lW = p.elB + p.vrfW;           // Навантаження зима, МВт
  const lS = p.elB + p.vrfS;           // Навантаження літо, МВт
  const cW = Math.min(EL, lW);         // КГУ покриває зима
  const cS = Math.min(EL, lS);         // КГУ покриває літо
  const iW = Math.max(0, lW - EL);     // Дефіцит зима
  const iS = Math.max(0, lS - EL);     // Дефіцит літо
  const sW = Math.max(0, EL - lW);     // Надлишок зима
  const sS = Math.max(0, EL - lS);     // Надлишок літо

  const ks   = cW * 1000 * hW + cS * 1000 * hS; // Заощаджено, кВт·год
  const eSav = ks * ep;                            // Економія на ел.
  const kGen = EL * 1000 * h;                      // Генерація, кВт·год
  const ecg  = gCost / kGen;                       // Собівартість, грн/кВт·год

  // ── Фінанси ──
  const opex = p.capex * (p.opex / 100);
  const tot  = eSav + hRev + hIS;
  const net  = tot - gCost - opex;
  const pb   = net > 0 ? p.capex / net : null;

  // ── Cashflow 15 років ──
  const cf = [-(p.capex / 1e6)];
  for (let i = 1; i <= 15; i++) {
    cf.push(+(-(p.capex / 1e6) + (net / 1e6) * i).toFixed(2));
  }

  return {
    h, hW, hS,
    gm3, gAnn, gCost,
    thG, gcW, gcS, gcT, gcI, hRev, hIS,
    ep, lW, lS, cW, cS, iW, iS, sW, sS,
    ks, eSav, kGen, ecg,
    opex, tot, net, pb, cf,
  };
}

// ── Форматери ──
export const fN = (n, d = 0) =>
  n.toLocaleString('uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d });

export const fM = (n, d = 1) => fN(n / 1e6, d) + ' млн';
export const fG = (n, d = 2) => fN(n, d) + ' грн';
