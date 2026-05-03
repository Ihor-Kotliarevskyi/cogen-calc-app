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

### Поведінка

- За замовчуванням повертається локальний `public/market-data.json`.
- Якщо `ENERGYMAP_AUTO_SYNC=true`, проксі оновлює дані з Energy Map за TTL.
- Примусове оновлення: `?refresh=1` + заголовок `x-sync-token: <TARIFFS_SYNC_TOKEN>`.

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
- `ENERGYMAP_GREEN_TARIFF_VALUE_COLUMN` (default: `1`)
- `ENERGYMAP_AUTO_SYNC` (default: `false`)
- `ENERGYMAP_CACHE_TTL_HOURS` (default: `24`)
- `TARIFFS_SYNC_TOKEN`

## Локальна перевірка з Netlify deploy

Якщо сайт вже задеплоєний на Netlify, можна локально запускати тільки фронтенд, а API викликати на проді:

```env
VITE_TARIFFS_API_URL=https://<your-site>.netlify.app/.netlify/functions/tariffs
```

Після цього `npm run dev` працюватиме з віддаленою serverless функцією.

## Примітка про 429

При вичерпанні ліміту Energy Map (`HTTP 429`) UI показує явний статус:

`API limit reached (429). Показані локальні дані market-data.json.`
