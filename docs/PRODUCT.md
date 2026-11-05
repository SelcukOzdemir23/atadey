# Ürün notları

## Amaç

AtaDey, Türkçe atasözü ve deyimleri anlamlarıyla eşleştiren bir tarayıcı
oyunu. Amaç ezberletmek değil, insanın günlük dilde duyduğu sözün ne demek
olduğunu bir tıkta görmesi.

## Kimin için

- Türkçe konuşan, atasözü/deyim bilgisini sınamak isteyen herkes.
- Öğretmen ve öğrenciler: ders içinde tek ekranda açılabilen bir alıştırma.
- Söz varlığına meraklı okurlar: anlamın yanında kullanım örneğini görmek
  isteyenler.

## Bağlam

Web, tamamen istemci tarafı. Sunucu, hesap, çerez, izleme yok. Veri build
zamanında üretilir ve statik olarak sunulur; oyun açıldığı anda oynanabilir.

## Kısıtlar

- Tek sayfa; yönlendirme ve oturum yönetimi yok.
- Tüm veri tarayıcıya iner; bu yüzden veri hacmi ve ilk yükleme önemli.
- İnternet bağlantısı yalnızca ilk veri isteği için gerekir.
- Türkçe tek dil; ek uyumu ve noktalama elle doğrulanır.

## Ses

Sakin, doğrudan, öğretici. Ünlem yığını ve övgü cümlesi yok; skorun kendisi
konuşur. Hata mesajları kullanıcıyı suçlamaz, sonraki adımı söyler.

## Verinin sınırı

Veri kazınmış bir sözlük dökümüdür; lisansı uygulama kodundan ayrıdır
(bkz. `data/raw/SOURCE.md`). Örnek cümleler her maddede yok — olmayan örnek
uydurulmaz, satır basılmaz.

## Başarı ölçütü

Oyuncu tek ekranda, kaydırmadan sorusunu ve dört seçeneğini görüyor; cevaptan
sonra doğru anlamı ve varsa örneğini okuyor; oyunu klavyeyle de bitirebiliyor.
