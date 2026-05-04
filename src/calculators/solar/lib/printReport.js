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
      badge: 'Низькі ринкові ціни',
      tone: '#6b7280',
      bg: '#e5e7eb',
      result: sc({ feedInTariff: 2.5, gridPrice: 6.2 }),
    },
    {
      title: 'Базовий',
      badge: 'Поточні параметри',
      tone: '#059669',
      bg: '#d1fae5',
      result,
    },
    {
      title: 'Self-use фокус',
      badge: 'Більше власного споживання',
      tone: '#1d4ed8',
      bg: '#dbeafe',
      result: sc({ selfUseShare: 0.8, degradation: 0.6 }),
    },
    {
      title: 'Піковий продаж',
      badge: 'Вищий дохід від резервування',
      tone: '#b45309',
      bg: '#fef3c7',
      result: sc({ reserveShare: 0.5, reservePeakPremium: 2.4, feedInTariff: 4.8 }),
    },
  ];
}

function buildHtml(scenario) {
  const P = scenario.P;
  const r = calc(P);
  const scenarios = buildScenarioVariants(P, r);
  const now = new Date(scenario.timestamp || Date.now());

  return `<!doctype html>
  <html lang="uk">
  <head>
    <meta charset="utf-8" />
    <title>${scenario.name} · EnergyROI Solar</title>
    <style>
      @page { size: A4 portrait; margin: 14mm; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Inter, Arial, sans-serif; color: #0f172a; background: #fff; }
      .page { min-height: 100vh; page-break-after: always; break-after: page; }
      .page:last-child { page-break-after: auto; break-after: auto; }
      .head { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; padding-bottom:14px; border-bottom:2px solid #0f172a; margin-bottom:18px; }
      .brand { font-size:13px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#64748b; margin-bottom:6px; }
      h1 { margin:0; font-size:30px; line-height:1; letter-spacing:-.04em; }
      h2 { margin:0 0 12px; font-size:19px; letter-spacing:-.03em; }
      .meta { text-align:right; font-size:13px; color:#475569; }
      .cards { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:14px; }
      .card { border:1px solid #cbd5e1; border-radius:16px; padding:14px; background:#fff; break-inside:avoid; }
      .label { font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#64748b; margin-bottom:6px; }
      .value { font-size:28px; font-weight:800; line-height:1; letter-spacing:-.04em; }
      .subvalue { margin-top:6px; font-size:13px; color:#475569; }
      .pos { color:#059669; } .neg { color:#dc2626; } .amber { color:#b45309; } .blue { color:#1d4ed8; }
      .two-col { display:grid; grid-template-columns:1.1fr .9fr; gap:14px; }
      table { width:100%; border-collapse:collapse; }
      th, td { padding:8px 0; border-bottom:1px solid #e2e8f0; text-align:left; font-size:13px; }
      th:last-child, td:last-child { text-align:right; }
      .badge { display:inline-block; padding:4px 8px; border-radius:999px; font-size:11px; font-weight:700; }
      .scenario-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px; }
      .scenario-card { border:1px solid #cbd5e1; border-radius:16px; padding:14px; }
      .scenario-title { margin:10px 0 8px; font-size:18px; font-weight:700; }
      .scenario-row { display:flex; justify-content:space-between; gap:12px; padding:7px 0; border-bottom:1px solid #e2e8f0; font-size:13px; }
      .scenario-row:last-child { border-bottom:none; }
    </style>
  </head>
  <body>
    <section class="page">
      <div class="head">
        <div>
          <div class="brand">EnergyROI · СЕС</div>
          <h1>Результат</h1>
        </div>
        <div class="meta">
          <div><strong>${scenario.name}</strong></div>
          <div>${now.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>
      <div class="cards">
        <div class="card">
          <div class="label">Генерація / LCOE</div>
          <div class="value blue">${fN(r.year1Gen, 0)}</div>
          <div class="subvalue">LCOE: ${fG(r.lcoe, 2)}</div>
        </div>
        <div class="card">
          <div class="label">Дохід / прибуток</div>
          <div class="value blue">${fM(r.totalRevenue, 2)}</div>
          <div class="subvalue ${r.net >= 0 ? 'pos' : 'neg'}">net: ${fM(r.net, 2)}</div>
        </div>
        <div class="card">
          <div class="label">Окупність</div>
          <div class="value ${r.pb ? (r.pb < 5 ? 'pos' : r.pb < 8 ? 'amber' : 'neg') : 'neg'}">${r.pb ? `${r.pb.toFixed(1)} р.` : '∞'}</div>
          <div class="subvalue">CAPEX ${fM(P.capex, 1)}</div>
        </div>
      </div>
      <div class="two-col">
        <div class="card">
          <h2>Економіка</h2>
          <table>
            <tr><td>Економія на власному споживанні</td><td class="pos">+${fM(r.savings, 2)}</td></tr>
            <tr><td>Продаж електроенергії (прямий)</td><td class="pos">+${fM(r.directExportRevenue, 2)}</td></tr>
            <tr><td>Продаж через резервування</td><td class="pos">+${fM(r.reserveExportRevenue, 2)}</td></tr>
            <tr><td><strong>Разом доходи</strong></td><td class="pos"><strong>+${fM(r.totalRevenue, 2)}</strong></td></tr>
            <tr><td>OPEX</td><td class="neg">-${fM(r.opexCost, 2)}</td></tr>
            <tr><td><strong>Чистий прибуток</strong></td><td class="${r.net >= 0 ? 'pos' : 'neg'}"><strong>${r.net >= 0 ? '+' : ''}${fM(r.net, 2)}</strong></td></tr>
          </table>
        </div>
        <div class="card">
          <h2>Енергетичні показники</h2>
          <table>
            <tr><td>Власне споживання</td><td>${fN(r.selfUseKwh, 0)} кВт·год</td></tr>
            <tr><td>Експорт прямий</td><td>${fN(r.directExportKwh, 0)} кВт·год</td></tr>
            <tr><td>В резервування (вхід)</td><td>${fN(r.reserveInKwh, 0)} кВт·год</td></tr>
            <tr><td>З резервування (вихід)</td><td>${fN(r.reserveOutKwh, 0)} кВт·год</td></tr>
            <tr><td>Втрати резервування</td><td>${fN(r.reserveLossKwh, 0)} кВт·год</td></tr>
          </table>
        </div>
      </div>
    </section>

    <section class="page">
      <div class="head">
        <div>
          <div class="brand">EnergyROI · СЕС</div>
          <h1>Генерація</h1>
        </div>
        <div class="meta">
          <div><strong>${scenario.name}</strong></div>
          <div>${now.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>
      <div class="cards">
        <div class="card">
          <div class="label">1-й рік</div>
          <div class="value blue">${fN(r.year1Gen, 0)}</div>
          <div class="subvalue">кВт·год</div>
        </div>
        <div class="card">
          <div class="label">15 років</div>
          <div class="value blue">${fN(r.yearly.reduce((sum, y) => sum + y.gen, 0), 0)}</div>
          <div class="subvalue">сукупна генерація</div>
        </div>
        <div class="card">
          <div class="label">Окупність</div>
          <div class="value ${r.pb ? 'pos' : 'neg'}">${r.pb ? `${r.pb.toFixed(1)} р.` : '∞'}</div>
          <div class="subvalue">по роках</div>
        </div>
      </div>
      <div class="card">
        <h2>Генерація по роках</h2>
        <table>
          <thead><tr><th>Рік</th><th>Генерація, кВт·год</th><th>Net, млн грн</th><th>Деградація</th></tr></thead>
          <tbody>
            ${r.yearly.map((y) => `<tr><td>${y.year}</td><td>${fN(y.gen, 0)}</td><td>${fM(y.net, 2)}</td><td>${fN((1 - y.degFactor) * 100, 2)}%</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <section class="page">
      <div class="head">
        <div>
          <div class="brand">EnergyROI · СЕС</div>
          <h1>Сценарії</h1>
        </div>
        <div class="meta">
          <div><strong>${scenario.name}</strong></div>
          <div>${now.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>
      <div class="scenario-grid">
        ${scenarios.map((item) => `
          <div class="scenario-card">
            <div class="badge" style="background:${item.bg};color:${item.tone};">${item.badge}</div>
            <div class="scenario-title">${item.title}</div>
            <div class="scenario-row"><span>Генерація / 1-й рік</span><strong>${fN(item.result.year1Gen, 0)} кВт·год</strong></div>
            <div class="scenario-row"><span>LCOE</span><strong>${fG(item.result.lcoe, 2)}</strong></div>
            <div class="scenario-row"><span>Net / рік</span><strong>${fM(item.result.net, 2)}</strong></div>
            <div class="scenario-row"><span>Окупність</span><strong>${item.result.pb ? `${item.result.pb.toFixed(1)} р.` : '∞'}</strong></div>
          </div>
        `).join('')}
      </div>
      <div class="card">
        <h2>Порівняльна таблиця</h2>
        <table>
          <thead>
            <tr><th></th>${scenarios.map((s) => `<th>${s.title.split(' ')[0]}</th>`).join('')}</tr>
          </thead>
          <tbody>
            <tr><td>Генерація, кВт·год</td>${scenarios.map((s) => `<td>${fN(s.result.year1Gen, 0)}</td>`).join('')}</tr>
            <tr><td>Дохід, млн</td>${scenarios.map((s) => `<td>${fM(s.result.totalRevenue, 2)}</td>`).join('')}</tr>
            <tr><td>Net, млн</td>${scenarios.map((s) => `<td>${fM(s.result.net, 2)}</td>`).join('')}</tr>
            <tr><td>Окупність</td>${scenarios.map((s) => `<td>${s.result.pb ? `${s.result.pb.toFixed(1)} р.` : '∞'}</td>`).join('')}</tr>
            <tr><td>LCOE</td>${scenarios.map((s) => `<td>${fG(s.result.lcoe, 2)}</td>`).join('')}</tr>
          </tbody>
        </table>
      </div>
    </section>
  </body>
  </html>`;
}

export function printSolarScenarioReport(scenario) {
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
