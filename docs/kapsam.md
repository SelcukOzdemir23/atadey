# Proje Kapsamı: Dinamik Atasözü ve Deyim Oyunu (MVP)

Bu doküman, projenin Minimum Uygulanabilir Ürün (MVP) sürümünün vizyonunu, teknik mimarisini ve özellik kapsamını tanımlar.

## 1. Vizyon ve Problem

### Problem
Piyasadaki mevcut atasözü ve deyim oyunları genellikle;
* Kötü, eski veya mobil uyumsuz arayüzlere (UI) sahiptir.
* Statik ve kısıtlı bir soru havuzu kullanır, bu da tekrar oynanabilirliği düşürür.
* Tatmin edici bir kullanıcı deneyiminden (UX) yoksundur.

### Çözüm (Proje Vizyonu)
Kullanıcıya, **sağlam ve modern bir arayüz** üzerinden, **dinamik olarak üretilen ve akıllı çeldiricilere sahip** zengin bir soru havuzu sunan, hızlı ve keyifli bir web tabanlı quiz oyunu sunmak.

### Hedef Kitle
* Gündelik (casual) mobil ve web oyuncuları.
* Dil ve kültür meraklıları, öğrenciler.
* Hızlı bilgi yarışmalarını sevenler.

---

## 2. Teknik Mimari ve Platform (MVP)

Bu MVP, "backendless" (sunucusuz) bir mimari üzerine kuruludur ve hız ile basitliği önceliklendirir.

* **Platform:** GitHub Pages (Statik site hosting).
* **Çerçeve (Framework):** Vite + React (Hızlı bir statik site `build`'i almak için).
* **Veritabanı:** İki ayrı JSON dosyası:
    1.  `atasozleri.json` (kaynak: `atasozleri.csv`)
    2.  `deyimler.json` (kaynak: `deyimler.csv`)
    Bu dosyalar, bir kerelik lokal bir script ile CSV'den JSON'a dönüştürülecektir.
    
    **JSON Yapısı:** Her kayıt aşağıdaki formattadır:
    ```json
    {
      "text": "Atasözü veya deyim metni",
      "definitions": [
        {
          "id": 1,
          "definition": "Anlamı/açıklaması",
          "example": "Kullanım örneği"
        },
        {
          "id": 2,
          "definition": "Alternatif anlam (varsa)",
          "example": "Başka bir örnek"
        }
      ]
    }
    ```
    Bu yapı sayesinde birden fazla anlam ve örneği olan atasözleri/deyimler doğru şekilde temsil edilir.
    
* **Veri Akışı (Lazy Loading - Gecikmeli Yükleme):**
    1.  Kullanıcı siteyi açtığında, `index.html` ve `app.js` (React kodu) anında yüklenir. *Bu aşamada 20.000'lik veri yüklenmez.*
    2.  Kullanıcıya Ana Ekran (mod seçimi) *anında* gösterilir.
    3.  Kullanıcı örn. "Atasözü Oyna" butonuna tıklar.
    4.  Uygulama, **o anda** "Oyun Yükleniyor..." ekranı gösterir ve *sadece* `fetch('./atasozleri.json')` komutunu çalıştırır.
    5.  İlgili veri (atasözleri) tarayıcının belleğine alınır ve oyun başlar. Diğer veri (`deyimler.json`) gereksiz yere indirilmemiş olur.
    6.  Oyun sırasında, her kayıttan rastgele bir anlam (`definitions` dizisinden) seçilir ve soruya dönüştürülür.
* **Mimari:** Tamamen İstemci Taraflı (Client-Side Rendering). Tüm oyun mantığı, soru seçimi ve çeldirici üretimi kullanıcının tarayıcısında (JavaScript ile) çalışır.

---

## 3. MVP Kapsamı: Dahil Olan Özellikler

MVP, temel oyun döngüsünü ve "sağlam arayüz + dinamik soru" hipotezini test etmek için gereken minimum özellikleri içerir.

### Çekirdek Oyun Döngüsü
* **İki Oyun Modu Seçeneği:** Kullanıcı, ana ekranda "Atasözleri Testi" veya "Deyimler Testi" oynamayı seçer.
* **Temel Oyun Tipi:** Oynanış MVP için "10 Soruluk Hızlı Test" formatındadır.
* **Dinamik Soru Seçimi:** Seçilen moda (örn: atasözü) ait veri havuzundan rastgele bir kayıt (soru ve doğru anlam) seçilir.


### Arayüz (UI/UX)
* **%100 Duyarlı Tasarım (Responsive):** Masaüstü, tablet ve mobilde sorunsuz çalışan tek sayfa uygulama (SPA) arayüzü.
* **Arayüz Akışı:**
    1.  **Ekran 1: Ana Ekran (Mod Seçimi):**
        * Basit bir başlık/logo.
        * [**ATASÖZÜ OYNA**] (Buton)
        * [**DEYİM OYNA**] (Buton)
    2.  **Ekran 2: Yüklenme Ekranı:**
        * Kullanıcı bir mod seçtikten sonra, ilgili JSON verisi inerken gösterilen basit bir "Yükleniyor..." animasyonu/metni.
    3.  **Ekran 3: Oyun Ekranı:**
        * Soru (Atasözü veya Deyim).
        * 4 adet tıklanabilir cevap şıkkı.
        * **Anlık Geri Bildirim:** Kullanıcı bir şıkkı seçtiğinde;
            * Doğruysa: Şık yeşile döner.
            * Yanlışsa: Tıklanan şık kırmızıya döner, doğru olan şık yeşil olarak gösterilir.
    4.  **Ekran 4: Sonuç Ekranı:**
        * Net skor gösterimi (örn: "Tebrikler! 10 soruda 8 doğru yaptın.").
        * "Tekrar Oyna" butonu (Kullanıcıyı Ekran 3'e, aynı modun yeni testine yönlendirir).
        * "Ana Menü" butonu (Kullanıcıyı Ekran 1'e, mod seçimine yönlendirir).

### Paylaşım
* **"Sonucu Paylaş" Butonu:** Sonuç ekranında yer alır. Tıklandığında, "Atasözü oyununda 8/10 yaptım! Sen de dene: [oyun-linki]" gibi bir metni kullanıcının panosuna kopyalar.

---

## 4. MVP Kapsamı: Dahil OLMAYAN Özellikler

Bu özellikler, MVP'nin kapsamını dağıtmamak ve lansman süresini uzatmamak için **kesinlikle** dahil edilmeyecektir.

* **HİÇBİR** Kullanıcı Sistemi (Giriş / Kayıt / Profil).
* **HİÇBİR** Sunucu Taraflı (Backend) Kod.
* **HİÇBİR** Veritabanı (MySQL, MongoDB vb.).
* **HİÇBİR** Liderlik Tablosu (Leaderboard).
* **HİÇBİR** Görsel İçerik (YZ ile üretilmiş Ghibli tarzı görseller, ikonlar hariç).
* Atasözü ve Deyimlerin **karışık** sorulduğu bir "Karma Test" modu.
* Farklı Oyun Modları (Zamana karşı, Hayatta kalma vb.).
* Kapsamlı Ayarlar Menüsü.
* Reklam Entegrasyonu.