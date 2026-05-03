# EnergyROI Calc (COGEN + Solar)

React + Vite PWA для розрахунку окупності енергетичних проєктів (КГУ та СЕС).

## Структура

- `src/` — код застосунку
- `public/market-data.json` — локальний snapshot тарифів
- `api/tariffs.js` — Vercel serverless endpoint
- `netlify/functions/tariffs.mjs` — Netlify serverless endpoint
- `server/tariffsService.mjs` — спільна логіка завантаження/кешування тарифів

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
- порожній/невірний `mode` — стартовий екран

## Tariffs API Proxy (Energy Map)

Проксі потрібен, щоб не світити `ENERGYMAP_API_KEY` у фронтенді та економити ліміти API.

### Endpoints

- Vercel: `/api/tariffs`
- Netlify: `/.netlify/functions/tariffs`
- Netlify scheduled refresh function: `/.netlify/functions/tariffs-refresh`

### Поведінка

- За замовчуванням повертається локальний `public/market-data.json`.
- Якщо `ENERGYMAP_AUTO_SYNC=true`, проксі оновлює дані з Energy Map за TTL.
- Примусове оновлення: `?refresh=1` + заголовок `x-sync-token: <TARIFFS_SYNC_TOKEN>`.
- Після успішного sync snapshot зберігається в Netlify Blobs і переживає cold starts.

### Обов'язкові env (server-side)

- `ENERGYMAP_API_KEY`
- `ENERGYMAP_GAS_UUID`
- `ENERGYMAP_RDN_UUID`

### Опційні env

- `ENERGYMAP_HEAT_UUID`
- `ENERGYMAP_GREEN_TARIFF_UUID`
- `ENERGYMAP_GAS_VALUE_COLUMN` (default: `1`)
- `ENERGYMAP_RDN_VALUE_COLUMN` (default: `1`)
- `ENERGYMAP_HEAT_VALUE_COLUMN` (default: `1`)
- `ENERGYMAP_HEAT_MANUAL_TARIFF` (if set, overrides heat API and skips heat download)
- `ENERGYMAP_GREEN_TARIFF_VALUE_COLUMN` (default: `1`)
- `ENERGYMAP_AUTO_SYNC` (default: `false`)
- `ENERGYMAP_CACHE_TTL_HOURS` (default: `24`)
- `TARIFFS_SYNC_TOKEN`

### Row filters for ambiguous datasets

For datasets with multiple categories/regions in one CSV (RDN, heat, green tariff), you can filter rows before reading the latest value.

- `*_FILTER_COLUMN` / `*_FILTER_VALUE` — first filter
- `*_FILTER2_COLUMN` / `*_FILTER2_VALUE` — optional second filter

Matching is case-insensitive and uses `contains`.

Example:

```env
# RDN: use OES Ukraine average
ENERGYMAP_RDN_VALUE_COLUMN=7
ENERGYMAP_RDN_FILTER_COLUMN=1
ENERGYMAP_RDN_FILTER_VALUE=ОЕС України

# Heat: use region + consumer type
ENERGYMAP_HEAT_VALUE_COLUMN=3
ENERGYMAP_HEAT_MANUAL_TARIFF=
ENERGYMAP_HEAT_FILTER_COLUMN=1
ENERGYMAP_HEAT_FILTER_VALUE=Львівська
ENERGYMAP_HEAT_FILTER2_COLUMN=2
ENERGYMAP_HEAT_FILTER2_VALUE=населення

# Green tariff: use generation type + producer type
ENERGYMAP_GREEN_TARIFF_VALUE_COLUMN=5
ENERGYMAP_GREEN_TARIFF_FILTER_COLUMN=3
ENERGYMAP_GREEN_TARIFF_FILTER_VALUE=СЕС
ENERGYMAP_GREEN_TARIFF_FILTER2_COLUMN=2
ENERGYMAP_GREEN_TARIFF_FILTER2_VALUE=домогосподарство
```

### Recommended `.env` for your current setup (enterprise-focused)

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

# Heat: manual tariff for enterprises (grn/Gcal)
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
TARIFFS_SYNC_TOKEN=YOUR_SYNC_TOKEN
```

For Netlify scheduled refresh every ~2 weeks, use:

```env
ENERGYMAP_AUTO_SYNC=false
```

`tariffs-refresh` runs by cron `0 3 1,15 * *` (UTC) and forces sync from API.

## Локальна перевірка з Netlify deploy

Якщо сайт вже задеплоєний на Netlify, можна локально запускати тільки фронтенд, а API викликати на проді:

```env
VITE_TARIFFS_API_URL=https://<your-site>.netlify.app/.netlify/functions/tariffs
```

Після цього `npm run dev` працюватиме з віддаленою serverless функцією.

## Примітка про 429

При вичерпанні ліміту Energy Map (`HTTP 429`) UI показує явний статус:

`API limit reached (429). Показані локальні дані market-data.json.`
