# Arayüz Akışı ve Kullanıcı Gereksinimleri (MVP)

Bu doküman, kullanıcının uygulama ile etkileşimini adım adım tanımlar. Her ekran, o ekranın amacını, kullanıcı gereksinimlerini (User Stories) ve bu gereksinimleri karşılamak için gereken spesifik teknik davranışları listeler.

## Temel Durum (State) Yönetimi
Uygulamanın tamamı, `App.jsx` içinde yönetilen tek bir `gameState` (oyun durumu) etrafında dönecektir. Arayüz akışı bu duruma göre belirlenir.
* `gameState`'in olası değerleri: `'menu'`, `'loading'`, `'playing'`, `'finished'`.

---

## Ekran 1: Ana Menü (Mod Seçimi)

* **Durum (State):** `gameState === 'menu'`
* **Amaç:** Kullanıcıya oyunu başlatması için net ve basit bir giriş noktası sunmak. Kullanıcıya hangi kategoride test çözmek istediğini sormak. Bu ekran *anında* (veri yüklemesi olmadan) görünmelidir.

### Kullanıcı Gereksinimleri
1.  **Gereksinim (G-1.1):** Bir kullanıcı olarak, uygulamayı açtığımda karşıma ne yapacağımı anlatan basit bir ekran gelmesini istiyorum ki oyuna nasıl başlayacağımı bileyim.
2.  **Gereksinim (G-1.2):** Bir kullanıcı olarak, "Atasözleri" veya "Deyimler" arasında bir seçim yapabilmek istiyorum ki ilgilendiğim alanda test çözebileyim.

### Teknik Gereksinimler ve Davranış
* Bu ekran, uygulamanın varsayılan (default) giriş ekranıdır.
* Bu aşamada **HİÇBİR** `data.json` dosyası indirilmez. Amaç, en hızlı "ilk açılış" (initial load) süresini sağlamaktır.
* Ekranda iki ana tıklanabilir element bulunur:
    1.  Buton: "Atasözleri Oyna"
    2.  Buton: "Deyimler Oyna"
* **Davranış (Atasözü):** Kullanıcı "Atasözleri Oyna" butonuna tıkladığında:
    * `setGameMode('atasozu')` çağrılır.
    * `setGameState('loading')` çağrılır. (Uygulama Ekran 2'ye geçer).
* **Davranış (Deyim):** Kullanıcı "Deyimler Oyna" butonuna tıkladığında:
    * `setGameMode('deyim')` çağrılır.
    * `setGameState('loading')` çağrılır. (Uygulama Ekran 2'ye geçer).

---

## Ekran 2: Yüklenme Ekranı (Veri İndirme)

* **Durum (State):** `gameState === 'loading'`
* **Amaç:** Kullanıcıya, seçtiği moda ait verinin (büyük JSON dosyası) indirildiğini ve oyunun hazırlandığını bildirmek. Kullanıcının sistemin donmadığını anlamasını sağlamak.

### Kullanıcı Gereksinimleri
1.  **Gereksinim (G-2.1):** Bir kullanıcı olarak, bir mod seçtikten sonra oyunun hazırlanmasını beklerken, sistemin aktif olarak çalıştığını (donmadığını) görmek istiyorum ki beklemeye devam edebileyim.
2.  **Gereksinim (G-2.2):** Bir kullanıcı olarak, eğer veri yüklenemezse (örn: internet bağlantım yoksa), bir hata mesajı görmek istiyorum ki sorunun ne olduğunu anlayabileyim.

### Teknik Gereksinimler ve Davranış
* Bu ekran, `gameState` 'loading' olduğunda otomatik olarak render edilir.
* Ekranda net bir metin gösterilir (Örn: `gameMode`'a göre "Atasözleri Yükleniyor..." veya "Deyimler Yükleniyor...").
* Ekranda mutlaka bir "loading spinner" veya CSS tabanlı bir animasyon olmalıdır (bu, G-2.1'i karşılar).
* **Veri Çekme (Fetch):**
    * Bu ekran göründüğü anda, `App.jsx` içindeki bir `useEffect` (veya benzeri bir mantık) tetiklenir.
    * `gameMode`'a (`'atasozu'` veya `'deyim'`) göre ilgili `fetch` işlemi başlar (örn: `fetch('./atasozleri.json')`).
* **Akış (Başarılı):**
    1.  `fetch` başarılı olur ve `data.json` içeriği bir state'e (`setGameData(data)`) yazılır.
    2.  `setGameState('playing')` çağrılır. (Uygulama Ekran 3'e geçer).
* **Akış (Hata Durumu - G-2.2):**
    1.  `fetch` işlemi `.catch()` bloğuna düşerse (internet yok, dosya 404 vb.).
    2.  `setGameState('menu')` *çağrılmaz*.
    3.  Bunun yerine, yüklenme ekranındaki metin bir hata mesajıyla güncellenir (Örn: "Veri yüklenemedi. İnternet bağlantınızı kontrol edin.").
    4.  Ekrana "Ana Menüye Dön" butonu eklenir. Bu buton tıklandığında `setGameState('menu')` çağrılır.

---

## Ekran 3: Oyun Ekranı (Soru & Cevap)

* **Durum (State):** `gameState === 'playing'`
* **Amaç:** Çekirdek oyun döngüsü. Kullanıcıya bir soru (atasözü/deyim) ve 4 anlam şıkkı sunmak, cevabını almak ve anlık geri bildirim vermek.

### Kullanıcı Gereksinimleri
1.  **Gereksinim (G-3.1):** Bir oyuncu olarak, testin neresinde olduğumu (örn: "Soru 3 / 10") net bir şekilde görmek istiyorum.
2.  **Gereksinim (G-3.2):** Bir oyuncu olarak, sorulan atasözünü/deyimi net bir şekilde okuyabilmek istiyorum.
3.  **Gereksinim (G-3.3):** Bir oyuncu olarak, sunulan 4 cevap şıkkından birini seçebilmek istiyorum.
4.  **Gereksinim (G-3.4):** Bir oyuncu olarak, bir şıkkı seçtiğim anda, cevabımın doğru mu yanlış mı olduğunu **anında ve net bir şekilde** görmek istiyorum (Bu, "Sağlam Arayüz" hedefinin temelidir).
5.  **Gereksinim (G-3.5):** Bir oyuncu olarak, cevabımın yanlış olması durumunda doğru cevabın hangisi olduğunu da görmek istiyorum.
6.  **Gereksinim (G-3.6):** Bir oyuncu olarak, bir soruyu cevapladıktan sonra bir sonraki soruya geçebilmeliyim.

### Teknik Gereksinimler ve Davranış
* `OyunEkrani.jsx` render edilir. Bu component kendi içinde `currentQuestionNumber` (1'den 10'a kadar) state'ini tutar.
* **UI (G-3.1, G-3.2):**
    * `<div>Soru: ${currentQuestionNumber} / 10</div>`
    * `<div class="soru-metni">{mevcutSoru.soru}</div>`
* **Oyun Motoru:**
    1.  `OyunEkrani` ilk yüklendiğinde ve her "Sonraki Soru"da, oyun motorundan (örn: `useQuizEngine`) yeni bir soru ve 4 şık (1 doğru, 3 akıllı çeldirici) çekilir.
    2.  4 adet `<button class="cevap-sik">...</button>` ekrana basılır.
* **Geri Bildirim Döngüsü (G-3.3, G-3.4, G-3.5):**
    1.  Kullanıcı bir cevap butonuna tıklar.
    2.  **Anında:** 4 cevap butonunun tamamı `disabled = true` yapılır. (Bu, G-3.4'ün "anında" kısmını karşılar ve çift tıklamayı önler).
    3.  Tıklanan butonun cevabı kontrol edilir.
    4.  **Durum 1 (Doğru Cevap):**
        * Tıklanan butona `correct` CSS class'ı eklenir (arka planı yeşil yapar).
        * Skor (`score`) state'i 1 artırılır.
    5.  **Durum 2 (Yanlış Cevap):**
        * Tıklanan butona `incorrect` CSS class'ı eklenir (arka planı kırmızı yapar).
        * Doğru olan cevabı içeren butona `correct` CSS class'ı eklenir (G-3.5'i karşılar).
* **Sonraki Soru (G-3.6):**
    * Yukarıdaki geri bildirim (yeşil/kırmızı) gösterildikten sonra ~1-2 saniye beklenir (kullanıcının sonucu görmesi için `setTimeout`).
    * `currentQuestionNumber` state'i 1 artırılır.
    * **Kontrol:** `currentQuestionNumber` > 10 oldu mu?
        * **Evetse:** Test bitmiştir. `setGameState('finished')` çağrılır. (Uygulama Ekran 4'e geçer).
        * **Hayırsa:** Yeni soru çekilir, butonların stilleri sıfırlanır ve `disabled = false` yapılır. Döngü devam eder.

---

## Ekran 4: Sonuç Ekranı

* **Durum (State):** `gameState === 'finished'`
* **Amaç:** Kullanıcıya 10 soruluk testin sonucunu göstermek ve bir sonraki adımlar (tekrar oyna, ana menü, paylaş) için net seçenekler sunmak.

### Kullanıcı Gereksinimleri
1.  **Gereksinim (G-4.1):** Bir oyuncu olarak, test bittiğinde toplam skorumu (örn: "10 soruda 8 doğru") net bir şekilde görmek istiyorum.
2.  **Gereksinim (G-4.2):** Bir oyuncu olarak, testi bitirdikten sonra kolayca "Tekrar Oyna" (aynı modda) seçeneğine sahip olmak istiyorum.
3.  **Gereksinim (G-4.3):** Bir oyuncu olarak, kolayca "Ana Menü"ye (mod seçimine) dönebilmek istiyorum.
4.  **Gereksinim (G-4.4):** Bir oyuncu olarak, elde ettiğim skoru arkadaşlarımla paylaşmak için basit bir "Paylaş" butonu istiyorum ki onlara meydan okuyabileyim (MVP viral döngüsü).

### Teknik Gereksinimler ve Davranış
* `SonucEkrani.jsx` render edilir. `score` ve `gameMode` state'lerini `App.jsx`'ten prop olarak alır.
* **UI:**
    * `<div class="skor-metni">Tebrikler! ${gameMode === 'atasozu' ? 'Atasözü' : 'Deyim'} testinde 10 soruda {score} doğru yaptın!</div>`
    * Buton 1: "Tekrar Oyna"
    * Buton 2: "Ana Menü"
    * Buton 3: "Sonucu Paylaş"
* **Davranış (Butonlar):**
    * **"Tekrar Oyna" (G-4.2):** `onClick` tetiklendiğinde:
        * `setScore(0)` (Skoru sıfırlar).
        * `setGameState('playing')` (Uygulama Ekran 3'e döner. Veri zaten bellekte olduğu için tekrar `loading` gerekmez).
    * **"Ana Menü" (G-4.3):** `onClick` tetiklendiğinde:
        * Tüm oyun state'lerini sıfırlar (`setScore(0)`, `setGameData(null)`, `setGameMode(null)`).
        * `setGameState('menu')` (Uygulama Ekran 1'e döner).
    * **"Sonucu Paylaş" (G-4.4):** `onClick` tetiklendiğinde:
        * Bir metin oluşturulur: `const shareText = \`Atasözü oyununda 10/${score} yaptım! Sen de dene: ${window.location.href}\``
        * Tarayıcının `navigator.clipboard.writeText(shareText)` API'si kullanılır.
        * **İyi UX (Detay):** Butonun yanında 2 saniyeliğine "Kopyalandı!" metni belirir.