# Tasarım sistemi — “Fihrist”

> Durum: uygulandı (Faz 2). Bu dosya uygulamanın tek tasarım kaynağıdır:
> token'lar bu listeden gelir, bileşenler ham değer kullanmaz. Ölçülen
> kontrast değerleri ve doğrulama listesi dosyanın sonunda.

## Fikir

Oyunun malzemesi bir sözlük. Arayüz de bir **fihrist**: madde numarası, ince
çizgi, kâğıt yüzey, mürekkep metin. Dekor yok — okunacak şey metnin kendisi.

İki cümlelik kural:

1. **Söz sahnededir.** Atasözü/deyim ekranın en büyük ve tek serif öğesidir.
2. **Her çizgi bir işe yarar.** Süs kutusu, gölge yığını, yüzen leke yok.

## Tipografi

İki aile, tek sistem: **IBM Plex Serif** (madde metni) + **IBM Plex Sans**
(arayüz). Aynı süper aileden gelirler, Türkçe glifleri tamdır ve kendi
barındırılır (`@fontsource`); Google Fonts'a çalışma anında istek atılmaz.

| Rol | Aile | Boyut / satır | Kullanım |
| --- | --- | --- | --- |
| `display` | Plex Serif 600 | 52 / 1.05 | Kelime markası |
| `hero` | Plex Serif 600 | 64 / 1 | Sonuç skoru |
| `entry-lg` | Plex Serif 600 | 34 / 1.25 | Soru metni (masaüstü) |
| `entry` | Plex Serif 600 | 26 / 1.3 | Soru metni (mobil) |
| `quote` | Plex Serif 400 italic | 20 / 1.7 | Örnek cümle, ters mod istemi |
| `lead` | Plex Sans 400 | 18 / 1.5 | Giriş satırı, seçenek |
| `body` | Plex Sans 400 | 16 / 1.55 | Gövde |
| `label` | Plex Sans 500 | 12 / 1.2 | Bölüm etiketi (0.08em aralık, BÜYÜK HARF) |
| `score` | Plex Serif 600 tabular | 44 | Skor |

Not: `cn()` (tailwind-merge) bu özel `text-*` boyutlarını tanımak için
`src/lib/utils.ts` içinde yapılandırıldı; yeni bir boyut eklenirse oraya da
yazılmalı, yoksa renk sanılıp sessizce düşer.

Ölçü kuralları:

- Anlam metni en fazla **60ch**; örnek cümle en fazla **65ch**.
- Serif yalnızca söz/anlam/örnek için; buton, etiket, sayı hep sans.
- İtalik serif yalnızca alıntı ve örnek cümlede.
- Satır sonu `text-wrap: balance` yalnızca başlıklarda.

## Renk

Tek vurgu: **çivit mürekkep**. Yeşil/kırmızı yalnızca doğru/yanlış anlamında.

| Token | HSL | Görev |
| --- | --- | --- |
| `--paper` | `210 24% 97%` | sayfa zemini (soğuk kâğıt) |
| `--surface` | `0 0% 100%` | madde yüzeyi |
| `--ink` | `216 30% 12%` | ana metin — saf siyah değil |
| `--ink-soft` | `216 12% 40%` | ikincil metin |
| `--rule` | `214 18% 86%` | ince çizgiler |
| `--accent` | `218 68% 34%` | çivit: seçim, bağlantı, odak |
| `--correct` | `152 55% 26%` | doğru |
| `--wrong` | `4 62% 40%` | yanlış |

Kontrast (ölçüldü, `prefers-reduced-motion` dahil tarayıcı denetimi): gövde
metni `--ink` / `--paper` **15.8:1**, `--ink-soft` / `--paper` **5.6:1**,
birincil düğme (beyaz / `--accent`) **8.9:1**, yanlış etiketi **6.5:1**.
**Seçenek geri bildirimi asla opaklıkla soluklaştırılmaz** — soluklaştırma
kontrastı düşürür; sönükleştirme yerine çizgi, renk ve ikon kullanılır.

## Yüzey ve biçim

- **Tek yarıçap: 4px.** Kart, buton, girdi aynı. Tek istisna: kategori etiketi
  (pill) — sınıflandırma olduğu için.
- Kart yalnızca gerçekten bir maddeyi çerçeveliyorsa var: 1px `--rule` çizgi,
  gölge yok, cam yok, blur yok.
- Bölümleri kutuyla değil çizgi ve boşlukla ayır: `border-top` + 24px nefes.
- Düğme dolgusu: birincil = `--accent` zemin; ikincil = çizgi + `--surface`;
  üçüncül = yalnız metin. Aynı ekranda iki birincil düğme olmaz.

## Boşluk

4 piksel tabanı: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.
Kart iç dolgu 24 (mobilde 20), bölüm arası 32, ekran kenarı 16/24.

## Ekranlar

### Menü — “fihrist kapağı”

İki sütun (≥ 1024px): solda **kapak** — kelime markası, tek cümlelik tanıtım,
üç adımlık “nasıl oynanır” listesi ve **manifest'ten gelen gerçek sayılar**
(12.695 söz · 14.872 anlam); sağda üç satırlık **seçim fişi**:

| Satır | Seçenekler |
| --- | --- |
| Kategori | Atasözü · Deyim |
| Oyun tipi | 5 can · 10 soru |
| Yön | Sözden anlama · Anlamdan söze |

Her satır: solda `label`, sağda seçenekler; hairline ayraç; seçili seçenek =
dolu küçük kare + `--ink` metin, seçili olmayan `--ink-soft`. Seçenekler
`radiogroup` semantiği taşır. Tek birincil düğme: **Oyuna başla**.
Mobilde tek sütun; üç adımlık liste gizlenir, düğme **kaydırmadan görünür**
(390×844'te 710. pikselde).

### Oyun — “madde”

- Üst şerit: solda kategori ve yön, sağda skor; altında ilerleme. Can
  modunda ilerleme çizgisi yerine **5 küçük kare** ve “Can 3/5” metni var —
  yürek ikonu yok, renk tek başına anlam taşımıyor. Soru modunda 2px ilerleme
  çizgisi ve “Soru 04 / 10”.
- Kart: söz (serif, büyük), tek satır istem (“Bu söz ne anlama gelir?”),
  ardından dört seçenek **A·B·C·D** harfli satırlar olarak hairline çizgiyle
  ayrılır. Seçenek kutusu yığını değil, liste — uzun tanımlar okunabilir kalır.
- Cevap sonrası: satırlar yerinde kalır; doğru satır `--correct` sol çizgi +
  onay ikonu, yanlış seçim `--wrong` sol çizgi + üstü çizili metin. Altında
  sadece **sorunun göstermediği** bilgi: varsa kullanım örneği, varsa diğer
  anlamlar. Doğru anlam zaten işaretli satırdır (ters modda istemdir);
  tekrar basılmaz.

### Sonuç — “fiş”

Skor (serif `hero`, tabular), üç satır döküm (doğru · yanlış · oran), sonra
eylemler: `Yeniden oyna` (birincil), `Ana menü` (ikincil), `Görseli paylaş`
(üçüncül). Paylaşım, ekrandaki kartın kendisini 2× çözünürlükte PNG'ye
çevirir: pano destekleniyorsa kopyalar, yoksa indirir; sonuç `role="status"`
ile duyurulur.

### Hata

Tek cümle + tek düğme. “Veri yüklenemedi. Bağlantını kontrol edip yeniden
dene.” — suçlama yok, teknik ayrıntı konsolda.

## Hareket

- 160–200ms, `cubic-bezier(0.22, 1, 0.36, 1)`; yalnız `opacity` ve `translateY`
  (≤ 8px). Bounce, elastic, sonsuz döngü yok.
- Kart geçişinde tek giriş animasyonu; seçenekler kademeli belirmez.
- `prefers-reduced-motion: reduce` → tümü kapalı, anlık geçiş.

## Erişilebilirlik (pazarlık konusu değil)

- Klavye: `1–4` seçenek, `Enter` sonraki. Kısayol, seçeneklerin altında
  masaüstünde yazıyla söylenir (mobilde gizli).
- Odak halkası: 2px `--accent`, 2px boşluk; hiçbir yerde `outline: none`
  gerekçesiz kullanılmaz.
- Dokunma hedefi ≥ 44px; seçenek satırları tam genişlik.
- Başlık sırası: menüde `h1` kelime markası, oyunda `h1` sorunun kendisi,
  sonuçta ekran okuyucuya görünen `h1` (skor). Ekran başına tek `h1`.
- Renk tek başına anlam taşımaz: doğru/yanlış ayrıca metin ve ikonla bildirilir.
- Emoji ikon yok; ikonlar `lucide-react`, `strokeWidth={1.75}`, dekoratifse
  `aria-hidden`.
- Menüde seçimler gerçek `radiogroup`: ok tuşlarıyla gezinilir, grup adı
  `legend`'den gelir.

## Dil

Tek kayıt: sakin, doğrudan, öğretici.

| Yerine | Kullan |
| --- | --- |
| “5 Hata Modu”, “Ters Mod” | “5 can”, “Anlamdan söze” |
| “Kategori / Oyun Tipi / Oyun Modu” | “Kategori / Oyun tipi / Yön” |
| “Tebrikler!” (her sonuçta) | skorun kendisi + “doğru” |
| “Yanlış! Doğru anlam: …” | “Yanlış. Doğru anlam: …” (ünlem yığını yok) |

Türkçe ek uyumu elle yazılır: “hangi **atasözüne**”, “hangi **deyime**”.
Kelime markası küçük harf: `atadey`.

## Yapılmayacaklar

Cam efekti ve blur, gradyan metin, mor/pembe vurgu, yüzen leke, emoji ikon,
6px üstü gölge, 1'den fazla birincil düğme, her bölüme büyük harf etiket,
kart içinde kart, opaklıkla soluklaştırılmış geri bildirim.

## Doğrulama (Faz 2 sonu)

1. Kontrast: ölçülen değerler yukarıda; hepsi WCAG AA üstünde.
2. 390×844: “Oyuna başla” ilk ekranda görünüyor (710 px), yatay taşma yok.
3. Yalnız klavyeyle oyun turu: `1–4` cevap, `Enter` ilerleme; odak cevap
   sonrası “Sonraki”de.
4. Cevap sonrası `role="status"` duyurusu tek satır: “Yanlış. Doğru cevap: …”.
5. `prefers-reduced-motion: reduce` → animasyon süresi 0.
6. Dokunma hedefleri < 44px: 0.
7. Örnek cümle yalnızca veride varsa basılıyor; atasözlerinde hiç yok.
