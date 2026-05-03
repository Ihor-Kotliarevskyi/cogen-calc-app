import { DEF } from './calc.js';
import { fetchTariffSnapshot } from '../../../shared/lib/tariffApi.js';

/**
 * Fetch market defaults from API (if configured) with fallback to market-data.json.
 * Returns { defaults, meta } where meta has update date & sources.
 */
export async function fetchMarketDefaults() {
  try {
    const data = await fetchTariffSnapshot();
    const allDefaults = data.defaults || {};
    const { solar, ...cogenDefaults } = allDefaults;

    return {
      defaults: { ...DEF, ...cogenDefaults },
      meta: {
        updated: data.updated || null,
        region: data.region || null,
        sources: data.sources || {},
        apiStatus: data?.meta?.apiStatus || 'ok',
        fallback: data?.meta?.fallback || false,
        errorStatus: data?.meta?.errorStatus || null,
      },
    };
  } catch (err) {
    console.warn('[fetchDefaults] Помилка завантаження ринкових даних, використовуємо дефолти:', err.message);
    return {
      defaults: { ...DEF },
      meta: { updated: null, region: null, sources: {}, apiStatus: 'error', fallback: true, errorStatus: null },
    };
  }
}
