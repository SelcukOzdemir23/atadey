# AtaDey — Atasözü & Deyim Oyunu

<div align="center">
  <br />
  <p>
    <a href="https://selcukozdemir23.github.io/atadey/" target="_blank">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/canl%C4%B1%20site-atadey-blue?style=for-the-badge&logo=github&label=Canl%C4%B1%20Site">
        <img alt="Canlı Site" src="https://img.shields.io/badge/canl%C4%B1%20site-atadey-blue?style=for-the-badge&logo=github">
      </picture>
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Test-Vitest-6E9F18?style=flat-square&logo=vitest" alt="Vitest" />
  </p>
</div>

Atasözleri ve deyimlerle Türkçe bilgini test et. İki farklı oyun moduyla hem eğlen hem öğren.

---

## Oyun Modları

- **Anlamdan Söze** — Verilen anlama uygun atasözünü/deyimi bul
- **Sözden Anlama** — Verilen atasözü/deyimin anlamını bul

## Özellikler

- 1000+ atasözü ve deyim — statik JSON'dan lazy-load, API gerekmez
- Tailwind CSS + shadcn/ui ile karanlık/aydınlık tema
- Tamamen istemci tarafı — Firebase yok, hızlı çalışır
- localStorage ile yerel skor kaydı
- Mobil ve masaüstünde duyarlı tasarım

## Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusu
npm run dev

# Prodüksiyon build'i
npm run build

# Build önizleme
npm run preview
```

## Proje Yapısı

```
src/
├── components/     # UI ve oyun bileşenleri
├── hooks/          # React hooks
├── lib/            # Yardımcı fonksiyonlar
├── test/           # Test dosyaları
├── types.ts        # TypeScript tipleri
├── utils.ts        # Oyun mantığı
└── App.tsx         # Ana uygulama bileşeni

public/data/
├── atasozleri.json # Atasözü verileri
└── deyimler.json   # Deyim verileri
```

## Script'ler

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | TypeScript kontrolü + Vite build |
| `npm run preview` | Build önizleme |
| `npm test` | Testleri çalıştır |
| `npm run lint` | ESLint kod kalite kontrolü |
| `npm run test:coverage` | Test kapsama raporu |

## Test

```bash
# Tüm testleri çalıştır
npm test

# Testleri izleme modunda çalıştır
npm run test:watch
```

---

Geliştirici: [Selçuk Özdemir](https://github.com/selcukozdemir23)
