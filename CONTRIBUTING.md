# Katkı

Bu proje tek geliştiricili ama açık bir proje: sorular, düzeltmeler ve veri
katkıları memnuniyetle karşılanır.

## Başlamadan

```bash
npm ci
npm run dev   # http://localhost:5173/atadey/
```

## Kısa kurallar

- **Tip güvenliği:** `strict` açık; `any` yerine gerçek tip yaz.
- **Test:** davranış değiştiyse test de değişir. Veri kuralı değiştiyse
  `src/test/dataQuality.test.ts` güncellenir.
- **Veri:** `public/data/*.json` elle düzenlenmez. `data/raw/*.csv` düzenlenir ve
  `npm run data:build` çalıştırılır; üretilen dosyalar commit'lenir.
- **Commit mesajı:** [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- **Kapsam:** bir PR tek bir işi yapsın. Büyük refactor'lar issue'da konuşulsun.

## Göndermeden önce

```bash
npm run lint && npm run typecheck && npm test && npm run data:check && npm run build
```

## Arayüz katkısı

Tasarım sistemi [docs/DESIGN.md](docs/DESIGN.md) içinde tanımlı. Yeni bir renk,
font veya boşluk ölçüsü eklemeden önce oraya bak; token dışında değer
kullanmamaya çalış. Klavye ile gezilebilirlik ve kontrast zorunlu.

## Veri katkısı

Bir sözün anlamı yanlışsa: `data/raw/*.csv` dosyasında ilgili satırı düzelt,
`npm run data:build` çalıştır, farkı commit'le. Kazıma artığı satırları elle
silmek yerine hattın kurallarına bak ([docs/DATA.md](docs/DATA.md)) — aynı hata
tekrar gelmesin.

## İletişim

Issue açmak en hızlı yol. Güvenlik veya kötüye kullanım için doğrudan
[Selçuk Özdemir](https://github.com/SelcukOzdemir23) ile iletişime geç.
