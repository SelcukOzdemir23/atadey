# Mimari

Tek sayfa, tamamen istemci tarafı. Sunucu, hesap, veritabanı yok.

```
index.html
└── src/main.tsx
    └── App.tsx                    ekran seçimi
        ├── components/menu/MenuScreen      kategori / oyun tipi / yön
        ├── components/game/GameScreen      ScoreStrip + soru + FeedbackBlock
        ├── components/result/ResultScreen  skor + paylaşma
        └── components/states/*             yükleniyor / hata

src/hooks/useGameRun.ts          oyun durumu (reducer) + veri istekleri
src/dataLoader.ts               veri yükleme + soru üretimi
public/data/*.json              üretilmiş veri (scripts/build-data.mjs)
```

## Durum modeli

Oyun kurallarının tamamı `useGameRun` içindeki tek bir reducer'da:

```
menu ──START──▶ loading ──LOADED──▶ playing ──NEXT (runOver)──▶ finished
  ▲                 │                  │                          │
  └───── MENU ──────┴──── FAILED ──▶ error ◀── RETRY ┘
```

- `START` seçimleri `run` olarak sabitler, sayaçları sıfırlar.
- `ANSWER` yalnızca cevaplanmamış soruda çalışır (çift tıklama koruması).
- `NEXT`, `runOver` doğruysa sonucu açar, değilse sonraki soruya geçer.
- `RETRY` aynı `run` ile sayaçları sıfırlar; `MENU` her şeyi başlangıca döndürür.

Bitiş koşulu ve buton metni **aynı** `runOver` alanından okunur:

```ts
runOver = format === "questions" ? answered >= 10 : mistakes >= 5
```

Bu yüzden “son soruda yanlış buton etiketi” türü bir kayma mümkün değil.

## Başlık modeli

Ekran başına tek `h1`: menüde kelime markası, oyunda sorunun kendisi (söz veya
anlam), sonuçta ekran okuyucuya görünen “Sonuç: N doğru cevap”. Menüdeki
“Oyun kurulumu” `h2`; oyun içinde başka başlık yok — başlık sırası atlamıyor.

## Veri yükleme sözleşmesi

`dataLoader.ts` üç işi yapar ve başka hiçbir şey yapmaz:

1. **Yükle** — kategori başına tek istek, sonuç promise olarak önbelleğe alınır;
   eşzamanlı çağrılar aynı isteği paylaşır.
2. **Oynanabilir havuzu kur** — birincil anlamı tek bir söze ait olan sözler
   ([docs/DATA.md](DATA.md)). Kural burada, tek yerde uygulanır.
3. **Soru üret** — dört farklı seçenek, tek doğru cevap, oyun içinde tekrarsız.

`Question` tipi yön ayrımını taşımaz; her iki yön de aynı alanları doldurur:

| Alan | Anlamı |
| --- | --- |
| `prompt` | Oyuncunun okuduğu metin (söz veya anlam) |
| `answer` | Doğru seçeneğin metni |
| `options` | Dört seçenek, karıştırılmış |
| `phrase` / `definition` | Sorunun dayandığı bütün giriş (geri bildirim için) |

Böylece geri bildirim ekranı “elimde hangi yarı var?” diye tahmin etmez; her
zaman sözü, anlamı ve varsa örneği gösterebilir.

## Katmanlar

| Katman | Sorumluluk | Bilmemesi gereken |
| --- | --- | --- |
| `scripts/build-data.mjs` | CSV → doğrulanmış JSON | UI, React |
| `src/dataLoader.ts` | Veri → soru | React, DOM |
| `src/hooks/useGameRun.ts` | Oyun kuralları ve akış | CSS, veri dosya biçimi |
| `src/components/**` | Sunum ve etkileşim | Veri kaynağı, skor kuralları |
| `src/App.tsx` | Ekran seçimi | Veri biçimi, CSS ayrıntıları |

## Test stratejisi

- **Veri kalitesi** (`src/test/dataQuality.test.ts`): üretilmiş dosyaların
  sözleşmesi (şema, boş/tag-only tanım, tekrar, başlık artığı) ve gerçek veri
  üzerinde 80 partilik soru üretimi; her soruda dört farklı seçenek.
- **Soru üretimi** (`src/test/dataLoader.test.ts`): belirsiz anlamlı sözlerin
  elenmesi, yön davranışı, önbellek, tekrarsız oyun, hata mesajları.
- **Uygulama** (`src/test/App.integration.test.tsx`): menü → oyun → geri
  bildirim → sonuç → menü akışı, klavye kısayolu, 5. yanlışta bitiş, hata
  ekranı.
- **Bileşen**: ayrı bileşen testi yok; davranış entegrasyon testinde ve
  tarayıcı denetiminde doğrulanıyor (kontrast, odak, duyuru).

Testler DOM metnine ve rollere bakar; sınıf adlarına bağlanmaz. Tasarım
değiştiğinde testlerin kırılmaması bunun içindir.

## Bilinçli kararlar

- **Yönlendirme kütüphanesi yok.** Dört ekran için router, geri tuşu
  davranışını ve derin bağlantıyı bedavaya getirmez; gerektiğinde eklenir.
- **Global state yönetimi yok.** Tek ekran ağacı, tek `App`. Prop drilling
  rahatsız edici olduğunda context'e geçilir.
- **Karanlık tema yok.** Palet tek: aydınlık “fihrist” yüzeyi. Tema eklemek
  bütün token setini ikiye katlar; ihtiyaç doğunca yapılır.
- **Veri build zamanında üretilir**, çalışma anında dönüştürülmez: aynı girdi
  aynı oyunu verir, test edilebilir kalır.
