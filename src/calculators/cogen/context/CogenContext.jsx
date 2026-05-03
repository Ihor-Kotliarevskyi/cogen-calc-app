import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { DEF, calc } from '../lib/calc.js';
import { fetchMarketDefaults } from '../lib/fetchDefaults.js';
import { loadCurrentState } from '../../../shared/lib/scenarioStorage.js';

const CogenContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PARAM':
      return { ...state, [action.key]: action.value };
    case 'SET_SH':
      return { ...state, sh: action.value };
    case 'RESET':
      return { ...action.defaults };
    case 'LOAD_STATE':
      return { ...DEF, ...action.state };
    default:
      return state;
  }
}

export function CogenProvider({ children }) {
  const [P, dispatch] = useReducer(reducer, { ...DEF });
  const [marketMeta, setMarketMeta] = useState({ updated: null, region: null, sources: {} });
  const [marketDefaults, setMarketDefaults] = useState({ ...DEF });
  const [loading, setLoading] = useState(true);
  const result = useMemo(() => calc(P), [P]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const saved = loadCurrentState('cogen');
      if (saved && !cancelled) {
        dispatch({ type: 'LOAD_STATE', state: saved });
      }

      const { defaults, meta } = await fetchMarketDefaults();
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

  const resetToDefaults = () => {
    dispatch({ type: 'RESET', defaults: marketDefaults });
  };

  return (
    <CogenContext.Provider value={{ P, result, dispatch, marketMeta, marketDefaults, resetToDefaults, loading }}>
      {children}
    </CogenContext.Provider>
  );
}

export function useCalc() {
  const ctx = useContext(CogenContext);
  if (!ctx) throw new Error('useCalc must be used within CogenProvider');
  return ctx;
}

