import React from 'react';
import { useCalc } from '../context/CalcContext.jsx';
import { fN, fM, fG } from '../lib/calc.js';

export default function DashboardScreen() {
  const { P, result: r } = useCalc();

  const ecCls = r.ecg < r.ep ? 'cg' : 'cr';
  const pbCls = r.pb ? (r.pb < 4 ? 'cg' : r.pb < 7 ? 'ca' : 'cr') : 'cr';

  const rows = [
    { n: 'Економія на купівлі електрики', v: r.eSav, pos: true },
    { n: 'Продаж тепла в мережу', v: r.hRev, pos: true },
    { n: 'Економія ГВП', v: r.hIS, pos: true },
    { n: 'РАЗОМ ДОХОДИ', v: r.tot, pos: true, tot: true },
    { n: 'Витрати на газ', v: -r.gCost, pos: false },
    { n: 'OPEX (ТО, персонал)', v: -r.opex, pos: false },
    { n: 'ЧИСТИЙ ПРИБУТОК', v: r.net, pos: r.net > 0, tot: true },
  ];

  return (
    <div className="screen active">
      <div className="page-wrap">
        {/* Метрики — повна ширина (на tablet+ вже 4 колонки через .mg) */}
        <div className="mg">
          <div className="m">
            <div className="ml">собівартість ел.</div>
            <div className={`mv ${ecCls}`}>{fG(r.ecg)}</div>
            <div className="ms">мережа: {fG(r.ep)}</div>
          </div>
          <div className="m">
            <div className="ml">окупність</div>
            <div className={`mv ${pbCls}`}>{r.pb ? r.pb.toFixed(1) + ' р.' : '∞'}</div>
            <div className="ms">CAPEX {fM(P.capex, 0)}</div>
          </div>
          <div className="m">
            <div className="ml">дохід / рік</div>
            <div className="mv cb">{fM(r.tot)}</div>
            <div className="ms">ел. + тепло</div>
          </div>
          <div className="m">
            <div className="ml">прибуток / рік</div>
            <div className={`mv ${r.net > 0 ? 'cg' : 'cr'}`}>{fM(r.net)}</div>
            <div className="ms">{r.net > 0 ? 'після газу та OPEX' : 'збиток'}</div>
          </div>
        </div>

        {r.ecg >= r.ep && (
          <div className="ib amber">
            Собівартість генерації вища за ринкову ціну. Перевірте ціни газу або електрики.
          </div>
        )}

        {/* Двоколонковий layout: P&L зліва, Газ справа */}
        <div className="two-col-grid">

          <div>
            <div className="sec">P&L — доходи та витрати</div>
            <div className="card">
              {rows.map((row, i) => (
                <div key={i} className={`pnl-row${row.tot ? ' tot' : ''}`}>
                  <span className="pnl-n">{row.n}</span>
                  <span className="pnl-v" style={{ color: row.pos ? 'var(--green)' : 'var(--red)' }}>
                    {row.v >= 0 ? '+' : ''}{fM(row.v)}
                  </span>
                  {!row.tot && (
                    <span className="pnl-pct">{fN((Math.abs(row.v) / r.tot) * 100, 0)}%</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="sec">Газ</div>
            <div className="card">
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
                <span className="det-v" style={{ color: 'var(--red)' }}>{fM(r.gCost)}</span>
              </div>
              <div className="det-row">
                <span className="det-k">Собівартість кВт·год</span>
                <span className="det-v" style={{ color: r.ecg < r.ep ? 'var(--green)' : 'var(--red)' }}>
                  {fG(r.ecg)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
