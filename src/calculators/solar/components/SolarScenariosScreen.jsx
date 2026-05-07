import React from 'react';
import { useSolar } from '../context/SolarContext.jsx';
import { calc } from '../lib/calc.js';
import { fG, fM, fN } from '../../../shared/lib/formatters.js';

export default function SolarScenariosScreen() {
  const { P, result, dispatch } = useSolar();

  const buildScenario = (overrides) => calc({ ...P, ...overrides });
  const scenarios = [
    {
      title: 'Консервативний',
      shortTitle: 'Консерват.',
      badge: 'Низькі ринкові ціни',
      bc: 'var(--bg3)',
      tc: 'var(--text2)',
      overrides: { feedInTariff: 2.5, gridPrice: 6.2 },
      result: buildScenario({ feedInTariff: 2.5, gridPrice: 6.2 }),
    },
    {
      title: 'Базовий (поточний)',
      shortTitle: 'Базовий',
      badge: 'Ваші параметри',
      bc: 'var(--green-bg)',
      tc: 'var(--green)',
      overrides: {},
      result,
      best: true,
    },
    {
      title: 'Self-use фокус',
      shortTitle: 'Self-use',
      badge: 'Більше власного споживання',
      bc: 'var(--blue-bg)',
      tc: 'var(--blue)',
      overrides: { selfUseShare: 0.8, degradation: 0.6 },
      result: buildScenario({ selfUseShare: 0.8, degradation: 0.6 }),
    },
    {
      title: 'Піковий продаж',
      shortTitle: 'Піковий',
      badge: 'Вищий дохід від резервування',
      bc: 'var(--amber-bg)',
      tc: 'var(--amber)',
      overrides: { reserveShare: 0.5, reservePeakPremium: 2.4, feedInTariff: 4.8 },
      result: buildScenario({ reserveShare: 0.5, reservePeakPremium: 2.4, feedInTariff: 4.8 }),
    },
  ];

  const metrics = [
    { label: 'Генерація, кВт·год', format: (r) => fN(r.year1Gen, 0) },
    { label: 'Дохід, млн', format: (r) => fM(r.totalRevenue, 2) },
    { label: 'Net, млн', format: (r) => fM(r.net, 2) },
    { label: 'Окупність', format: (r) => (r.pb ? `${r.pb.toFixed(1)} р.` : '∞') },
    { label: 'LCOE', format: (r) => fG(r.lcoe, 2) },
  ];

  const applyScenario = (overrides) => {
    Object.entries(overrides).forEach(([key, value]) => {
      dispatch({ type: 'SET_PARAM', key, value });
    });
  };

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="sc-cards-grid">
          {scenarios.map((scenario) => (
            <div key={scenario.title} className={`card${scenario.best ? ' best' : ''}`}>
              <div className="sc-card-head">
                <div className="sc-title">{scenario.title}</div>
                <div className="sc-badge" style={{ background: scenario.bc, color: scenario.tc }}>{scenario.badge}</div>
              </div>

              <div className="sc-row">
                <span className="sc-k">Генерація / 1-й рік</span>
                <span className="sc-v">{fN(scenario.result.year1Gen, 0)} кВт·год</span>
              </div>
              <div className="sc-row">
                <span className="sc-k">LCOE</span>
                <span className="sc-v">{fG(scenario.result.lcoe, 2)}</span>
              </div>
              <div className="sc-row">
                <span className="sc-k">Net / рік</span>
                <span className="sc-v" style={{ color: scenario.result.net > 0 ? 'var(--green)' : 'var(--red)' }}>{fM(scenario.result.net, 2)}</span>
              </div>
              <div className="sc-row">
                <span className="sc-k">Окупність</span>
                <span className="sc-v" style={{ color: scenario.result.pb ? (scenario.result.pb < 5 ? 'var(--green)' : 'var(--amber)') : 'var(--red)' }}>
                  {scenario.result.pb ? `${scenario.result.pb.toFixed(1)} р.` : '∞'}
                </span>
              </div>

              {!scenario.best && (
                <div className="saved-card-actions">
                  <button className="btn-secondary" onClick={() => applyScenario(scenario.overrides)}>Застосувати</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sec comparison-table-desktop">Порівняльна таблиця</div>

        <div className="card comparison-table comparison-table-desktop" style={{ padding: 12 }}>
          <table className="st">
            <thead>
              <tr>
                <th></th>
                {scenarios.map((scenario) => (
                  <th key={scenario.title} style={{ color: scenario.tc, fontSize: 10 }}>{scenario.shortTitle}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => (
                <tr key={metric.label}>
                  <td>{metric.label}</td>
                  {scenarios.map((scenario) => (
                    <td key={`${scenario.title}-${metric.label}`}>{metric.format(scenario.result)}</td>
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
