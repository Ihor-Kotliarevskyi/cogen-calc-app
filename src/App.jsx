import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CogenCalculator from './calculators/cogen/index.jsx';
import SolarCalculator from './calculators/solar/index.jsx';

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

  const clearMode = useCallback(() => {
    setMode(null);
    setModeInUrl(null);
  }, []);

  const landingCards = useMemo(
    () => [
      {
        key: 'cogen',
        title: '🔥 КГУ',
        subtitle: 'Когенерація',
        available: true,
      },
      {
        key: 'solar',
        title: '☀️ СЕС',
        subtitle: 'Сонячна електростанція',
        available: true,
      },
    ],
    []
  );

  if (!mode) {
    return (
      <div className="app" style={{ justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '920px' }}>
          <div className="scr-title" style={{ marginBottom: '18px' }}>Калькулятор окупності енергетики</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {landingCards.map((card) => (
              <button
                key={card.key}
                className="card"
                style={{ textAlign: 'left', cursor: card.available ? 'pointer' : 'not-allowed', opacity: card.available ? 1 : 0.6 }}
                onClick={() => card.available && selectMode(card.key)}
                disabled={!card.available}
              >
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>{card.title}</div>
                <div style={{ color: 'var(--text2)' }}>{card.subtitle}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'cogen') {
    return <CogenCalculator calcMode={mode} onModeChange={selectMode} />;
  }

  if (mode === 'solar') {
    return <SolarCalculator calcMode={mode} onModeChange={selectMode} />;
  }

  return null;
}


