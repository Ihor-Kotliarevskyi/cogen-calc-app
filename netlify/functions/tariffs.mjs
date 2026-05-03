import { getTariffSnapshot } from '../../server/tariffsService.mjs';

export default async (req) => {
  try {
    const url = new URL(req.url);
    const refreshRequested = url.searchParams.get('refresh') === '1';
    const adminToken = process.env.TARIFFS_SYNC_TOKEN;
    const headerToken = req.headers.get('x-sync-token');
    const canForce = refreshRequested && adminToken && headerToken === adminToken;

    const { snapshot, meta } = await getTariffSnapshot({ forceSync: canForce });

    return new Response(
      JSON.stringify({
        updated: snapshot.updated ?? null,
        region: snapshot.region ?? null,
        sources: snapshot.sources ?? {},
        defaults: snapshot.defaults ?? {},
        meta,
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Failed to load tariff snapshot',
        message: err?.message || 'unknown error',
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
      }
    );
  }
};
