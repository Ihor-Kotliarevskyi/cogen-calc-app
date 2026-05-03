import React from 'react';

export default function Header({ calcMode, onModeChange, modes, brand, subtitle, sourceLabel }) {
  return (
    <div className="hdr">
      <div className="hdr-inner">
        <div className="hdr-brand">
          <div className="hdr-brand-name">
            <span className="hdr-brand-icon">⚡</span>
            {brand}
          </div>
          <div className="hdr-brand-sub">
            <b>{subtitle}</b>
          </div>
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

        <div className="live">
          <div className="live-dot"></div>
          <span className="live-label">{sourceLabel}</span>
        </div>
      </div>
    </div>
  );
}
