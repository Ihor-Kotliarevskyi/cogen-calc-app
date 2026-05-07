# EnergyROI Calc

React + Vite PWA для розрахунку окупності енергетичних проєктів:

- КГУ
- СЕС

## Структура

- `src/` — фронтенд застосунку
- `public/market-data.json` — локальний snapshot тарифів
- `api/tariffs.js` — Vercel endpoint для читання тарифів і optional force refresh
- `api/tariffs-refresh.js` — Vercel endpoint для cron/manual refresh
- `netlify/functions/tariffs.mjs` — Netlify endpoint для читання тарифів і optional force refresh
- `netlify/functions/tariffs-refresh.mjs` — Netlify scheduled refresh endpoint
- `server/tariffsService.mjs` — спільна логіка fetch/cache/persistence тарифів
- `vercel.json` — cron-конфіг для Vercel

## Команди

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Режими в URL

- `?mode=cogen` — калькулятор КГУ
- `?mode=solar` — калькулятор СЕС
- порожній або невірний `mode` — стартовий екран

## Tariffs API Proxy

Проксі потрібен, щоб:

- не світити `ENERGYMAP_API_KEY` у фронтенді
- не ходити напряму з браузера в Energy Map
- мати кешований snapshot тарифів
- мати ручний і автоматичний refresh

### Endpoints

- Vercel current snapshot: `/api/tariffs`
- Vercel refresh endpoint: `/api/tariffs-refresh`
- Netlify current snapshot: `/.netlify/functions/tariffs`
- Netlify refresh endpoint: `/.netlify/functions/tariffs-refresh`

### Як працює snapshot

Логіка в [server/tariffsService.mjs](/d:/Documents/myProjects/energyroi-calc/server/tariffsService.mjs):

- спочатку читається локальний `public/market-data.json`
- якщо є persisted snapshot, він має пріоритет
- якщо дозволений sync, дані оновлюються з Energy Map
- після успішного sync snapshot зберігається у storage платформи

### Persistence по платформах

- Vercel: `Vercel Blob` через `BLOB_READ_WRITE_TOKEN`
- Netlify: `@netlify/blobs`
- якщо storage не налаштований, застосунок все одно працює з локальним `market-data.json`

### Auto refresh

- Vercel: cron налаштований у [vercel.json](/d:/Documents/myProjects/energyroi-calc/vercel.json)
- Netlify: schedule налаштований у [netlify/functions/tariffs-refresh.mjs](/d:/Documents/myProjects/energyroi-calc/netlify/functions/tariffs-refresh.mjs)
- поточний графік: `0 3 1,15 * *` (UTC), тобто 2 рази на місяць

Рекомендована схема:

- `ENERGYMAP_AUTO_SYNC=false`
- оновлення робити cron-джобою або вручну

Тоді фронтенд не тягне API Energy Map при кожному запиті, а читає готовий snapshot.

## Ручний refresh

Є 2 варіанти.

### 1. Force refresh через основний endpoint

Повертає актуальний snapshot і, якщо переданий валідний токен, примусово робить sync.

- Vercel:
  `GET /api/tariffs?refresh=1`
- Netlify:
  `GET /.netlify/functions/tariffs?refresh=1`

Потрібний заголовок:

```txt
x-sync-token: <TARIFFS_SYNC_TOKEN>
```

Приклад для Vercel:

```powershell
curl "https://your-domain/api/tariffs?refresh=1" `
  -H "x-sync-token: YOUR_SYNC_TOKEN"
```

Приклад для Netlify:

```powershell
curl "https://your-domain/.netlify/functions/tariffs?refresh=1" `
  -H "x-sync-token: YOUR_SYNC_TOKEN"
```

### 2. Окремий refresh endpoint

Для Vercel є окремий endpoint:

- `GET /api/tariffs-refresh`

Він завжди робить `forceSync: true`, але потребує авторизацію.

Варіанти авторизації:

- `Authorization: Bearer <CRON_SECRET>` — для Vercel Cron Jobs
- `x-sync-token: <TARIFFS_SYNC_TOKEN>` — для ручного admin refresh

Приклад через `CRON_SECRET`:

```powershell
curl "https://your-domain/api/tariffs-refresh" `
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Приклад через `TARIFFS_SYNC_TOKEN`:

```powershell
curl "https://your-domain/api/tariffs-refresh" `
  -H "x-sync-token: YOUR_SYNC_TOKEN"
```

## Frontend lookup order

Фронтенд пробує джерела в такому порядку:

1. `/api/tariffs`
2. `/.netlify/functions/tariffs`
3. `VITE_TARIFFS_API_URL` якщо явно заданий
4. `/market-data.json` як fallback

Це описано в [src/shared/lib/tariffApi.js](/d:/Documents/myProjects/energyroi-calc/src/shared/lib/tariffApi.js).

## Environment Variables

### Обов’язкові server-side

- `ENERGYMAP_API_KEY`
- `ENERGYMAP_GAS_UUID`
- `ENERGYMAP_RDN_UUID`

### Опційні server-side

- `ENERGYMAP_HEAT_UUID`
- `ENERGYMAP_GREEN_TARIFF_UUID`
- `ENERGYMAP_GAS_VALUE_COLUMN`
- `ENERGYMAP_RDN_VALUE_COLUMN`
- `ENERGYMAP_HEAT_VALUE_COLUMN`
- `ENERGYMAP_GREEN_TARIFF_VALUE_COLUMN`
- `ENERGYMAP_RDN_FILTER_COLUMN`
- `ENERGYMAP_RDN_FILTER_VALUE`
- `ENERGYMAP_RDN_FILTER2_COLUMN`
- `ENERGYMAP_RDN_FILTER2_VALUE`
- `ENERGYMAP_HEAT_FILTER_COLUMN`
- `ENERGYMAP_HEAT_FILTER_VALUE`
- `ENERGYMAP_HEAT_FILTER2_COLUMN`
- `ENERGYMAP_HEAT_FILTER2_VALUE`
- `ENERGYMAP_GREEN_TARIFF_FILTER_COLUMN`
- `ENERGYMAP_GREEN_TARIFF_FILTER_VALUE`
- `ENERGYMAP_GREEN_TARIFF_FILTER2_COLUMN`
- `ENERGYMAP_GREEN_TARIFF_FILTER2_VALUE`
- `ENERGYMAP_HEAT_MANUAL_TARIFF`
- `ENERGYMAP_AUTO_SYNC`
- `ENERGYMAP_CACHE_TTL_HOURS`
- `TARIFFS_SYNC_TOKEN`
- `CRON_SECRET`
- `BLOB_READ_WRITE_TOKEN`

### Frontend env

- `VITE_TARIFFS_API_URL`

Зазвичай лишайте порожнім.

Його варто задавати лише якщо хочете явно примусити фронтенд ходити в зовнішній endpoint, наприклад під час локальної розробки проти remote Netlify deploy.

## Приклад `.env`

```env
VITE_TARIFFS_API_URL=

ENERGYMAP_API_KEY=YOUR_API_KEY
ENERGYMAP_GAS_UUID=268e6549-1232-4fbc-b2c1-61f61bc690f8
ENERGYMAP_RDN_UUID=c6218b35-ce7e-45c2-925e-5c8e6f5eb9fb
ENERGYMAP_GAS_VALUE_COLUMN=3
ENERGYMAP_RDN_VALUE_COLUMN=7
ENERGYMAP_RDN_FILTER_COLUMN=1
ENERGYMAP_RDN_FILTER_VALUE=ОЕС України (синхронізована з ENTSO-E)
ENERGYMAP_RDN_FILTER2_COLUMN=
ENERGYMAP_RDN_FILTER2_VALUE=

ENERGYMAP_HEAT_UUID=
ENERGYMAP_HEAT_VALUE_COLUMN=3
ENERGYMAP_HEAT_MANUAL_TARIFF=2500
ENERGYMAP_HEAT_FILTER_COLUMN=
ENERGYMAP_HEAT_FILTER_VALUE=
ENERGYMAP_HEAT_FILTER2_COLUMN=
ENERGYMAP_HEAT_FILTER2_VALUE=

ENERGYMAP_GREEN_TARIFF_UUID=eb7b9740-5e80-4f1a-b471-7f5b5fe9946c
ENERGYMAP_GREEN_TARIFF_VALUE_COLUMN=5
ENERGYMAP_GREEN_TARIFF_FILTER_COLUMN=2
ENERGYMAP_GREEN_TARIFF_FILTER_VALUE=споживач
ENERGYMAP_GREEN_TARIFF_FILTER2_COLUMN=3
ENERGYMAP_GREEN_TARIFF_FILTER2_VALUE=СЕС

ENERGYMAP_AUTO_SYNC=false
ENERGYMAP_CACHE_TTL_HOURS=24

BLOB_READ_WRITE_TOKEN=
CRON_SECRET=
TARIFFS_SYNC_TOKEN=YOUR_SYNC_TOKEN
```

Повний шаблон див. у [.env.example](/d:/Documents/myProjects/energyroi-calc/.env.example).

## Локальна розробка

### Локально з локальним snapshot

```env
VITE_TARIFFS_API_URL=
```

Тоді фронтенд пробуватиме локальні serverless endpoints і fallback на `market-data.json`.

### Локально проти Netlify production endpoint

```env
VITE_TARIFFS_API_URL=https://<your-site>.netlify.app/.netlify/functions/tariffs
```

### Локально проти Vercel production endpoint

```env
VITE_TARIFFS_API_URL=https://<your-site>.vercel.app/api/tariffs
```

## Примітка про 429

При вичерпанні ліміту Energy Map (`HTTP 429`) UI показує fallback-стан і працює з локальним snapshot:

`API limit reached (429). Показані локальні дані market-data.json.`
