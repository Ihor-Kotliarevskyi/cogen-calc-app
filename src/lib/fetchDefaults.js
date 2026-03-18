import { DEF } from './calc.js';

/**
 * Fetch market defaults from market-data.json.
 * Falls back to hardcoded DEF on any error.
 * Returns { defaults, meta } where meta has update date & sources.
 */
export async function fetchMarketDefaults() {
  try {
    const res = await fetch('/market-data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      defaults: { ...DEF, ...data.defaults },
      meta: {
        updated: data.updated || null,
        region: data.region || null,
        sources: data.sources || {},
      },
    };
  } catch (err) {
    console.warn('[fetchDefaults] Помилка завантаження ринкових даних, використовуємо дефолти:', err.message);
    return {
      defaults: { ...DEF },
      meta: { updated: null, region: null, sources: {} },
    };
  }
}
