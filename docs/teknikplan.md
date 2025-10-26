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
* **Script:** Proje kök dizininde `veri-isleyici.js` (veya `.py`) adında bir script oluşturulacak.
* **İşlem:** Bu script çalıştırıldığında:
    1.  İki CSV dosyasını okuyacak.
    2.  Her bir satırı bir JSON objesine dönüştürecek (örn: `{ "id": 1, "soru": "Aba vakti...", "anlam": "Her şey zamanında..." }`).
    3.  Tüm objeleri bir dizi (array) içine alacak.
* **Çıktı:** İki optimize edilmiş JSON dosyası:
    1.  `public/atasozleri.json`
    2.  `public/deyimler.json`
* **Neden `public` Klasörü?** Vite, `public` klasöründeki dosyaları bundle'a dahil etmez, doğrudan `dist` klasörüne kopyalar. Bu, `fetch('./atasozleri.json')` gibi basit bir komutla dosyaları çağırmamıza olanak tanır.

## 3. Proje Yapısı (Vite)