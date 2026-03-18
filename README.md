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
