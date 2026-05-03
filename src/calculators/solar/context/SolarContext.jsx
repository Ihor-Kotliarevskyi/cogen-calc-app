import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { DEF, calc } from '../lib/calc.js';
import { fetchSolarDefaults } from '../lib/fetchDefaults.js';
import { loadCurrentState } from '../../../shared/lib/scenarioStorage.js';

const SolarContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PARAM':
      return { ...state, [action.key]: action.value };
    case 'RESET':
      return { ...action.defaults };
    case 'LOAD_STATE':
      return { ...DEF, ...action.state };
    default:
      return state;
  }
}

export function SolarProvider({ children }) {
  const [P, dispatch] = useReducer(reducer, { ...DEF });
  const [marketMeta, setMarketMeta] = useState({ updated: null, region: null, sources: {} });
  const [marketDefaults, setMarketDefaults] = useState({ ...DEF });
  const [loading, setLoading] = useState(true);
  const result = useMemo(() => calc(P), [P]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const saved = loadCurrentState('solar');
      if (saved && !cancelled) {
        dispatch({ type: 'LOAD_STATE', state: saved });
      }

      const { defaults, meta } = await fetchSolarDefaults();
      if (!cancelled) {
        setMarketDefaults(defaults);
        setMarketMeta(meta);

        if (!saved) {
          dispatch({ type: 'LOAD_STATE', state: defaults });
        }

        setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetToDefaults = () => dispatch({ type: 'RESET', defaults: marketDefaults });

  return (
    <SolarContext.Provider value={{ P, dispatch, result, marketMeta, loading, resetToDefaults }}>
      {children}
    </SolarContext.Provider>
  );
}

export function useSolar() {
  const ctx = useContext(SolarContext);
  if (!ctx) throw new Error('useSolar must be used within SolarProvider');
  return ctx;
}
