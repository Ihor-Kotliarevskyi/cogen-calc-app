import React from 'react';
import { useSolar } from '../context/SolarContext.jsx';
import { calc } from '../lib/calc.js';
import { fG, fM, fN } from '../../../shared/lib/formatters.js';

export default function SolarScenariosScreen() {
  const { P, result: r, dispatch } = useSolar();

  const sc = (ov) => calc({ ...P, ...ov });
  const scenarios = [
    {
      title: 'Консервативний',
      badge: 'Низькі ринкові ціни',
      bc: 'var(--bg3)',
      tc: 'var(--text2)',
      P: { feedInTariff: 2.5, gridPrice: 6.2 },
      r: sc({ feedInTariff: 2.5, gridPrice: 6.2 }),
    },
    {
      title: 'Базовий (поточний)',
      badge: 'Ваші параметри',
      bc: 'var(--green-bg)',
      tc: 'var(--green)',
      P: {},
      r,
      best: true,
    },
    {
      title: 'Self-use фокус',
      badge: 'Більше власного споживання',
      bc: 'var(--blue-bg)',
      tc: 'var(--blue)',
      P: { selfUseShare: 0.8, degradation: 0.6 },
      r: sc({ selfUseShare: 0.8, degradation: 0.6 }),
    },
    {
      title: 'Піковий продаж',
      badge: 'Вищий дохід від резервування',
      bc: 'var(--amber-bg)',
      tc: 'var(--amber)',
      P: { reserveShare: 0.5, reservePeakPremium: 2.4, feedInTariff: 4.8 },
      r: sc({ reserveShare: 0.5, reservePeakPremium: 2.4, feedInTariff: 4.8 }),
    },
  ];

  const applyScenario = (overrides) => {
    Object.entries(overrides).forEach(([key, value]) => {
      dispatch({ type: 'SET_PARAM', key, value });
    });
  };

  const metrics = [
    { l: 'Генерація, кВт·год', f: (s) => fN(s.year1Gen, 0) },
    { l: 'Дохід, млн', f: (s) => fM(s.totalRevenue, 2) },
    { l: 'Net, млн', f: (s) => fM(s.net, 2) },
    { l: 'Окупність', f: (s) => (s.pb ? `${s.pb.toFixed(1)} р.` : '∞') },
    { l: 'LCOE', f: (s) => fG(s.lcoe, 2) },
  ];

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="sc-cards-grid">
          {scenarios.map((s, i) => (
            <div key={i} className={`card${s.best ? ' best' : ''}`}>
              <div className="sc-badge" style={{ background: s.bc, color: s.tc }}>{s.badge}</div>
              <div className="sc-title">{s.title}</div>
              <div className="sc-row">
                <span className="sc-k">Генерація / 1-й рік</span>
                <span className="sc-v">{fN(s.r.year1Gen, 0)} кВт·год</span>
              </div>
              <div className="sc-row">
                <span className="sc-k">LCOE</span>
                <span className="sc-v">{fG(s.r.lcoe, 2)}</span>
              </div>
              <div className="sc-row">
                <span className="sc-k">Net / рік</span>
                <span className="sc-v" style={{ color: s.r.net > 0 ? 'var(--green)' : 'var(--red)' }}>{fM(s.r.net, 2)}</span>
              </div>
              <div className="sc-row">
                <span className="sc-k">Окупність</span>
                <span className="sc-v" style={{ color: s.r.pb ? (s.r.pb < 5 ? 'var(--green)' : 'var(--amber)') : 'var(--red)' }}>
                  {s.r.pb ? `${s.r.pb.toFixed(1)} р.` : '∞'}
                </span>
              </div>
              {!s.best && (
                <div className="saved-card-actions">
                  <button className="btn-secondary" onClick={() => applyScenario(s.P)}>Застосувати</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sec">Порівняльна таблиця</div>
        <div className="card" style={{ padding: 12 }}>
          <table className="st">
            <thead>
              <tr>
                <th></th>
                {scenarios.map((s, i) => (
                  <th key={i} style={{ color: s.tc, fontSize: 10 }}>{s.title.split(' ')[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, mi) => (
                <tr key={mi}>
                  <td>{m.l}</td>
                  {scenarios.map((s, si) => (
                    <td key={si}>{m.f(s.r)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
