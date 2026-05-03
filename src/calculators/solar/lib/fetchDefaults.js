import { DEF } from './calc.js';

export async function fetchSolarDefaults() {
  try {
    const response = await fetch('/market-data.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const solar = data?.defaults?.solar ?? {};

    return {
      defaults: {
        ...DEF,
        ...solar,
      },
      meta: {
        updated: data?.updated ?? null,
        region: data?.region ?? null,
        sources: data?.sources?.solar ?? {},
      },
    };
  } catch {
    return {
      defaults: { ...DEF },
      meta: { updated: null, region: null, sources: {} },
    };
  }
}
