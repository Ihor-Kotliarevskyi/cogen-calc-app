import React from 'react';
import { useSolar } from '../context/SolarContext.jsx';
import { fN } from '../../../shared/lib/formatters.js';

const SLIDERS = [
  { key: 'pvMW', label: 'Потужність СЕС, МВт', min: 0.1, max: 20, step: 0.1, fmt: (v) => `${v.toFixed(1)} МВт` },
  { key: 'specificYield', label: 'Питомий виробіток, кВт·год/кВт·рік', min: 800, max: 1800, step: 10, fmt: (v) => `${fN(v, 0)} кВт·год` },
  { key: 'degradation', label: 'Деградація, %/рік', min: 0.1, max: 2, step: 0.1, fmt: (v) => `${v.toFixed(1)}%` },
  { key: 'selfUseShare', label: 'Частка власного споживання', min: 0, max: 1, step: 0.05, fmt: (v) => `${(v * 100).toFixed(0)}%` },
  { key: 'gridPrice', label: 'Ціна заміщення з мережі, грн/кВт·год', min: 2, max: 12, step: 0.1, fmt: (v) => `${v.toFixed(2)} грн` },
  { key: 'feedInTariff', label: 'Тариф продажу, грн/кВт·год', min: 1, max: 10, step: 0.1, fmt: (v) => `${v.toFixed(2)} грн` },
  { key: 'reserveShare', label: 'Частка генерації в резервування', min: 0, max: 1, step: 0.05, fmt: (v) => `${(v * 100).toFixed(0)}%` },
  { key: 'reserveEfficiency', label: 'ККД циклу резервування', min: 0.5, max: 1, step: 0.01, fmt: (v) => `${(v * 100).toFixed(0)}%` },
  { key: 'reservePeakPremium', label: 'Премія пікового продажу, грн/кВт·год', min: 0, max: 6, step: 0.1, fmt: (v) => `${v.toFixed(2)} грн` },
  { key: 'capex', label: 'CAPEX, млн грн', min: 2e6, max: 800e6, step: 0.5e6, fmt: (v) => `${fN(v / 1e6, 1)} млн` },
  { key: 'opex', label: 'OPEX, % від CAPEX/рік', min: 0.2, max: 5, step: 0.1, fmt: (v) => `${v.toFixed(1)}%` },
];

export default function SolarParamsScreen() {
  const { P, dispatch, resetToDefaults, marketMeta } = useSolar();
  const showRateLimit = marketMeta?.apiStatus === 'rate_limited' || marketMeta?.errorStatus === 429;

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="title-row">
          <button className="reset-btn" onClick={resetToDefaults}>Скинути</button>
        </div>

        <div className="sec">Налаштування проєкту</div>
        <div className="card">
          {showRateLimit && (
            <div className="ib amber" style={{ marginBottom: 12 }}>
              API limit reached (429). Показані локальні дані `market-data.json`.
            </div>
          )}

          <div className="project-settings-row">
            <div className="project-field">
              <div className="project-field-label">Назва проєкту</div>
              <input
                type="text"
                className="project-input"
                value={P.projectName}
                onChange={(e) => dispatch({ type: 'SET_PARAM', key: 'projectName', value: e.target.value })}
                placeholder="Введіть назву проєкту..."
              />
            </div>

            <div className="project-meta-grid">
              <div className="project-chip">
                <span className="project-chip-label">Тип</span>
                <span className="project-chip-value">СЕС · {P.pvMW.toFixed(1)} МВт</span>
              </div>
              <div className="project-chip">
                <span className="project-chip-label">Оновлено</span>
                <span className="project-chip-value">{marketMeta.updated || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sec">Установка СЕС</div>
        <div className="card">
          {SLIDERS.map((s) => (
            <div className="sr" key={s.key}>
              <div className="sr-head">
                <span className="sr-label">{s.label}</span>
                <span className="sr-val">{s.fmt(P[s.key])}</span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={P[s.key]}
                onInput={(e) => dispatch({ type: 'SET_PARAM', key: s.key, value: parseFloat(e.target.value) })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
