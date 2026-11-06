# Changelog

Bu proje [Keep a Changelog](https://keepachangelog.com/tr/1.1.0/) biçimini ve
[Semantic Versioning](https://semver.org/lang/tr/) sürümlemesini izler.

## [Unreleased]

## [1.0.0] - 2026-11-06

### Değişti

- **Paylaşım her zaman indirir.** Panoya yazma, tarayıcı iznine ve desteğe göre
  değişiyordu; artık `atadey-<skor>-dogru.png` doğrudan indiriliyor.
- **Mobil ince ayar**: 320px'te oyun şeridindeki kategori · yön etiketi
  kırpılmıyor (sarar), sonuç eylemleri mobilde tam genişlikte yığılıyor,
  yapışkan menü düğmesi iOS güvenli alan payını bırakıyor.
- **Açılış hızı**: menüde seçili kategori boşta önceden yükleniyor; ilk soru
  anında hazır.
- **Sosyal kart**: `og:image` 1200×630 kart ve Twitter kart meta'ları eklendi;
  JavaScript kapalıyken `noscript` notu görünüyor.

- Veri artık notebook yerine tek bir Node hattıyla üretiliyor
  (`scripts/build-data.mjs`): şema doğrulaması, kazıma artığı temizliği
  (başlık satırları, sözlük etiketleri, sondaki ayraçlar), tekrar eden tanım
  ayıklığı, kırpılmış sabit çıktı ve `manifest.json`.
  `npm run data:check` CI'da üretilmiş verinin güncel olduğunu doğruluyor.
- `deyimler.json` 3,3 MB'tan 1,7 MB'a indi; kullanılmayan `id` alanı kalktı.
- Veri hacmi 12.695 söze / 14.872 anlama düştü (kazıma başlıkları, boş tanımlar
  ve birebir tekrarlar çıkarıldı).

### Düzeltildi

- **İki doğru cevap olasılığı:** tanım havuzu rastgele örneklendiğinde çeldirici,
  doğru cevapla birebir aynı olabiliyordu. Artık yalnızca birincil anlamı
  veri kümesinde tek bir söze ait ve en az 12 karakter olan sözler soruluyor
  (“çok az.” gibi tanımlar seçenek olarak da basılmıyor).
- **Boş / anlamsız seçenekler:** `tkz.`, `argo` gibi sözlük etiketleri ve boş
  tanımlar seçenek olarak basılıyordu.
- **Türkçe dil bilgisi:** “hangi atasözüe ait?” → “hangi atasözüne ait?”
- **Son soru hatası:** 9. soruda “Skoru Göster” yazıp 10. soruyu soruyordu;
  bitiş koşulu ve buton metni aynı kurala bağlandı.
- Örnek cümlesi olmayan sorularda boş “Örnek:” satırı basılmıyor.
- **Geri bildirim hiyerarşisi:** yanlış seçenek artık soluklaşmıyor; doğru satır
  sol çizgi + onay ikonu, yanlış seçim kırmızı çizgi + üstü çizili metin.
- **Mobil menü:** “Oyuna başla” 390×844'te ilk ekranda kalıyor (önce ekran
  dışına taşıyordu).
- **Tekrar eden bilgi kaldırıldı:** menüdeki özet satırı, oyundaki başlık
  tekrarı ve cevap sonrası doğru anlamın ikinci kez yazılması.

### Kaldırıldı

- Kullanılmayan 29 arayüz bileşeni, kullanılmayan 25 çalışma zamanı
  bağımlılığı, `next-themes`, Radix toast ve `class-variance-authority`.
  Çalışma zamanı bağımlılığı 34'ten 8'e indi.
- Cam efektli kartlar, yüzen renk lekeleri, emoji ikonlar, `animate-float` /
  `pulse` / `shake` animasyonları.
- Repoda 23 MB yer kaplayan ajan aracı dosyaları.
- Kodla çelişen eski planlama dokümanları (`docs/blueprint.md`,
  `docs/teknikplan.md`, `docs/design.md`, `logs.md`, `TO-DO.md`).
- `index.html` içine gömülü Microsoft Clarity izleme betiği (gizlilik notu ve
  onay akışı olmadan çalışıyordu).
- Google Fonts bağlantısı ve pembe damla logosu (yerine tipografik kelime
  markası).

### Eklendi

- **Gece fihristi**: aynı token setinin koyu modu. Sistem tercihi varsayılan,
  menüdeki sessiz düğmeyle elle seçilebilir; seçim `localStorage`'da tutulur
  ve React açılmadan önce uygulanır (tema sıçraması yok). Kontrast iki modda
  da ölçüldü (gövde 16.5:1 / 15.8:1).
- **Günün sözü**: manifest'teki 24 sözlük seçkisinden her gün bir atasözü ve
  anlamı menüde; seçki build'de deterministik üretiliyor.
- **Paylaşım görseli yenilendi**: 1080×1920 dikey kompozisyon, aktif temanın
  renkleriyle; kart yalnızca yakalama anında DOM'a giriyor.
- **Kısa ekranlarda birincil eylem**: < 640px'te “Oyuna başla” yapışkan alt
  şeritte; 320×568'de de kaydırmadan erişilir.
- Soru geçişi destekleyen tarayıcılarda `document.startViewTransition` ile;
  soru değişiminde yalnızca kart, ekran değişiminde sayfanın tamamı yumuşuyor,
  `prefers-reduced-motion`'da düz.
- **Ekran geçişleri**: menü → oyun → sonuç akışı tek bir sayfa geçişiyle
  birleşti; geçiş sırasında gelen ekranın kendi giriş animasyonu kapanıyor.
- **Hata sınırı**: beklenmedik bir çizim hatası beyaz ekran bırakmıyor; aynı
  kâğıt dilinde kısa bir açıklama ve “Sayfayı yenile” düğmesi çıkıyor.
- Menü alt bilgisinde sürüm (`v1.0.0`), `package.json`'dan build sırasında
  gömülüyor; ikinci bir elle güncellenen sürüm numarası yok.
- **“Fihrist” arayüzü**: tek kaynaklı token seti (kâğıt/mürekkep/çivit), IBM Plex
  Serif + IBM Plex Sans (kendi barındırılan), 4px yarıçap, hairline çizgiler.
  Menü, oyun, sonuç ve hata ekranları yeniden yazıldı; `App.tsx` 674 satırdan
  ekran seçimine indi, oyun kuralları `useGameRun` reducer'ına taşındı.
- Klavye kısayolları (`1–4`, `Enter`), cevap sonrası odak yönetimi ve
  `aria-live` duyurusu.
- Menüde gerçek `radiogroup` seçimleri, manifest'ten gelen veri sayıları ve
  üç adımlık “nasıl oynanır” özeti.
- Sonuç ekranı: skor + doğru/yanlış/oran dökümü, PNG paylaşımı `role="status"`
  ile duyuruluyor.
- `LICENSE` (MIT), `CONTRIBUTING.md`, CHANGELOG, issue/PR şablonları,
  Dependabot, `.editorconfig`, `.nvmrc`, `docs/DATA.md`,
  `docs/ARCHITECTURE.md`, `docs/screenshots/`.
- CI: push ve PR'da lint, tip kontrolü, veri kontrolü, test ve derleme;
  Pages yayını resmî `actions/deploy-pages` akışına taşındı.
- Veri kalitesi testleri: şema, boş/tag-only tanım, tekrar, başlık artığı ve
  gerçek veri üzerinde 80 partilik soru üretimi.
