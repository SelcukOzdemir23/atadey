# Atasözü ve Deyim Oyunu (Vite + React)

Bu klasör, mevcut Next.js uygulamasındaki arayüz ve oyun deneyimini birebir koruyarak, tamamen istemci taraflı çalışan Vite + React sürümünü içerir. Film replikleri yerine statik JSON dosyalarından yüklenen atasözü ve deyim verileri kullanılır.

## Başlangıç

> Not: Paketler henüz kurulmadı. Aşağıdaki adımlar `mvp` klasörü içinde çalıştırılmalıdır.

```bash
npm install
npm run dev
```

- `public/data/atasozleri.json` ve `public/data/deyimler.json` dosyaları lazy-load ile çekilir.
- Soru jenerasyonu istemci tarafında yapılır; Firestore veya API çağrısı bulunmaz.
- Yerel skor tablosu `localStorage` üzerinden tutulur.
- `ThemeToggle`, `Card`, `Button` gibi Tailwind + shadcn tabanlı bileşenler Next.js sürümünden kopyalanarak aynı görsel dili sağlar.

## Script'ler

- `npm run dev` – Geliştirme sunucusunu başlatır.
- `npm run build` – Uygulamanın prodüksiyon build'ini oluşturur.
- `npm run preview` – Build sonrası önizleme sunucusunu çalıştırır.
- `npm run lint` – ESLint kontrollerini çalıştırır.
