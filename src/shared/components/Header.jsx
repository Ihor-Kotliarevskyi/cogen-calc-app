import React from 'react';

export default function Header({ calcMode, onModeChange, modes, subtitle }) {
  return (
    <div className="hdr">
      <div className="hdr-inner">
        <div className="hdr-brand">
          <div className="hdr-brand-name">
            <span className="brand-logo" aria-hidden="true"><span>ER</span></span>
            <span className="brand-text">EnergyROI</span>
          </div>
          <div className="hdr-brand-sub">{subtitle}</div>
        </div>

        <div className="mode-switcher">
          {modes.map((m) => (
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
      </div>
    </div>
  );
}
