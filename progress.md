# Progress - 2026-04-28

## Dokoncene dnes

- Vytvorena nova mobilna web appka v `mobile-app` (React + Vite + TypeScript + PWA).
- Implementovane obrazovky:
  - Klienti
  - Nova analyza
  - Historia
  - Detail vysledku
- Migracia jadra analyzy z Python appky do frontend logiky:
  - normalizacia mesta
  - nacitanie OKTE dat
  - nacitanie Open-Meteo predikcie
  - vypocet blokov a zisku
- Nahradena SQLite perzistencia za IndexedDB (`clients`, `dailyResults`).
- Pridany fallback import OKTE CSV v pripade CORS/problemu API.
- Doplneny deploy workflow pre GitHub Pages.
- Doplneny test stack:
  - unit testy (vitest)
  - E2E testy (Playwright, Firefox viewport 360/430)
- E2E testy uspesne presli: 6/6.
- Po testovani bol Playwright Firefox odinstalovany.

## OKTE / Proxy stav

- Nasadena Cloudflare Worker proxy logika (`mobile-app/proxy/cloudflare-worker.js`).
- Pridany `wrangler.toml`.
- Cloudflare login cez wrangler bol uspesne dokonceny.
- `workers.dev` subdomena je nastavena (`okte-proxy.neophite.workers.dev`).
- V appke je podpora proxy endpointu cez `VITE_OKTE_PROXY_URL`.
- Doplnena detekcia OKTE outage stranky:
  - ak OKTE vrati "temporarily not available", appka vypise jasnu hlasku.

## Aktualny stav

- Aplikacia je spustitelna lokalne (`npm run dev`).
- Build prechadza (`npm run build`).
- Pri dostupnom OKTE bude automaticky fetch fungovat cez proxy.
- Pri docasnom vypadku OKTE je pouzitelny fallback CSV upload.
