import React from 'react';
import { useSolar } from '../context/SolarContext.jsx';
import { fM, fN, fG } from '../../../shared/lib/formatters.js';

export default function SolarDashboardScreen() {
  const { P, result: r } = useSolar();

  const pbCls = r.pb ? (r.pb < 5 ? 'cg' : r.pb < 8 ? 'ca' : 'cr') : 'cr';
  const rows = [
    { n: 'Економія на власному споживанні', v: r.savings, pos: true },
    { n: 'Продаж електроенергії (прямий)', v: r.directExportRevenue, pos: true },
    { n: 'Продаж через резервування', v: r.reserveExportRevenue, pos: true },
    { n: 'Разом доходи', v: r.totalRevenue, pos: true, tot: true },
    { n: 'OPEX', v: -r.opexCost, pos: false },
    { n: 'Чистий прибуток', v: r.net, pos: r.net > 0, tot: true },
  ];

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="sec">Ключові показники</div>
        <div className="mg dashboard-mg-three">
          <div className="m">
            <div className="ml">Генерація / LCOE</div>
            <div className="dashboard-pair">
              <div>
                <div className="dashboard-pair-label">Генерація</div>
                <div className="mv cb">{fN(r.year1Gen, 0)}</div>
              </div>
              <div>
                <div className="dashboard-pair-label">LCOE</div>
                <div className="mv">{fG(r.lcoe, 2)}</div>
              </div>
            </div>
            <div className="dashboard-diff">
              <span className="dashboard-diff-label">кВт·год / 1-й рік</span>
              <span className="dashboard-diff-value cb">{fN(r.year1Gen / 1000, 0)}</span>
            </div>
          </div>

          <div className="m">
            <div className="ml">Дохід / Прибуток</div>
            <div className="mv cb">{fM(r.totalRevenue, 2)}</div>
            <div className={`ms ${r.net > 0 ? 'cg' : 'cr'}`}>net: {fM(r.net, 2)}</div>
          </div>

          <div className="m">
            <div className="ml">Окупність</div>
            <div className={`mv ${pbCls}`}>{r.pb ? `${r.pb.toFixed(1)} р.` : '∞'}</div>
            <div className="ms">CAPEX {fM(P.capex, 1)}</div>
          </div>
        </div>

        <div className="two-col-grid">
          <div>
            <div className="sec">Економіка</div>
            <div className="card" style={{ padding: 12 }}>
              {rows.map((row, i) => (
                <div key={i} className={`pnl-row${row.tot ? ' tot' : ''}`}>
                  <span className="pnl-n">{row.n}</span>
                  <span className="pnl-v" style={{ color: row.pos ? 'var(--green)' : 'var(--red)' }}>
                    {row.v >= 0 ? '+' : ''}{fM(row.v, 2)}
                  </span>
                  {!row.tot && (
                    <span className="pnl-pct">
                      {r.totalRevenue > 0 ? `${fN((Math.abs(row.v) / r.totalRevenue) * 100, 0)}%` : '—'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="sec">Енергетичні показники</div>
            <div className="card" style={{ padding: 12 }}>
              <div className="det-row"><span className="det-k">Власне споживання</span><span className="det-v">{fN(r.selfUseKwh, 0)} кВт·год</span></div>
              <div className="det-row"><span className="det-k">Експорт прямий</span><span className="det-v">{fN(r.directExportKwh, 0)} кВт·год</span></div>
              <div className="det-row"><span className="det-k">В резервування (вхід)</span><span className="det-v">{fN(r.reserveInKwh, 0)} кВт·год</span></div>
              <div className="det-row"><span className="det-k">З резервування (вихід)</span><span className="det-v">{fN(r.reserveOutKwh, 0)} кВт·год</span></div>
              <div className="det-row"><span className="det-k">Втрати резервування</span><span className="det-v">{fN(r.reserveLossKwh, 0)} кВт·год</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
