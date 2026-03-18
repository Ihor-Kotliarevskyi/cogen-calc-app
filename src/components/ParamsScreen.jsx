import React from 'react';
import { useCalc } from '../context/CalcContext.jsx';
import { fN } from '../lib/calc.js';

const SLIDERS = {
  prices: [
    { key: 'gp', label: 'Ціна газу, грн/тис.м³', min: 5000, max: 50000, step: 500, fmt: (v) => fN(v) + ' грн', tag: 'ринок', tc: 'var(--red)' },
    { key: 'rdm', label: 'РДН, грн/МВт·год', min: 1000, max: 20000, step: 100, fmt: (v) => fN(v) + ' грн', tag: 'волат.', tc: 'var(--red)' },
    { key: 'trans', label: 'Передача Укренерго, грн/МВт·год', min: 500, max: 5000, step: 100, fmt: (v) => fN(v) + ' грн', tag: 'НКРЕКП', tc: 'var(--text3)' },
    { key: 'distr', label: 'Розподіл Львівобленерго 2кл, грн/МВт·год', min: 1500, max: 4500, step: 100, fmt: (v) => fN(v) + ' грн', tag: 'НКРЕКП', tc: 'var(--text3)' },
  ],
  heat: [
    { key: 'hp', label: 'Ціна тепла в мережу, грн/Гкал', min: 500, max: 5000, step: 100, fmt: (v) => fN(v) + ' грн', tag: 'ЛТЕ', tc: 'var(--green)' },
  ],
  el: [
    { key: 'elB', label: 'Базове ел. навантаження (без VRF), МВт', min: 0.2, max: 1.2, step: 0.05, fmt: (v) => v.toFixed(2) + ' МВт' },
    { key: 'vrfW', label: 'VRF опалення взимку, МВт', min: 0.1, max: 1, step: 0.05, fmt: (v) => v.toFixed(2) + ' МВт' },
    { key: 'vrfS', label: 'VRF охолодження влітку, МВт', min: 0.1, max: 1.2, step: 0.05, fmt: (v) => v.toFixed(2) + ' МВт' },
  ],
  inv: [
    { key: 'capex', label: 'CAPEX «під ключ», млн грн', min: 20e6, max: 100e6, step: 1e6, fmt: (v) => fN(v / 1e6, 0) + ' млн', tag: 'орієнтир', tc: 'var(--amber)' },
    { key: 'opex', label: 'OPEX (ТО + персонал), % від CAPEX/рік', min: 5, max: 30, step: 1, fmt: (v) => v.toFixed(1) + '%' },
    { key: 'av', label: 'Коефіцієнт доступності КГУ', min: 0.5, max: 1, step: 0.01, fmt: (v) => `${v.toFixed(2)} → ${fN(Math.round(8760 * v))} год` },
  ],
};

function SliderRow({ slider, value, onChange }) {
  return (
    <div className="sr">
      <div className="sr-head">
        <span className="sr-label">
          {slider.label}
          {slider.tag && (
            <span className="tag" style={{ background: slider.tc + '22', color: slider.tc }}>
              {slider.tag}
            </span>
          )}
        </span>
        <span className="sr-val">{slider.fmt(value)}</span>
      </div>
      <input
        type="range"
        min={slider.min}
        max={slider.max}
        step={slider.step}
        value={value}
        onInput={(e) => onChange(slider.key, parseFloat(e.target.value))}
      />
    </div>
  );
}

function SliderGroup({ sliders, P, onChange, extra }) {
  return (
    <div className="card">
      {sliders.map((s) => (
        <SliderRow key={s.key} slider={s} value={P[s.key]} onChange={onChange} />
      ))}
      {extra}
    </div>
  );
}

export default function ParamsScreen() {
  const { P, dispatch, resetToDefaults } = useCalc();

  const onChange = (key, value) => {
    dispatch({ type: 'SET_PARAM', key, value });
  };

  const handleReset = () => {
    resetToDefaults();
  };

  const setSH = (v) => {
    dispatch({ type: 'SET_SH', value: v });
  };

  const pricesDerived = (
    <div className="derived">
      <span className="d-label">Кінцева ціна для БЦ</span>
      <span className="d-val">{((P.rdm + P.trans + P.distr) / 1000).toFixed(2)} грн/кВт·год</span>
    </div>
  );

  const heatExtra = (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
        Мережа бере тепло влітку?{' '}
        <span className="tag" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>ЛТЕ</span>
      </div>
      <div className="segs">
        <div className={`seg${P.sh === 0 ? ' active' : ''}`} onClick={() => setSH(0)}>Ні</div>
        <div className={`seg${P.sh === 0.5 ? ' active' : ''}`} onClick={() => setSH(0.5)}>50%</div>
        <div className={`seg${P.sh === 1 ? ' active' : ''}`} onClick={() => setSH(1)}>Так</div>
      </div>
    </div>
  );

  const elDerived = (
    <>
      <div className="derived">
        <span className="d-label">Зима: база + VRF</span>
        <span className="d-val">{(P.elB + P.vrfW).toFixed(2)} МВт</span>
      </div>
      <div className="derived" style={{ marginTop: 6 }}>
        <span className="d-label">Літо: база + VRF</span>
        <span className="d-val">{(P.elB + P.vrfS).toFixed(2)} МВт</span>
      </div>
    </>
  );

  return (
    <div className="screen active">
      <div className="title-row">
        <div className="scr-title">Параметри</div>
        <button className="reset-btn" onClick={handleReset}>Скинути</button>
      </div>
      <div className="sec">Ціни</div>
      <SliderGroup sliders={SLIDERS.prices} P={P} onChange={onChange} extra={pricesDerived} />
      <div className="sec">Тепло в мережу</div>
      <SliderGroup sliders={SLIDERS.heat} P={P} onChange={onChange} extra={heatExtra} />
      <div className="sec">Електричне навантаження БЦ</div>
      <SliderGroup sliders={SLIDERS.el} P={P} onChange={onChange} extra={elDerived} />
      <div className="sec">Інвестиції</div>
      <SliderGroup sliders={SLIDERS.inv} P={P} onChange={onChange} />
    </div>
  );
}
