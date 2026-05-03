import React from 'react';
import { useCalc } from '../context/CalcContext.jsx';
import { fN } from '../lib/calc.js';
import { CALC_MODES } from '../lib/calcModes.js';

export default function Header({ calcMode, onModeChange }) {
  const { P, result, marketMeta } = useCalc();

  const sourceLabel = marketMeta.updated
    ? `оновлено ${marketMeta.updated}`
    : 'дефолтні дані';

  return (
    <div className="hdr">
      <div className="hdr-inner">

        {/* ── Бренд ── */}
        <div className="hdr-brand">
          <div className="hdr-brand-name">
            <span className="hdr-brand-icon">⚡</span>
            EnergyROI
          </div>
          <div className="hdr-brand-sub">
            <b>{P.projectName}</b> · {fN(result.h)} год/рік · КГУ {P.elMW} МВт
            {marketMeta.region && (
              <span className="hdr-region"> · {marketMeta.region}</span>
            )}
          </div>
        </div>

        {/* ── Перемикач режиму ── */}
        <div className="mode-switcher">
          {CALC_MODES.map((m) => (
            <button
              key={m.key}
              className={`mode-btn${calcMode === m.key ? ' active' : ''}${!m.available ? ' disabled' : ''}`}
              onClick={() => m.available && onModeChange(m.key)}
              title={!m.available ? 'Незабаром' : m.label}
              disabled={!m.available}
            >
              <span className="mode-btn-icon">{m.icon}</span>
              <span className="mode-btn-label">{m.label}</span>
              {!m.available && <span className="mode-btn-soon">soon</span>}
            </button>
          ))}
        </div>

        {/* ── Live статус ── */}
        <div className="live">
          <div className="live-dot"></div>
          <span className="live-label">{sourceLabel}</span>
        </div>

      </div>
    </div>
  );
}
