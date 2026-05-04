import React from 'react';
import { useCalc } from '../context/CogenContext.jsx';
import { fN, fM, fG } from '../../../shared/lib/formatters.js';

export default function DashboardScreen() {
  const { P, result: r } = useCalc();

  const diff = r.ep - r.ecg;
  const diffCls = diff >= 0 ? 'cg' : 'cr';
  const pbCls = r.pb ? (r.pb < 4 ? 'cg' : r.pb < 7 ? 'ca' : 'cr') : 'cr';

  const rows = [
    { n: 'Економія на купівлі електрики', v: r.eSav, pos: true },
    { n: 'Продаж тепла в мережу', v: r.hRev, pos: true },
    { n: 'Економія ГВП', v: r.hIS, pos: true },
    { n: 'Разом доходи', v: r.tot, pos: true, tot: true },
    { n: 'Витрати на газ', v: -r.gCost, pos: false },
    { n: 'OPEX (ТО, персонал)', v: -r.opex, pos: false },
    { n: 'Чистий прибуток', v: r.net, pos: r.net > 0, tot: true },
  ];

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="sec">Ключові показники</div>
        <div className="mg dashboard-mg-three">
          <div className="m">
            <div className="ml">Собівартість / Мережа</div>
            <div className="dashboard-pair">
              <div>
                <div className="dashboard-pair-label">Собівартість</div>
                <div className="mv">{fG(r.ecg)}</div>
              </div>
              <div>
                <div className="dashboard-pair-label">Ціна мережі</div>
                <div className="mv">{fG(r.ep)}</div>
              </div>
            </div>
            <div className="dashboard-diff">
              <span className="dashboard-diff-label">Різниця</span>
              <span className={`dashboard-diff-value ${diffCls}`}>{diff >= 0 ? '+' : ''}{fG(diff)}</span>
            </div>
          </div>

          <div className="m">
            <div className="ml">Дохід / Прибуток</div>
            <div className="mv cb">{fM(r.tot)}</div>
            <div className={`ms ${r.net > 0 ? 'cg' : 'cr'}`}>net: {fM(r.net)}</div>
          </div>

          <div className="m">
            <div className="ml">Окупність</div>
            <div className={`mv ${pbCls}`}>{r.pb ? r.pb.toFixed(1) + ' р.' : '∞'}</div>
            <div className="ms">CAPEX {fM(P.capex, 0)}</div>
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
                    {row.v >= 0 ? '+' : ''}{fM(row.v)}
                  </span>
                  {!row.tot && (
                    <span className="pnl-pct">{fN((Math.abs(row.v) / Math.max(r.tot, 1)) * 100, 0)}%</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="sec">Паливо та режим</div>
            <div className="card" style={{ padding: 12 }}>
              <div className="det-row">
                <span className="det-k">Витрата газу</span>
                <span className="det-v">{r.gm3.toFixed(1)} м³/год</span>
              </div>
              <div className="det-row">
                <span className="det-k">Річна витрата</span>
                <span className="det-v">{fN(r.gAnn / 1000, 1)} тис. м³</span>
              </div>
              <div className="det-row">
                <span className="det-k">Вартість газу/рік</span>
                <span className="det-v cr">{fM(r.gCost)}</span>
              </div>
              <div className="det-row">
                <span className="det-k">Електричний ККД</span>
                <span className="det-v">{fN(P.eff * 100, 0)}%</span>
              </div>
              <div className="det-row">
                <span className="det-k">Теплова потужність</span>
                <span className="det-v">{P.thMW.toFixed(1)} МВт</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
