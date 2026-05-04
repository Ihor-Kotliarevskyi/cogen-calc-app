import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CogenCalculator from './calculators/cogen/index.jsx';
import SolarCalculator from './calculators/solar/index.jsx';
import Icon from './shared/components/Icon.jsx';

const MODES = ['cogen', 'solar'];

function readModeFromUrl() {
  const mode = new URLSearchParams(window.location.search).get('mode');
  if (!mode) return null;
  return MODES.includes(mode) ? mode : null;
}

function setModeInUrl(mode) {
  const url = new URL(window.location.href);
  if (mode) {
    url.searchParams.set('mode', mode);
  } else {
    url.searchParams.delete('mode');
  }
  window.history.pushState({}, '', url);
}

export default function App() {
  const [mode, setMode] = useState(() => readModeFromUrl());

  useEffect(() => {
    const onPopState = () => setMode(readModeFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const selectMode = useCallback((nextMode) => {
    setMode(nextMode);
    setModeInUrl(nextMode);
  }, []);

  const landingCards = useMemo(
    () => [
      {
        key: 'cogen',
        title: 'КГУ',
        subtitle: 'Когенераційна установка',
        meta: 'Електрика, тепло, газ',
        icon: 'factory',
        available: true,
      },
      {
        key: 'solar',
        title: 'СЕС',
        subtitle: 'Сонячна електростанція',
        meta: 'Електрика, сонячні панелі, батареї',
        icon: 'sun',
        available: true,
      },
    ],
    []
  );

  if (!mode) {
    return (
      <div className="landing-shell">
        <div className="landing-window">
          <div className="landing-brand-row">
            <div className="landing-brand">
              <span className="brand-logo brand-logo-rich brand-logo-xl" aria-hidden="true"><span><Icon name="chart" className="landing-eyebrow-icon" /></span></span>
              <div>
                <div className="landing-brand-title">EnergyROI</div>
                <div className="landing-brand-sub">Економіка енергопроєктів</div>
              </div>
            </div>
          </div>

          <div className="landing-content">
            <div className="landing-copy-block">
              <h1 className="landing-title">Оберіть модель та переходьте до розрахунку.</h1>
              <p className="landing-copy">
                Актуальні тарифи, зручне введення параметрів та швидка оцінка собівартості та окупності.
              </p>
            </div>

            <div className="landing-cards landing-cards-compact">
              {landingCards.map((card) => (
                <button
                  key={card.key}
                  className={`landing-card${card.available ? '' : ' disabled'}`}
                  onClick={() => card.available && selectMode(card.key)}
                  disabled={!card.available}
                >
                  <div className="landing-card-icon">
                    <Icon name={card.icon} />
                  </div>
                  <div className="landing-card-body">
                    <div className="landing-card-title">{card.title}</div>
                    <div className="landing-card-subtitle">{card.subtitle}</div>
                    <div className="landing-card-meta">{card.meta}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'cogen') return <CogenCalculator calcMode={mode} onModeChange={selectMode} />;
  if (mode === 'solar') return <SolarCalculator calcMode={mode} onModeChange={selectMode} />;
  return null;
}
