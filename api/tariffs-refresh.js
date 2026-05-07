import { getTariffSnapshot } from '../server/tariffsService.mjs';

function isAuthorized(req) {
  const authHeader = req.headers?.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  const adminToken = process.env.TARIFFS_SYNC_TOKEN;
  if (adminToken && req.headers['x-sync-token'] === adminToken) return true;

  return false;
}

export default async function handler(req, res) {
  if (!isAuthorized(req)) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  try {
    const { snapshot, meta } = await getTariffSnapshot({ forceSync: true });

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      ok: true,
      updated: snapshot.updated ?? null,
      region: snapshot.region ?? null,
      sources: snapshot.sources ?? {},
      defaults: snapshot.defaults ?? {},
      meta,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: 'Scheduled tariffs refresh failed',
      message: err?.message || 'unknown error',
    });
  }
}
