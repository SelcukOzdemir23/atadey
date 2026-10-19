# Deyim & Atasözü Oyunu - Test Suite

Bu proje kapsamlı bir test suite'i içerir.

## Test Çalıştırma

```bash
# Tüm testleri çalıştır
npm test

# Watch mode (geliştirme sırasında)
npm run test:watch

# UI ile testleri görüntüle
npm run test:ui

# Coverage raporu
npm run test:coverage
```

## Test Kapsamı

- ✅ **Utils Tests** (22 test): `cn`, `shuffleArray`, `sampleSize` fonksiyonları
- ✅ **DataLoader Tests** (14 test): Soru üretimi, cache, hata yönetimi  
- ✅ **Component Tests** (15 test): AnswerButton, GameHeader bileşenleri
- ✅ **Integration Tests** (14 test): Tam uygulama akışı

## CI/CD

GitHub Actions ile otomatik test ve deploy:
- ✅ Push'ta testler çalışır
- ✅ Testler başarılı olursa build edilir
- ✅ GitHub Pages'e deploy edilir

**Testler geçmeden kod GitHub'a gitm az!**
