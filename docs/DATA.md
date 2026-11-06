# Veri hattı

Oyunun kalitesi verinin kalitesi kadar. Bu yüzden veri, uygulamanın çalışma
anında değil, tek bir build adımında hazırlanır:

```
data/raw/*.csv  ──▶  scripts/build-data.mjs  ──▶  public/data/*.json
                                                   public/data/manifest.json
```

`public/data` üretilmiş çıktıdır; elle düzenlenmez. `npm run data:check` aynı
girdiden aynı baytları üretip üretmediğini karşılaştırır ve CI'da çalışır.

## Ham veri

`data/raw/atasozleri.csv` ve `data/raw/deyimler.csv` — noktalı virgülle ayrılmış,
`Deyim;Tanım_No;Tanım;Örnek` sütunları. Köken ve lisans notu:
[`data/raw/SOURCE.md`](../data/raw/SOURCE.md).

## Hattın kuralları

1. **Satır bütünlüğü.** Dört alandan farklı satırlar atlanır ve raporlanır.
2. **Kazıma başlıkları atılır.** Tümü büyük harfli, üç kelimeden uzun satırlar
   söz değil sayfa başlığıdır (“DEYİMLER VE DEYİMLERİN ANLAMLARI”).
3. **Sözlük etiketleri ayıklanır.** Tanımın başındaki `tkz.`, `argo`, `mecaz`,
   `esk.`, `halk ağzı` kayıt/ton etikettir, anlam değildir: korunmaz, silinir.
   Yalnızca etiketten ibaret satırlar tamamen düşer.
4. **Anlamı olmayan tanım düşer.** Boş, üç karakterden kısa veya hiç harf
   içermeyen tanımlar seçenek olarak da, cevap olarak da işe yaramaz.
5. **Tekrarlar sökülür.** Aynı sözün birebir aynı tanımı iki kez taşınmaz;
   karşılaştırma Türkçe büyük/küçük harf ve noktalama farkını yok sayar.
6. **Anlamsız kalan söz düşer.** Temizlikten sonra tanımı kalmayan söz veri
   kümesinde yer almaz.
7. **Sıralama sabittir.** Sözler kod noktasına göre sıralanır (`localeCompare`
   değil), böylece çıktı her makinede aynı olur.

## Soru üretim kuralı

Veri temiz olsa bile tanımlar sözler arasında paylaşılıyordu: kaynakta “ölmek”
tanımı 27 ayrı deyimde geçiyor. Rastgele çeldirici seçimi bu yüzden bazen
doğru cevapla **birebir aynı** bir seçenek üretiyordu.

Kural iki adımlı:

> Bir söz ancak **birincil anlamı** (ilk tanımı) veri kümesinde **yalnızca bir
> söze** aitse ve o anlam **en az 12 karakter** taşıyorsa oynanabilir.

İkinci koşul, “çok az.” gibi kendi başına hiçbir şey anlatmayan bir tanımın
seçenek olarak basılmasını ve sorunun cevabı olmasını engelliyor.

Birinci koşul iki yönü birden kapatıyor:

- **Sözden anlama:** doğru anlam başka hiçbir sözde tanım olarak geçmediği için
  çeldirici olamaz.
- **Anlamdan söze:** o anlamı yalnızca tek söz taşıdığı için ikinci bir söz
  “ben de doğruyum” diyemez.

Ek olarak seçenekler normalize edilmiş metne göre tekilleştirilir: aynı
seçenek iki kez basılmaz. Aynı soru bir oyunda iki kez sorulmaz
(`excludePrompts`).

Bunun bedeli: oynanabilir havuz 12.695 sözün tamamı değil. Bugün **1.690
atasözü** ve **9.267 deyim** oynanabilir durumda; geri kalanı paylaşılan
anlamlar ve çok kısa tanımlar yüzünden elendi. Veri büyüdükçe bu oran artar.

## Çıktı sözleşmesi

`public/data/manifest.json` uygulamanın da, CI'ın da tek kaynağıdır:

```json
{
  "datasetVersion": 1,
  "generator": "scripts/build-data.mjs",
  "source": "data/raw/*.csv (see data/raw/SOURCE.md)",
  "categories": {
    "atasozleri": { "file": "data/atasozleri.json", "phrases": 2255, "definitions": 2300, "definitionsWithExample": 0, "bytes": 387355, "sha256": "…" },
    "deyimler": { "file": "data/deyimler.json", "phrases": 10440, "definitions": 12572, "definitionsWithExample": 4349, "bytes": 1778306, "sha256": "…" }
  },
  "totals": { "phrases": 12695, "definitions": 14872, "definitionsWithExample": 4349 },
  "highlights": [{ "text": "…", "definition": "…" }]
}
```

`highlights`: “günün sözü” için **24 sözlük seçkisi**. Seçki her build'de aynı
dır (alfabe boyunca eşit aralıklarla, tek anlamlı ve en az 20 karakterlik
anlamı olan atasözleri). Hangi sözün gösterileceğine uygulama karar verir:
`günSayısı % highlights.length`. Böylece manifest bayt-sabit kalır, “günün
sözü” yine her gün değişir. Alan isteğe bağlıdır; eski bir manifest gelirse
menü sessizce bu blok olmadan çalışır.

Kategori dosyası: `{ "version": 1, "entries": [{ "text": "…", "definitions": [{"definition": "…", "example"?: "…"}] }] }`

`example` alanı yalnızca gerçek bir örnek varsa yazılır — boş string taşınmaz.

## Veri değiştirmek

```bash
# 1) ham CSV'yi düzelt
# 2) üret
npm run data:build
# 3) çıktıyı commit'le
```

Üretim çıktısı rapor basar: kaç söz, kaç tanım, kaç tanesi neden düştü.
Sayılar beklenmedik biçimde oynarsa CSV'de bir sorun var demektir.

## Bilinen sınırlar

- **Örnek cümle kapsamı:** atasözlerinde kaynakta hiç örnek yok; deyimlerde
  tanımların %65'inde yok. Oyunda örnek satırı yalnızca veri varsa görünür —
  uydurma örnek yazılmaz.
- **Çok anlamlılık:** kod her zaman ilk tanımı kullanır. Kaynaktaki sıralama
  TDK sözlük düzenini izlediği için bu, en yaygın anlamdır; yine de bir sözün
  ikinci anlamı oyunda hiç sorulmaz.
- **Kaynak lisansı:** veri seti, uygulama kodunun MIT lisansından ayrıdır.
