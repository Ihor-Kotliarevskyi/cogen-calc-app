# COGEN PWA

Простий React + Vite прогресивний веб-додаток (PWA) для калькулятора фінансів.

## 🚀 Структура

- `src/` — компоненти React
- `index.html` — основний HTML
- `vite.config.js` — налаштування Vite
- `public/` — статичні файли (наприклад `market-data.json`)
- `manifest.json` — PWA manifest
- `sw.js` — service worker для офлайн

## 🧰 Команди

```bash
npm install
npm run dev
npm run build
npm run preview
```

## ✔️ Як перевірити “від нуля” (локально)

```bash
rm -rf node_modules dist
npm install
npm run dev
```

Або для production-зборки:

```bash
npm run build
npx serve dist
```

## 🌐 Деплой

### Netlify (рекомендується)
1. Підключити репозиторій до Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Натиснути Deploy.

> Якщо у вас SPA та клієнтська маршрутизація, створіть у `dist` файл `_redirects`:
> ```
> /* /index.html 200
> ```

### Vercel
1. Підключити репозиторій до Vercel.
2. Build command: `npm run build`
3. Output Directory: `dist`
4. Deploy.

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Вкажіть 'dist' як public directory
firebase deploy
```

## 🧭 Примітки

- Якщо сайт не в корені домену (наприклад `/app/`) або деплоїте підпапку (GitHub Pages), додайте у `vite.config.js`:

```js
export default defineConfig({
  base: './', // або '/repo-name/' для GitHub Pages
  plugins: [react()]
});
```

- `manifest.json` та PWA-іконки вже налаштовані для мобільного використання.

## Tariffs API proxy (Energy Map)

This project supports a server-side tariffs proxy to keep `ENERGYMAP_API_KEY` private and minimize API usage.

### Endpoints
- Vercel: `/api/tariffs`
- Netlify: `/.netlify/functions/tariffs`

### Behavior
- By default returns local `public/market-data.json` snapshot.
- If `ENERGYMAP_AUTO_SYNC=true`, server refreshes from Energy Map by TTL.
- Manual refresh: call `?refresh=1` with header `x-sync-token: <TARIFFS_SYNC_TOKEN>`.

### Required server env vars
- `ENERGYMAP_API_KEY`
- `ENERGYMAP_GAS_UUID`
- `ENERGYMAP_RDN_UUID`

### Optional server env vars
- `ENERGYMAP_GAS_VALUE_COLUMN` (default `1`)
- `ENERGYMAP_RDN_VALUE_COLUMN` (default `1`)
- `ENERGYMAP_AUTO_SYNC` (`false` by default)
- `ENERGYMAP_CACHE_TTL_HOURS` (default `24`)
- `TARIFFS_SYNC_TOKEN`
