import { DEF } from './calc.js';
import { fetchTariffSnapshot } from '../../../shared/lib/tariffApi.js';

export async function fetchSolarDefaults() {
  try {
    const data = await fetchTariffSnapshot();
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
