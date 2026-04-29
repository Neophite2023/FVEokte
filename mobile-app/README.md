# FVE Mobile App (V1)

Mobilna web aplikacia (React + Vite + TypeScript + PWA) urcena na hostovanie cez GitHub Pages.

## Spustenie lokalne

```bash
cd mobile-app
npm install
npm run dev
```

## Testy

```bash
npm run test
```

## E2E testy (Playwright)

```bash
npx playwright install firefox
npm run test:e2e
```

## Build

```bash
npm run build
```

## Poznamky k V1

- Data klientov a vysledkov sa ukladaju iba lokalne (IndexedDB).
- Ak OKTE blokuje browser CORS, stale funguje manualny upload CSV vo formulari analyzy.
- Deploy zabezpecuje workflow `deploy-mobile-pages.yml`.

## OKTE automaticky na GitHub Pages

Ak chces automaticke stahovanie OKTE dat (bez manualneho CSV), pouzi malu proxy vrstvu:

1. Nasad Cloudflare Worker zo suboru `proxy/cloudflare-worker.js`.
2. Ziskaj URL endpointu vo formate `https://tvoj-worker.workers.dev/okte`.
3. V appke nastav `VITE_OKTE_PROXY_URL` (volitelne, pre vlastny endpoint):
   - skopiruj `.env.example` na `.env`
   - nastav `VITE_OKTE_PROXY_URL=https://tvoj-worker.workers.dev/okte`
4. Buildni a nasad appku na GitHub Pages.

Poznamka: ak `.env` nenastavis, appka pouzije predvoleny endpoint
`https://okte-proxy.neophite.workers.dev/okte`.

Potom appka stahuje OKTE data cez proxy a analyza bezi automaticky.
