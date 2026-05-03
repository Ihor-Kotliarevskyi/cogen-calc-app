const API_URL = import.meta.env.VITE_TARIFFS_API_URL;

class TariffApiError extends Error {
  constructor(message, status, endpoint) {
    super(message);
    this.name = 'TariffApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, { cache: 'no-store', ...options });
  if (!res.ok) throw new TariffApiError(`HTTP ${res.status}`, res.status, url);
  return res.json();
}

function normalizeFromLocal(data) {
  return {
    updated: data?.updated ?? null,
    region: data?.region ?? null,
    sources: data?.sources ?? {},
    defaults: data?.defaults ?? {},
  };
}

function normalizeFromApi(data) {
  return {
    updated: data?.updated ?? null,
    region: data?.region ?? null,
    sources: data?.sources ?? {},
    defaults: data?.defaults ?? data?.tariffs ?? {},
  };
}

export async function fetchTariffSnapshot() {
  const candidates = [];
  let lastError = null;
  if (API_URL) candidates.push(API_URL);
  candidates.push('/api/tariffs');
  candidates.push('/.netlify/functions/tariffs');

  for (const endpoint of candidates) {
    try {
      const apiPayload = await fetchJson(endpoint);
      return {
        ...normalizeFromApi(apiPayload),
        meta: {
          apiStatus: 'ok',
          fallback: false,
        },
      };
    } catch (err) {
      lastError = err;
      // try next candidate
    }
  }

  const localPayload = await fetchJson('/market-data.json');
  return {
    ...normalizeFromLocal(localPayload),
    meta: {
      apiStatus: lastError?.status === 429 ? 'rate_limited' : 'fallback',
      fallback: true,
      errorStatus: lastError?.status ?? null,
      errorMessage: lastError?.message ?? null,
      endpoint: lastError?.endpoint ?? null,
    },
  };
}
