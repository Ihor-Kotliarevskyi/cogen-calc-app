import React from 'react';
import { useCalc } from '../context/CalcContext.jsx';
import { fN } from '../lib/calc.js';

export default function BalanceScreen() {
  const { P, result: r } = useCalc();

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="scr-title" style={{ marginBottom: 16 }}>Баланси</div>

        {/* Два баланси — ліво/право на tablet+ */}
        <div className="two-col-grid">

          {/* ── Лівa: Тепловий баланс ── */}
          <div>
            <div className="sec">Тепловий баланс</div>
            <div className="ib blue">
              <b>Тепло КГУ:</b> ГВП 0,15 МВт + мережа {r.thG.toFixed(2)} МВт.
              Влітку мережа бере: <b>{P.sh === 0 ? 'нічого' : P.sh === 0.5 ? '50%' : 'повністю'}</b>.
              Річний продаж: <b>{fN(r.gcT, 0)} Гкал</b>.
            </div>
            <div className="card" style={{ padding: 12 }}>
              <table className="bt">
                <thead>
                  <tr><th>Показник</th><th>Зима</th><th>Літо</th><th>Рік</th></tr>
                </thead>
                <tbody>
                  <tr><td>Виробництво КГУ, МВт</td><td>1,10</td><td>1,10</td><td>1,10</td></tr>
                  <tr><td>ГВП (внутр.), МВт</td><td>0,15</td><td>0,15</td><td>0,15</td></tr>
                  <tr>
                    <td>В мережу, МВт</td>
                    <td style={{ color: 'var(--green)' }}>{r.thG.toFixed(2)}</td>
                    <td style={{ color: 'var(--green)' }}>{(r.thG * P.sh).toFixed(2)}</td>
                    <td style={{ color: 'var(--green)' }}>{(((r.gcW + r.gcS) / r.h) * 1.163).toFixed(2)}</td>
                  </tr>
                  <tr className="tot">
                    <td>В мережу, тис. Гкал</td>
                    <td>{fN(r.gcW / 1000, 1)}</td>
                    <td>{fN(r.gcS / 1000, 1)}</td>
                    <td>{fN(r.gcT / 1000, 1)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mg" style={{ marginTop: 4 }}>
              <div className="m">
                <div className="ml">тепло в мережу</div>
                <div className="mv cg">{fN(r.gcT, 0)}</div>
                <div className="ms">Гкал / рік</div>
              </div>
              <div className="m">
                <div className="ml">дохід від тепла</div>
                <div className="mv cg">{fN(r.hRev / 1e6, 1)}</div>
                <div className="ms">млн грн / рік</div>
              </div>
            </div>
          </div>

          {/* ── Права: Електричний баланс ── */}
          <div>
            <div className="sec">Електричний баланс</div>
            <div className={`ib ${r.iW > 0 ? 'amber' : 'blue'}`}>
              <b>Зима:</b> {r.lW.toFixed(2)} МВт{' '}
              {r.iW > 0
                ? <><>{' → '}</><b>дефіцит {r.iW.toFixed(2)} МВт з мережі</b></>
                : ' → КГУ покриває повністю'
              }.{' '}
              <b>Літо:</b> {r.lS.toFixed(2)} МВт{' '}
              {r.iS > 0
                ? ` → дефіцит ${r.iS.toFixed(2)} МВт`
                : ` → надлишок ${r.sS.toFixed(2)} МВт`
              }.
            </div>
            <div className="card" style={{ padding: 12 }}>
              <table className="bt">
                <thead>
                  <tr><th>Показник</th><th>Зима</th><th>Літо</th><th>Рік</th></tr>
                </thead>
                <tbody>
                  <tr><td>Виробництво КГУ, МВт</td><td>1,00</td><td>1,00</td><td>1,00</td></tr>
                  <tr>
                    <td>Навантаження (база+VRF)</td>
                    <td>{r.lW.toFixed(2)}</td>
                    <td>{r.lS.toFixed(2)}</td>
                    <td>{((r.lW * r.hW + r.lS * r.hS) / r.h).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>КГУ покриває, МВт</td>
                    <td style={{ color: 'var(--green)' }}>{r.cW.toFixed(2)}</td>
                    <td style={{ color: 'var(--green)' }}>{r.cS.toFixed(2)}</td>
                    <td style={{ color: 'var(--green)' }}>{(r.ks / r.h / 1000).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>З мережі, МВт</td>
                    <td style={{ color: r.iW > 0 ? 'var(--red)' : 'var(--text3)' }}>
                      {r.iW > 0 ? r.iW.toFixed(2) : '—'}
                    </td>
                    <td style={{ color: r.iS > 0 ? 'var(--red)' : 'var(--text3)' }}>
                      {r.iS > 0 ? r.iS.toFixed(2) : '—'}
                    </td>
                    <td>—</td>
                  </tr>
                  <tr className="tot">
                    <td>Збережено, млн кВт·год</td>
                    <td>{fN((r.cW * r.hW) / 1000, 1)}</td>
                    <td>{fN((r.cS * r.hS) / 1000, 1)}</td>
                    <td style={{ color: 'var(--green)' }}>{fN(r.ks / 1e6, 1)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mg" style={{ marginTop: 4 }}>
              <div className="m">
                <div className="ml">річна генерація</div>
                <div className="mv cb">{fN(r.kGen / 1e6, 2)}</div>
                <div className="ms">млн кВт·год</div>
              </div>
              <div className="m">
                <div className="ml">економія на ел.</div>
                <div className="mv cg">{fN(r.eSav / 1e6, 1)}</div>
                <div className="ms">млн грн / рік</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
