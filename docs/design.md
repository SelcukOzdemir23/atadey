# TASARIM VE ETKİLEŞİM REHBERİ (MVP)

Bu doküman, projenin "sağlam arayüz" hedefine ulaşması için tüm görsel ve etkileşimsel kuralları tanımlar. Buradaki kurallar, tüm component'ler ve ekranlar için tutarlı bir kullanıcı deneyimi (UX) yaratmanın temelidir.

## 1. Temel Felsefe (Hissiyat)

* **Net ve Odaklı:** Arayüz, kullanıcıyı her adımda tek bir eyleme yönlendirir. Görsel kalabalık, dikkat dağıtıcı unsurlar yoktur.
* **Tepkisel (Reactive):** Arayüz "canlı" hissettirmelidir. Kullanıcının her eylemine (tıklama, üzerine gelme) anında, yumuşak ve tatmin edici bir geri bildirim verir.
* **Tutarlı:** Bir butona basma hissi, Ana Menü'de de, Sonuç Ekranı'nda da aynıdır. Renkler ve boşluklar öngörülebilirdir.
* **Mobil-Öncelikli (Mobile-First):** Tasarım en başta dar ekranlar (360px) için yapılır ve buradan masaüstüne doğru genişletilir.

## 2. Renk Paleti (Fonksiyonel)

Renkler, kullanıcıya anlık geri bildirim vermenin en hızlı yoludur.

### a. Nötr Renkler (Zemin ve Metin)
* **Zemin (Page Background):** `#F9FAFB` (Çok hafif kırık bir beyaz - Gözü yormaz)
* **Kapsayıcı (Container Background):** `#FFFFFF` (Tam beyaz - Kartların/İçeriğin zemini)
* **Ana Metin (Text Primary):** `#1F2937` (Siyaha yakın koyu gri - Yüksek kontrast)
* **İkincil Metin (Text Secondary):** `#6B7280` (Orta gri - Soru no, bilgilendirme metinleri)

### b. Ana Marka Rengi (Eylem)
* **Marka (Brand Primary):** `#4F46E5` (Canlı bir İndigo/Mor - "Oyuna Başla", "Sonraki Soru" gibi ana eylem butonları için)
* **Marka Vurgu (Brand Hover):** `#4338CA` (Ana rengin bir ton koyusu - Butonların `:hover` durumu)
* **Marka Vurgu-Açık (Brand Light):** `#EEF2FF` (Ana rengin çok soluk tonu - `:focus` halkası veya ikincil butonların arka planı için)

### c. Semantik Renkler (Geri Bildirim)
* **Başarı (Success):** `#10B981` (Canlı Yeşil)
    * **Metin:** `#065F46` (Koyu Yeşil)
    * **Zemin:** `#D1FAE5` (Açık Yeşil)
* **Hata (Error):** `#EF4444` (Canlı Kırmızı)
    * **Metin:** `#991B1B` (Koyu Kırmızı)
    * **Zemin:** `#FEE2E2` (Açık Kırmızı)
* **Nötr/Devre Dışı (Disabled):**
    * **Metin:** `#9CA3AF` (Açık Gri)
    * **Zemin:** `#E5E7EB` (Çok Açık Gri)

## 3. Tipografi (Metin Hiyerarşisi)

* **Ana Yazı Tipi (Font Family):** `"Inter"`, `sans-serif` (Modern, okunaklı ve ücretsiz bir Google Font'u. `index.html`'e import edilmeli).
* **Ana Başlık (örn: "Atasözü Oyunu"):**
    * Font Boyutu: `32px` (mobil için `28px`)
    * Ağırlık (Weight): `700` (Bold)
    * Renk: `Ana Metin`
* **Soru Metni (Oyun Ekranı):**
    * Font Boyutu: `22px` (mobil için `20px`)
    * Ağırlık: `600` (SemiBold)
    * Renk: `Ana Metin`
    * Satır Yüksekliği: `1.6`
* **Buton / Şık Metni:**
    * Font Boyutu: `16px`
    * Ağırlık: `500` (Medium)
    * Renk: (Buton türüne göre değişir, bkz. Bölüm 5)
* **Normal Metin (Skor, Soru No):**
    * Font Boyutu: `16px`
    * Ağırlık: `400` (Regular)
    * Renk: `İkincil Metin`
* **Küçük Bilgi (örn: "Kopyalandı!"):**
    * Font Boyutu: `14px`
    * Ağırlık: `400` (Regular)
    * Renk: `İkincil Metin`

## 4. Düzen ve Boşluk (Layout & Spacing)

Tutarlılık için 8px tabanlı bir "boşluk sistemi" kullanılacaktır. (1 birim = 8px)

* **Genel Düzen:** Tüm uygulama `640px` (masaüstü için) maksimum genişliğe sahip, dikey ve yatayda ortalanmış tek bir kapsayıcı (container) içinde yaşayacaktır.
* **Kapsayıcı Dolgusu (Padding):** Tüm ekranlar (Menü, Oyun, Sonuç) ana kapsayıcı içinde `32px` (4 birim) (mobil için `24px` - 3 birim) iç dolguya sahip olmalıdır.
* **Elementler Arası Boşluk:**
    * Başlık ile Butonlar (Ana Menü): `32px` (4 birim)
    * Soru Metni ile Cevap Şıkları: `32px` (4 birim)
    * Cevap Şıkları Arası (Dikey): `16px` (2 birim)
    * Cevap Şıkları ile "Sonraki Soru" Butonu: `24px` (3 birim)
* **Köşe Yumuşatma (Border Radius):**
    * Ana Kapsayıcı: `16px` (Büyük)
    * Butonlar ve Şıklar: `8px` (Orta)
* **Gölgeler (Box Shadow):** Ana Kapsayıcı, zeminden hafifçe ayrılmalıdır: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`

## 5. Anahtar Bileşenler (Components)

### a. Butonlar (Ana Eylem: "Oyuna Başla", "Sonraki Soru")
* **Görünüm:** Dolgulu (Solid)
* **Normal:** Arka Plan: `Marka (Primary)`, Metin: `Beyaz (#FFF)`
* **Üzerine Gelme (`:hover`):** Arka Plan: `Marka Vurgu (Hover)`
* **Tıklama Anı (`:active`):** `transform: scale(0.97)` (İçe basılma efekti)
* **Devre Dışı (`:disabled`):** Arka Plan: `Nötr Zemin`, Metin: `Nötr Metin`
* **Odaklanma (`:focus-visible`):** Dışarıda `3px` kalınlığında `Marka Vurgu-Açık (Light)` renginde bir "halka" (outline/box-shadow) olmalı.
* **Boyut:** `padding: 12px 24px` (Yatayda geniş olmalı, `width: 100%`)

### b. Butonlar (İkincil Eylem: "Ana Menü", "Paylaş")
* **Görünüm:** Çerçeveli (Outline)
* **Normal:** Arka Plan: `Şeffaf`, Metin: `Marka (Primary)`, Çerçeve: `1px solid Marka (Primary)`
* **Üzerine Gelme (`:hover`):** Arka Plan: `Marka Vurgu-Açık (Light)`
* **Tıklama Anı (`:active`):** `transform: scale(0.97)`
* **Boyut:** `padding: 10px 20px` (Ana butondan biraz daha küçük)

### c. Butonlar (Cevap Şıkları)
* **Normal:**
    * Arka Plan: `Beyaz (#FFF)`
    * Metin: `Ana Metin`
    * Çerçeve: `1px solid #D1D5DB` (Açık Gri)
* **Üzerine Gelme (`:hover`):**
    * Arka Plan: `#F9FAFB` (Hafif gri)
    * Çerçeve: `1px solid Marka (Primary)`
    * Metin: `Marka (Primary)`
* **Odaklanma (`:focus-visible`):** `:hover` ile aynı stil + `:focus` halkası.

## 6. Etkileşim ve Animasyon (Hissiyat)

* **Genel Geçiş (Global Transition):** Tüm `:hover` ve `:active` durumları için kullanılacak temel geçiş: `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);` (Hızlı ve yumuşak).
* **Ekran Geçişleri (Page Transitions):**
    * Bir ekrandan (`menu`) diğerine (`loading` veya `playing`) geçerken, ekranlar aniden değişmemelidir.
    * Yeni ekran, `opacity: 0`'dan `opacity: 1`'e doğru `0.3s` içinde yumuşak bir "fade-in" efekti ile gelmelidir.
* **Cevap Geri Bildirimi (En Kritik Etkileşim):**
    1.  **Tıklama Anı:** Kullanıcı bir şıkka tıkladığı anda, 4 şık butonu da `disabled` durumuna geçmelidir.
    2.  **Yanlış Cevap:**
        * Tıklanan şık, `Hata` renklerine (Arka Plan: `Hata Zemin`, Metin: `Hata Metin`, Çerçeve: `Hata`) dönüşmelidir.
        * CSS ile hafif bir "sallanma" (shake) animasyonu tetiklenmelidir: `animation: shake 0.5s;`
    3.  **Doğru Cevap (ve Yanlış seçilince Doğruyu Gösterme):**
        * Doğru olan şık, `Başarı` renklerine (Arka Plan: `Başarı Zemin`, Metin: `Başarı Metin`, Çerçeve: `Başarı`) dönüşmelidir.
        * CSS ile hafif bir "vurgu" (pulse) animasyonu tetiklenmelidir: `animation: pulse 0.5s;`
* **Paylaşım Geri Bildirimi (Toast):**
    * "Paylaş" butonuna tıklandığında, "Kopyalandı!" metni ekranın altında veya üstünde (bir "toast" bildirimi olarak) belirip 2 saniye sonra yavaşça kaybolmalıdır. Asla bir `alert()` kullanılmamalıdır.

## 7. Erişilebilirlik (a11y)

"Sağlam" arayüz, herkesin kullanabildiği arayüzdür.

* **Klavye Navigasyonu:** Tüm tıklanabilir elementler (butonlar, şıklar) `Tab` tuşu ile erişilebilir olmalı ve net bir `:focus-visible` stiline (Bkz: 5.a) sahip olmalıdır.
* **Kontrast:** Tüm metin renkleri, zemin renkleri ile WCAG AA standardında kontrast oranını karşılamalıdır. (Bu palet bu kurala uyar).
* **Ekran Okuyucular:**
    * Soru metni değiştiğinde, ekran okuyuculara bildirilmelidir.
    * Doğru/Yanlış geri bildirimi görsel olduğu kadar (`aria-live="polite"` bir bölge ile) metinsel olarak da ("Doğru", "Yanlış") belirtilmelidir.
    * Skor ekranı açıklandığında, skor metni (`aria-live="assertive"` ile) anında okunmalıdır.