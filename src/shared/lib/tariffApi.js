const API_URL = import.meta.env.VITE_TARIFFS_API_URL;

async function fetchJson(url, options = {}) {
  const res = await fetch(url, { cache: 'no-store', ...options });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
  if (API_URL) candidates.push(API_URL);
  candidates.push('/api/tariffs');
  candidates.push('/.netlify/functions/tariffs');

  for (const endpoint of candidates) {
    try {
      const apiPayload = await fetchJson(endpoint);
      return normalizeFromApi(apiPayload);
    } catch {
      // try next candidate
    }
  }

  const localPayload = await fetchJson('/market-data.json');
  return normalizeFromLocal(localPayload);
}
