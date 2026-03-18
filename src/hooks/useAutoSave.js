import { useEffect, useRef } from 'react';
import { saveCurrentState } from '../lib/scenarioStorage.js';

/**
 * Auto-saves parameter state P to localStorage with debounce.
 * @param {object} P - current parameters
 * @param {number} delay - debounce delay in ms (default 1000)
 */
export function useAutoSave(P, delay = 1000) {
  const timerRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip saving on first render (initial load)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      saveCurrentState(P);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [P, delay]);
}
