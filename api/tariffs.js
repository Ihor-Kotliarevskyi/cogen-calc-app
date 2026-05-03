import { getTariffSnapshot } from '../server/tariffsService.mjs';

export default async function handler(req, res) {
  try {
    const refreshRequested = String(req.query?.refresh || '') === '1';
    const adminToken = process.env.TARIFFS_SYNC_TOKEN;
    const canForce =
      refreshRequested &&
      adminToken &&
      req.headers['x-sync-token'] &&
      req.headers['x-sync-token'] === adminToken;

    const { snapshot, meta } = await getTariffSnapshot({ forceSync: canForce });

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      updated: snapshot.updated ?? null,
      region: snapshot.region ?? null,
      sources: snapshot.sources ?? {},
      defaults: snapshot.defaults ?? {},
      meta,
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to load tariff snapshot',
      message: err?.message || 'unknown error',
    });
  }
}
