import React, { createContext, useContext, useReducer, useMemo, useEffect, useState } from 'react';
import { DEF, calc } from '../lib/calc.js';
import { fetchMarketDefaults } from '../lib/fetchDefaults.js';
import { loadCurrentState } from '../lib/scenarioStorage.js';

const CalcContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PARAM':
      return { ...state, [action.key]: action.value };
    case 'SET_SH':
      return { ...state, sh: action.value };
    case 'RESET':
      return { ...action.defaults };
    case 'LOAD_STATE':
      return { ...action.state };
    default:
      return state;
  }
}

export function CalcProvider({ children }) {
  const [P, dispatch] = useReducer(reducer, { ...DEF });
  const [marketMeta, setMarketMeta] = useState({ updated: null, region: null, sources: {} });
  const [marketDefaults, setMarketDefaults] = useState({ ...DEF });
  const [loading, setLoading] = useState(true);
  const result = useMemo(() => calc(P), [P]);

  // On mount: (1) try localStorage, (2) fetch market data, (3) fallback to DEF
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // First try to restore saved state
      const saved = loadCurrentState();
      if (saved) {
        if (!cancelled) {
          dispatch({ type: 'LOAD_STATE', state: saved });
        }
      }

      // Always fetch market defaults (for reset + meta display)
      const { defaults, meta } = await fetchMarketDefaults();
      if (!cancelled) {
        setMarketDefaults(defaults);
        setMarketMeta(meta);

        // If no saved state, use market defaults
        if (!saved) {
          dispatch({ type: 'LOAD_STATE', state: defaults });
        }

        setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Reset now uses market defaults instead of hardcoded DEF
  const resetToDefaults = () => {
    dispatch({ type: 'RESET', defaults: marketDefaults });
  };

  return (
    <CalcContext.Provider value={{ P, result, dispatch, marketMeta, marketDefaults, resetToDefaults, loading }}>
      {children}
    </CalcContext.Provider>
  );
}

export function useCalc() {
  const ctx = useContext(CalcContext);
  if (!ctx) throw new Error('useCalc must be used within CalcProvider');
  return ctx;
}
