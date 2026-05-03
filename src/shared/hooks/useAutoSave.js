import { useEffect, useRef } from 'react';
import { saveCurrentState } from '../lib/scenarioStorage.js';

export function useAutoSave(P, mode = 'cogen', delay = 1000) {
  const timerRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      saveCurrentState(P, mode);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [P, mode, delay]);
}
