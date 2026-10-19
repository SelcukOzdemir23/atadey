# Gereksinim Odaklı Görev Listesi (MVP - Basitleştirilmiş Çeldirici)

Bu doküman, "Dinamik Atasözü ve Deyim Oyunu" projesinin MVP'si için karşılanması gereken fonksiyonel ve fonksiyonel olmayan gereksinimleri listeler. Temel çeldirici mantığı, MVP'yi hızlandırmak için "tamamen rastgele" olarak basitleştirilmiştir.

## Faz 1: Veri Altyapısı ve Yükleme Deneyimi

*Projenin "dinamik" olmasını sağlayan veri temelinin ve bu verinin kullanıcıya "sağlam" bir arayüzle sunulmasının sağlanması.*

* [ ] **Gereksinim: Veri Hazırlığı ve Erişimi**
    * Atasözleri ve Deyimler CSV dosyaları, iki ayrı, optimize edilmiş JSON dosyasına (`atasozleri.json`, `deyimler.json`) dönüştürülmelidir.
    * Bu JSON dosyaları, uygulamanın `public` klasörüne yerleştirilmeli ve istemci tarafından (client-side) `fetch` API'si ile erişilebilir olmalıdır.
    * *Kabul Kriteri:* Uygulama, URL üzerinden (örn: `/atasozleri.json`) bu verilere erişebilmelidir.

* [ ] **Gereksinim: Gecikmeli Veri Yükleme (Lazy Loading) Stratejisi**
    * Uygulama, *ilk açılışta* (Ana Menü gösterilirken) hiçbir büyük JSON dosyasını indirmemelidir.
    * Veri indirme işlemi, *sadece* kullanıcı bir oyun modu (Atasözü/Deyim) seçtikten *sonra* tetiklenmelidir.
    * *Kabul Kriteri:* Ana Menü anında yüklenmelidir. "Atasözü Oyna"ya basıldığında sadece `atasozleri.json` indirilmeli, `deyimler.json` indirilmemelidir.

* [ ] **Gereksinim: Yükleme Durumu Geri Bildirimi (Loading State)**
    * Kullanıcı bir mod seçtikten sonra, ilgili JSON dosyası inerken, kullanıcıya sistemin çalıştığını belirten net bir "Yükleniyor..." ekranı gösterilmelidir.
    * Bu ekran, `gameMode`'a göre (örn: "Atasözleri Yükleniyor...") dinamik olmalıdır.
    * *Kabul Kriteri:* Kullanıcı, veri inerken hiçbir zaman donmuş veya tepkisiz bir ekran görmemeli, her zaman aktif bir yükleme göstergesi ile bilgilendirilmelidir.

* [ ] **Gereksinim: Veri Yükleme Hata Yönetimi**
    * Kullanıcının internet bağlantısı yoksa veya JSON dosyası (404 vb.) bulunamazsa, sistem çökmemelidir.
    * Yükleme ekranında "Veri yüklenemedi. Lütfen internet bağlantınızı kontrol edin." gibi net bir hata mesajı gösterilmelidir.
    * Kullanıcıya "Ana Menüye Dön" seçeneği sunulmalıdır.

## Faz 2: Çekirdek Oyun Döngüsü ve Arayüz Akışı

*Projenin kalbi olan oyun deneyiminin tanımlanması.*

* [ ] **Gereksinim: Ana Menü (Mod Seçimi Ekranı)**
    * Kullanıcıyı iki net seçenekle karşılamalıdır: "Atasözleri Testi" ve "Deyimler Testi".
    * Arayüz, dikkat dağıtıcı unsurlardan arındırılmış ve direkt eyleme yönelik (oyuna başlama) olmalıdır.

* [ ] **Gereksinim: Test Yapısı**
    * Seçilen mod ne olursa olsun, her bir oyun seansı "10 Soruluk Hızlı Test" formatında olmalıdır.

* [ ] **Gereksinim: Oyun Ekranı (Soru Sunumu)**
    * Kullanıcıya mevcut testteki ilerlemesi gösterilmelidir (örn: "Soru: 3 / 10").
    * O anki soru (atasözü veya deyim metni) net, okunaklı ve ekranın odak noktasında olmalıdır.
    * Soruya ait 4 adet cevap şıkkı (anlamlar) tıklanabilir butonlar olarak sunulmalıdır.

* [ ] **Gereksinim: Anlık ve Net Cevap Geri Bildirimi**
    * Bu, "Sağlam Arayüz" hedefinin en kritik gereksinimidir.
    * Kullanıcı bir şıkka tıkladığı **anda**, diğer tüm şıklar tıklanmaya kapatılmalıdır (çift tıklamayı önleme).
    * **Doğru Cevap Durumu:** Tıklanan şık, anında ve belirgin bir şekilde "doğru" olarak (örn: yeşil arka plan) işaretlenmelidir.
    * **Yanlış Cevap Durumu:** Tıklanan şık "yanlış" (örn: kırmızı arka plan) olarak, *ve aynı anda* doğru olan şık "doğru" (örn: yeşil arka plan) olarak işaretlenmelidir.
    * *Kabul Kriteri:* Kullanıcı, cevabının sonucunu görmek için 1 milisaniye bile beklememeli veya ek bir butona basmamalıdır.

* [ ] **Gereksinim: Soru İlerleme Mantığı**
    * Kullanıcıya cevap geri bildirimi (yeşil/kırmızı) gösterildikten sonra, bir sonraki soruya geçiş için net bir eylem (örn: "Sonraki Soru" butonu) sunulmalıdır.
    * *Not:* Otomatik geçiş (1-2 saniye bekleme) de bir seçenektir ancak MVP için buton, kullanıcıya daha fazla kontrol verir.
    * Test bittiğinde (10. sorudan sonra), sistem otomatik olarak "Sonuç Ekranı"na yönlendirilmelidir.

## Faz 3: Basit Çeldirici Motoru (MVP Sürümü)

*Projenin "dinamik" olmasını sağlayan mantığın MVP için basitleştirilmiş hali.*

* [ ] **Gereksinim: Rastgele Çeldirici Üretimi**
    * Her soru için üretilen 3 yanlış cevap (çeldirici), ilgili modun veri havuzundan (`atasozleri.json` veya `deyimler.json`) **tamamen rastgele** seçilmelidir.
    * "Akıllı" anahtar kelime arama mantığı bu sürümde **kullanılmayacaktır**.
    * *Kabul Kriteri:* Sistem, doğru cevabın objesi (kaydı) dışında, veri havuzundan 3 farklı rastgele obje seçmeli ve bu objelerin "anlam" alanlarını çeldirici olarak kullanmalıdır.

* [ ] **Gereksinim: Çeldirici Veri Havuzu İzolasyonu (ÖNEMLİ)**
    * Bu basitleştirme, bu kuralı *değiştirmez*.
    * "Atasözü Testi" çözülürken, çeldiriciler *sadece* `atasozleri.json` havuzundan seçilmelidir.
    * Bir atasözü sorusuna, bir deyimin anlamı çeldirici olarak *gelmemelidir*.

* [ ] **Gereksinim: Çeldiricilerin Benzersizliği**
    * Rastgele seçilen 3 çeldiricinin, o an sorulan sorunun **doğru anlamı** ile aynı olmaması garanti altına alınmalıdır.
    * (İdeal olarak 3 çeldirici birbirinden de farklı olmalıdır, ancak MVP için öncelikli olan doğru cevapla çakışmamaktır).

## Faz 4: Test Sonu ve Tekrar Oynanabilirlik

*Oyun döngüsünü tamamlayan ve kullanıcıyı tekrar oynamaya teşvik eden adımlar.*

* [ ] **Gereksinim: Sonuç Ekranı**
    * Kullanıcıya testi bitirdiğinde net skoru (`10 soruda X doğru`) gösterilmelidir.
    * Kullanıcının hangi modu bitirdiğine dair bir geri bildirim olmalıdır (örn: "Atasözü Testi Sonucu").

* [ ] **Gereksinim: Yeniden Oynama Seçenekleri**
    * Kullanıcıya iki net eylem butonu sunulmalıdır:
        1.  **"Tekrar Oyna":** Kullanıcıyı, *aynı modda* (örn: Atasözü) yeni bir 10 soruluk teste başlatır. Bu işlem, veriyi *tekrar indirmemeli* (veri zaten bellektedir), doğrudan "Oyun Ekranı"na atmalıdır.
        2.  **"Ana Menü":** Kullanıcıyı, mod seçimi yapabileceği "Ana Menü"ye döndürür. Bu, oyun state'ini (veri, skor vb.) tamamen sıfırlamalıdır.

* [ ] **Gereksinim: Viral Paylaşım Özelliği (MVP Pazarlaması)**
    * Sonuç ekranında bir "Sonucu Paylaş" butonu olmalıdır.
    * Bu buton, kullanıcının skorunu ve oyunun linkini içeren hazır bir metni (`"Atasözü testinde 10/8 yaptım! Sen de dene: [link]"`) kullanıcının panosuna kopyalamalıdır (`navigator.clipboard`).
    * *Kabul Kriteri:* Kopyalama işlemi başarılı olduğunda kullanıcıya "Kopyalandı!" gibi bir görsel geri bildirim verilmelidir.

## Faz 5: Fonksiyonel Olmayan Gereksinimler (Genel Kalite)

*Projenin "sağlam" olarak nitelendirilmesi için gereken genel kalite standartları.*

* [ ] **Gereksinim: %100 Duyarlı (Responsive) Arayüz**
    * Uygulamadaki *tüm* ekranlar (Menü, Yükleme, Oyun, Sonuç) üç ana cihaz genişliğinde (mobil, tablet, masaüstü) kusursuz görünmeli ve çalışmalıdır.
    * Tıklanabilir alanlar, mobil cihazlarda parmakla kolayca basılabilecek boyutta olmalıdır.

* [ ] **Gereksinim: Tatmin Edici Mikro Etkileşimler (UI Polish)**
    * Butonlara tıklandığında `:hover` ve `:active` (basılma anı) efektleri olmalıdır.
    * Doğru/Yanlış geri bildirimi gibi önemli anlarda yumuşak CSS geçişleri (transition) kullanılmalıdır. (Ani renk değişimleri yerine 0.3s'lik geçişler vb.).

* [ ] **Gereksinim: GitHub Pages Yayınlama Yapılandırması**
    * Vite projesi, GitHub Pages'in alt dizin yapısında (örn: `kullanici.github.io/proje-adi/`) çalışacak şekilde doğru `base` ayarı ile yapılandırılmalıdır.