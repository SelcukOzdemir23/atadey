# Teknik Plan: Dinamik Atasözü ve Deyim Oyunu (MVP)

Bu doküman, projenin Minimum Uygulanabilir Ürün (MVP) sürümünün teknik mimarisini, veri akışını ve yayınlama stratejisini tanımlar.

## 1. Teknoloji Yığını (Tech Stack)

* **Build Aracı / Geliştirme Ortamı:** Vite
* **Kütüphane (Library):** React (Tüm UI mantığı ve state yönetimi için `useState`, `useEffect` gibi hook'lar kullanılacak).
* **Dil:** JavaScript (ES6+), JSX
* **Styling:** Vanilla CSS / CSS Modules (Vite'ın doğal olarak desteklediği, component bazlı stiller için).
* **Hosting:** GitHub Pages (Statik dosya barındırma).
* **Veri Formatı:** JSON.

## 2. Veri Hazırlama Süreci (Bir Kerelik Lokal İşlem)

Oyunun hızı için CSV dosyaları doğrudan tarayıcıda işlenmeyecektir. Tek seferlik bir hazırlık adımı uygulanacaktır.

* **Girdi:** `data/atasozleri.csv`, `data/deyimler.csv`
* **Script:** Proje içinde Jupyter Notebook (`csv_to_json_converter.ipynb`) veya Python scripti kullanılacak.
* **İşlem:** Bu script çalıştırıldığında:
    1.  İki CSV dosyasını okuyacak.
    2.  Her bir satırı işleyerek, aynı atasözü/deyim metnine sahip tüm kayıtları gruplandıracak.
    3.  Her grup için bir JSON objesi oluşturacak:
        ```json
        {
          "text": "Atasözü/deyim metni",
          "definitions": [
            {
              "id": 1,
              "definition": "İlk anlam",
              "example": "İlk örnek"
            },
            {
              "id": 2,
              "definition": "İkinci anlam (varsa)",
              "example": "İkinci örnek"
            }
          ]
        }
        ```
    4.  Tüm objeleri bir dizi (array) içine alacak.
* **Çıktı:** İki optimize edilmiş JSON dosyası:
    1.  `public/data/atasozleri.json`
    2.  `public/data/deyimler.json`
* **Neden `public` Klasörü?** Vite, `public` klasöründeki dosyaları bundle'a dahil etmez, doğrudan `dist` klasörüne kopyalar. Bu, `fetch('./data/atasozleri.json')` gibi basit bir komutla dosyaları çağırmamıza olanak tanır.
* **Neden Bu Yapı?** Gerçek veri setinde birçok atasözü/deyimin birden fazla anlamı ve kullanım örneği vardır. Bu yapı sayesinde:
    - Her atasözü/deyim tekrar etmez, `definitions` dizisi içinde farklı anlamları barındırır.
    - Oyun sırasında her kayıttan rastgele bir anlam seçilir, bu da soru çeşitliliğini artırır.
    - Kullanıcıya yanlış cevap verdiğinde seçilen spesifik anlam gösterilebilir.

## 3. Proje Yapısı (Vite)