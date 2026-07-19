# 🎯 AtaDey — Atasözü & Deyim Oyunu

> Atasözleri ve deyimlerle Türkçe bilgini test et! Anlamını ver, doğru atasözünü/deyimi bul — ya da tam tersi.

**🔗 Canlı Site:** [selcukozdemir23.github.io/deyimatasozoyunu](https://selcukozdemir23.github.io/deyimatasozoyunu/)

---

## ✨ Özellikler

- **İki Oyun Modu:** "Anlamdan Söze" ve "Sözden Anlama"
- **📚 1000+ atasözü & deyim** — statik JSON'dan lazy-load ile yüklenir, API ya da veritabanı gerekmez
- **🎨 Modern Arayüz:** Tailwind CSS + shadcn/ui ile karanlık/aydınlık tema desteği
- **⚡ Tamamen İstemci Tarafı:** Firebase veya sunucu çağrısı yok, hızlı çalışır
- **📊 Yerel Skor Tablosu:** `localStorage` ile oyun ilerlemesi kaydedilir
- **📱 Duyarlı Tasarım:** Mobil ve masaüstünde sorunsuz çalışır

---

## 🚀 Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Prodüksiyon build'i oluştur
npm run build

# Build'i önizle
npm run preview
```

## 📁 Proje Yapısı

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

## 🛠️ Script'ler

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | TypeScript kontrolü + Vite build |
| `npm run preview` | Build önizleme |
| `npm test` | Testleri çalıştır |
| `npm run lint` | ESLint ile kod kalite kontrolü |

## 🧪 Test

```bash
# Tüm testleri çalıştır
npm test

# Testleri izleme modunda çalıştır
npm run test:watch

# Test kapsama raporu
npm run test:coverage
```

---

**Geliştirici:** [Selçuk Özdemir](https://github.com/selcukozdemir23)
