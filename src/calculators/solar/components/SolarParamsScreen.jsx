import React from 'react';
import { useSolar } from '../context/SolarContext.jsx';

const SLIDERS = [
  { key: 'pvMW', label: 'Потужність СЕС, МВт', min: 0.1, max: 20, step: 0.1 },
  { key: 'specificYield', label: 'Питомий виробіток, кВт·год/кВт·рік', min: 800, max: 1800, step: 10 },
  { key: 'degradation', label: 'Деградація, %/рік', min: 0.1, max: 2.0, step: 0.1 },
  { key: 'selfUseShare', label: 'Частка власного споживання', min: 0, max: 1, step: 0.05 },
  { key: 'gridPrice', label: 'Ціна заміщення з мережі, грн/кВт·год', min: 2, max: 12, step: 0.1 },
  { key: 'feedInTariff', label: 'Тариф продажу в мережу, грн/кВт·год', min: 1, max: 10, step: 0.1 },
  { key: 'capex', label: 'CAPEX, грн', min: 2000000, max: 800000000, step: 500000 },
  { key: 'opex', label: 'OPEX, % від CAPEX/рік', min: 0.2, max: 5, step: 0.1 },
];

export default function SolarParamsScreen() {
  const { P, dispatch } = useSolar();

  return (
    <div className="screen active">
      <div className="page-wrap">
        <div className="title-row">
          <div className="scr-title">Параметри СЕС</div>
          <button className="reset-btn" onClick={() => dispatch({ type: 'RESET' })}>Скинути</button>
        </div>
        <div className="card">
          <div className="sr-head"><span className="sr-label">Назва проєкту</span></div>
          <input
            type="text"
            className="project-input"
            value={P.projectName}
            onChange={(e) => dispatch({ type: 'SET_PARAM', key: 'projectName', value: e.target.value })}
          />
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          {SLIDERS.map((s) => (
            <div className="sr" key={s.key}>
              <div className="sr-head">
                <span className="sr-label">{s.label}</span>
                <span className="sr-val">{typeof P[s.key] === 'number' ? P[s.key].toLocaleString('uk-UA') : P[s.key]}</span>
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
