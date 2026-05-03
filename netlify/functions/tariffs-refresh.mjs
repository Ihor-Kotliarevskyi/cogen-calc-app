import { getTariffSnapshot } from '../../server/tariffsService.mjs';

export const config = {
  schedule: '0 3 1,15 * *',
};

export default async () => {
  try {
    const { snapshot, meta } = await getTariffSnapshot({ forceSync: true });

    return new Response(
      JSON.stringify({
        ok: true,
        triggeredBy: 'netlify-schedule',
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
        ok: false,
        error: 'Scheduled tariffs refresh failed',
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
