import { calc } from './calc.js';

const fN = (n, d = 0) =>
  Number(n).toLocaleString('uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d });

const fM = (n, d = 1) => `${fN(n / 1e6, d)} млн`;
const fG = (n, d = 2) => `${fN(n, d)} грн`;

function buildScenarioVariants(P, result) {
  const sc = (ov) => calc({ ...P, ...ov });
  return [
    {
      title: 'Консервативний',
      badge: 'Мережа не бере влітку',
      tone: '#6b7280',
      bg: '#e5e7eb',
      result: sc({ sh: 0, hp: 800 }),
    },
    {
      title: 'Базовий (поточний)',
      badge: 'Ваші параметри',
      tone: '#059669',
      bg: '#d1fae5',
      result,
    },
    {
      title: 'Оптимістичний',
      badge: 'РДН 8 грн, газ -10%, тепло 2500',
      tone: '#1d4ed8',
      bg: '#dbeafe',
      result: sc({ rdm: 8000, gp: Math.round(P.gp * 0.9), hp: 2500, sh: 1, av: 0.95 }),
    },
    {
      title: 'Тільки електрика',
      badge: 'Без продажу тепла',
      tone: '#b45309',
      bg: '#fef3c7',
      result: sc({ hp: 0, sh: 0 }),
    },
  ];
}

function buildSensitivity(P) {
  const elPrices = [6, 7, 8, 9, 10, 11, 12, 13, 14];
  const gasScenarios = [
    { g: 18000, label: 'Газ 18т.' },
    { g: 21000, label: 'Газ 21т.' },
    { g: 24000, label: 'Газ 24т.' },
  ];

  return {
    gasScenarios,
    rows: elPrices.map((ep) => ({
      ep,
      cells: gasScenarios.map((s) => {
        const sc = calc({
          ...P,
          rdm: ep * 1000 - P.trans - P.distr,
          gp: s.g,
        });
        return sc.pb ? `${sc.pb.toFixed(1)} р.` : '∞';
      }),
    })),
  };
}

function buildChartSvg(cf) {
  const width = 980;
  const height = 320;
  const pad = { l: 76, r: 24, t: 20, b: 46 };
  const cW = width - pad.l - pad.r;
  const cH = height - pad.t - pad.b;
  const minV = Math.min(...cf);
  const maxV = Math.max(...cf);
  const rng = maxV - minV || 1;
  const xOf = (i) => pad.l + (i / (cf.length - 1)) * cW;
  const yOf = (v) => pad.t + cH - ((v - minV) / rng) * cH;

  const line = cf.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i)} ${yOf(v)}`).join(' ');
  const area = `${line} L ${xOf(cf.length - 1)} ${height - pad.b} L ${xOf(0)} ${height - pad.b} Z`;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const y = pad.t + (i * cH) / 4;
    const val = maxV - (i / 4) * rng;
    return `
      <line x1="${pad.l}" y1="${y}" x2="${width - pad.r}" y2="${y}" stroke="#e2e8f0" />
      <text x="${pad.l - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="#64748b">${fN(val, 0)}</text>
    `;
  }).join('');

  const zeroLine = minV < 0 && maxV > 0
    ? `<line x1="${pad.l}" y1="${yOf(0)}" x2="${width - pad.r}" y2="${yOf(0)}" stroke="#94a3b8" stroke-dasharray="6 4" />`
    : '';

  const labels = [0, 3, 6, 9, 12, 15].map((i) => `
    <text x="${xOf(i)}" y="${height - 14}" text-anchor="middle" font-size="11" fill="#64748b">${i === 0 ? 'Старт' : `р.${i}`}</text>
  `).join('');

  const dots = cf.map((v, i) => `
    <circle cx="${xOf(i)}" cy="${yOf(v)}" r="4" fill="${v >= 0 ? '#059669' : '#dc2626'}" />
  `).join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="320" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#ffffff" />
      ${grid}
      ${zeroLine}
      <path d="${area}" fill="rgba(29,78,216,0.10)"></path>
      <path d="${line}" fill="none" stroke="#1d4ed8" stroke-width="3" />
      ${dots}
      ${labels}
    </svg>
  `;
}

function pageHeader(title, scenarioName, now) {
  return `
    <div class="page-head">
      <div>
        <div class="brand">EnergyROI · Когенерація</div>
        <h1>${title}</h1>
      </div>
      <div class="meta">
        <div><strong>${scenarioName}</strong></div>
        <div>${now.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      </div>
    </div>
  `;
}

function buildHtml(scenario) {
  const P = scenario.P;
  const r = calc(P);
  const diff = r.ep - r.ecg;
  const scenarios = buildScenarioVariants(P, r);
  const sensitivity = buildSensitivity(P);
  const chartSvg = buildChartSvg(r.cf);
  const now = new Date(scenario.timestamp || Date.now());

  const rows = [
    ['Економія на купівлі електрики', r.eSav, true],
    ['Продаж тепла в мережу', r.hRev, true],
    ['Економія ГВП', r.hIS, true],
    ['Разом доходи', r.tot, true, true],
    ['Витрати на газ', -r.gCost, false],
    ['OPEX (ТО, персонал)', -r.opex, false],
    ['Чистий прибуток', r.net, r.net >= 0, true],
  ];

  const scenarioMetrics = [
    { label: 'Собів. ел.', value: (s) => fG(s.ecg) },
    { label: 'Дохід, млн', value: (s) => fM(s.tot, 1) },
    { label: 'Прибуток, млн', value: (s) => fM(s.net, 1) },
    { label: 'Окупність', value: (s) => (s.pb ? `${s.pb.toFixed(1)} р.` : '∞') },
    { label: 'NPV 15р.', value: (s) => `${fN(s.cf[15], 1)} млн` },
  ];

  return `<!doctype html>
  <html lang="uk">
  <head>
    <meta charset="utf-8" />
    <title>${scenario.name} · EnergyROI</title>
    <style>
      @page { size: A4 portrait; margin: 14mm; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Inter, Arial, sans-serif; color: #0f172a; background: #fff; }
      .page { min-height: 100vh; page-break-after: always; break-after: page; padding: 0; }
      .page:last-child { page-break-after: auto; break-after: auto; }
      .page-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 14px; border-bottom: 2px solid #0f172a; margin-bottom: 18px; }
      .brand { font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
      h1 { margin: 0; font-size: 30px; line-height: 1; letter-spacing: -.04em; }
      h2 { margin: 0 0 12px; font-size: 19px; letter-spacing: -.03em; }
      .meta { text-align: right; font-size: 13px; color: #475569; }
      .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
      .card { border: 1px solid #cbd5e1; border-radius: 16px; padding: 14px; background: #fff; break-inside: avoid; }
      .label { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #64748b; margin-bottom: 6px; }
      .value { font-size: 28px; font-weight: 800; line-height: 1; letter-spacing: -.04em; }
      .subvalue { margin-top: 6px; font-size: 13px; color: #475569; }
      .pos { color: #059669; }
      .neg { color: #dc2626; }
      .amber { color: #b45309; }
      .two-col { display: grid; grid-template-columns: 1.18fr .82fr; gap: 14px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 13px; vertical-align: top; }
      th:last-child, td:last-child { text-align: right; }
      .tot td { font-weight: 800; color: #0f172a; }
      .section-card { border: 1px solid #cbd5e1; border-radius: 16px; padding: 14px; }
      .cf-grid { display: grid; grid-template-columns: 1.02fr .98fr; gap: 14px; }
      .scenario-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
      .scenario-card { border: 1px solid #cbd5e1; border-radius: 16px; padding: 14px; }
      .badge { display: inline-block; padding: 4px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
      .scenario-title { margin: 10px 0 8px; font-size: 18px; font-weight: 700; }
      .scenario-row { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
      .scenario-row:last-child { border-bottom: none; }
      .cf-rows { border: 1px solid #cbd5e1; border-radius: 16px; padding: 14px; }
      .cf-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
      .cf-row:last-child { border-bottom: none; }
      .cf-year { width: 70px; color: #475569; }
      .cf-value { flex: 1; text-align: right; font-weight: 800; }
      .cf-badge { width: 100px; text-align: right; font-size: 11px; color: #64748b; }
      .summary-strip { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
      .summary-item { flex: 1 1 160px; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 12px; background: #f8fafc; font-size: 12px; color: #475569; }
      .summary-item strong { display: block; margin-top: 4px; font-size: 18px; color: #0f172a; }
    </style>
  </head>
  <body>
    <section class="page">
      ${pageHeader('Результат', scenario.name, now)}
      <div class="cards">
        <div class="card">
          <div class="label">Собівартість / мережа</div>
          <div class="value">${fG(r.ecg)}</div>
          <div class="subvalue">мережа: ${fG(r.ep)}</div>
          <div class="subvalue ${diff >= 0 ? 'pos' : 'neg'}">різниця: ${diff >= 0 ? '+' : ''}${fG(diff)}</div>
        </div>
        <div class="card">
          <div class="label">Дохід / прибуток</div>
          <div class="value">${fM(r.tot)}</div>
          <div class="subvalue ${r.net >= 0 ? 'pos' : 'neg'}">net: ${fM(r.net)}</div>
        </div>
        <div class="card">
          <div class="label">Окупність</div>
          <div class="value ${r.pb ? (r.pb < 4 ? 'pos' : r.pb < 7 ? 'amber' : 'neg') : 'neg'}">${r.pb ? `${r.pb.toFixed(1)} р.` : '∞'}</div>
          <div class="subvalue">CAPEX ${fM(P.capex, 0)}</div>
        </div>
      </div>

      <div class="two-col">
        <div class="section-card">
          <h2>Економіка</h2>
          <table>
            <tbody>
              ${rows.map(([label, value, isPos, isTotal]) => `
                <tr class="${isTotal ? 'tot' : ''}">
                  <td>${label}</td>
                  <td class="${value >= 0 ? 'pos' : 'neg'}">${value >= 0 ? '+' : ''}${fM(value)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section-card">
          <h2>Паливо та режим</h2>
          <table>
            <tbody>
              <tr><td>Витрата газу</td><td>${r.gm3.toFixed(1)} м³/год</td></tr>
              <tr><td>Річна витрата</td><td>${fN(r.gAnn / 1000, 1)} тис. м³</td></tr>
              <tr><td>Вартість газу/рік</td><td class="neg">${fM(r.gCost)}</td></tr>
              <tr><td>Електричний ККД</td><td>${fN(P.eff * 100, 0)}%</td></tr>
              <tr><td>Теплова потужність</td><td>${P.thMW.toFixed(1)} МВт</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="page">
      ${pageHeader('Графік', scenario.name, now)}
      <div class="section-card" style="margin-bottom:14px;">
        ${chartSvg}
      </div>
      <div class="cf-grid">
        <div class="cf-rows">
          <h2>По роках</h2>
          ${r.cf.map((v, i) => `
            <div class="cf-row">
              <span class="cf-year">${i === 0 ? 'Старт' : `Рік ${i}`}</span>
              <span class="cf-value ${v >= 0 ? 'pos' : 'neg'}">${v >= 0 ? '+' : ''}${fN(v, 1)} млн</span>
              <span class="cf-badge">${v >= 0 ? 'окупився' : 'в мінусі'}</span>
            </div>
          `).join('')}
        </div>
        <div class="section-card">
          <h2>Чутливість окупності</h2>
          <div class="summary-strip">
            <div class="summary-item">Окупність<strong>${r.pb ? `${r.pb.toFixed(1)} р.` : '∞'}</strong></div>
            <div class="summary-item">NPV 15 р.<strong>${fN(r.cf[15], 1)} млн</strong></div>
            <div class="summary-item">Break-even<strong>${r.cf.findIndex((v) => v >= 0) > 0 ? `рік ${r.cf.findIndex((v) => v >= 0)}` : 'не окупається'}</strong></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Ціна ел.</th>
                ${sensitivity.gasScenarios.map((s) => `<th>${s.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${sensitivity.rows.map((row) => `
                <tr>
                  <td>${row.ep} грн</td>
                  ${row.cells.map((cell) => `<td>${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="page">
      ${pageHeader('Сценарії', scenario.name, now)}
      <div class="scenario-grid">
        ${scenarios.map((item) => `
          <div class="scenario-card">
            <div class="badge" style="background:${item.bg};color:${item.tone};">${item.badge}</div>
            <div class="scenario-title">${item.title}</div>
            <div class="scenario-row"><span>Собів. ел.</span><strong>${fG(item.result.ecg)}</strong></div>
            <div class="scenario-row"><span>Тепло в мережу</span><strong>${fN(item.result.gcT, 0)} Гкал</strong></div>
            <div class="scenario-row"><span>Прибуток / рік</span><strong>${fM(item.result.net)}</strong></div>
            <div class="scenario-row"><span>Окупність</span><strong>${item.result.pb ? `${item.result.pb.toFixed(1)} р.` : '∞'}</strong></div>
          </div>
        `).join('')}
      </div>

      <div class="section-card">
        <h2>Порівняльна таблиця</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              ${scenarios.map((s) => `<th>${s.title.split(' ')[0]}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${scenarioMetrics.map((metric) => `
              <tr>
                <td>${metric.label}</td>
                ${scenarios.map((s) => `<td>${metric.value(s.result)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  </body>
  </html>`;
}

export function printCogenScenarioReport(scenario) {
  const popup = window.open('', '_blank', 'width=1200,height=900');
  if (!popup) {
    throw new Error('Browser blocked the print window');
  }

  popup.document.open();
  popup.document.write(buildHtml(scenario));
  popup.document.close();

  const triggerPrint = () => {
    popup.focus();
    popup.print();
  };

  if (popup.document.readyState === 'complete') {
    setTimeout(triggerPrint, 200);
  } else {
    popup.onload = () => setTimeout(triggerPrint, 200);
  }
}
