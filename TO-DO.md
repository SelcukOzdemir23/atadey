# TO-DO Liste

## 🚨 Kritik: Kod Mimarisi Refactoring

### Problem
`App.tsx` dosyası **690 satır** ve tüm uygulama mantığını içeriyor:
- 5 farklı ekran (menu, loading, playing, finished, error)
- 2 oyun modu (TextToMeaning, MeaningToText)
- 12+ useState hook
- Tüm oyun mantığı (skor, soru yönetimi, hata takibi)
- UI rendering

**Risk:** Yeni ekranlar eklendikçe (istatistik, profil, liderlik tablosu) dosya 1000+ satıra ulaşacak ve yönetilemez hale gelecek.

### Çözüm: Component & Hook Bazlı Mimari

```
src/
├── App.tsx (50 satır - sadece routing/layout)
├── pages/
│   ├── MenuPage.tsx
│   ├── GamePage.tsx
│   ├── ResultsPage.tsx
│   ├── ErrorPage.tsx
│   └── LoadingPage.tsx
├── components/
│   ├── GameModes/
│   │   ├── TextToMeaningMode.tsx
│   │   └── MeaningToTextMode.tsx
│   ├── GameHeader.tsx (✅ mevcut)
│   ├── Footer.tsx (yeni - component olarak ayrıştır)
│   └── AnswerButton.tsx (✅ mevcut)
├── hooks/
│   ├── useGameState.ts (score, mistakes, totalQuestions, streak)
│   ├── useQuestionManager.ts (currentQuestion, nextQuestion, shuffleOptions)
│   └── useGameLogic.ts (handleAnswer, handleNextQuestion, checkAnswer)
├── contexts/
│   └── GameContext.tsx (global state paylaşımı)
└── utils/
    ├── gameHelpers.ts (shuffleOptions, calculateScore, etc.)
    └── dataLoader.ts (✅ mevcut)
```

### Refactoring Adımları

#### Faz 1: Hook'lara Ayırma (1-2 gün)
- [ ] `useGameState.ts` oluştur
  - score, mistakes, totalQuestions, streak state'lerini taşı
  - updateScore, resetGame gibi fonksiyonları ekle
  
- [ ] `useQuestionManager.ts` oluştur
  - currentQuestion, usedQuestions state'lerini taşı
  - getNextQuestion, shuffleOptions mantığını taşı
  
- [ ] `useGameLogic.ts` oluştur
  - handleAnswer, handleNextQuestion mantığını taşı
  - Cevap kontrolü ve skor hesaplamayı taşı

#### Faz 2: Component'lere Ayırma (2-3 gün)
- [ ] `pages/MenuPage.tsx` oluştur
  - Menu ekranı JSX'ini taşı
  - Mode/direction seçimi mantığını içer
  
- [ ] `pages/GamePage.tsx` oluştur
  - Playing ekranı JSX'ini taşı
  - GameHeader, oyun modları, Footer'ı içer
  
- [ ] `pages/ResultsPage.tsx` oluştur
  - Finished ekranı JSX'ini taşı
  - Paylaşma, yeniden başlatma butonlarını içer
  
- [ ] `components/Footer.tsx` oluştur
  - Footer component'ini ayrı dosyaya taşı
  - Tüm sayfalarda import edilebilir hale getir

#### Faz 3: Context & Router (2-3 gün)
- [ ] `GameContext.tsx` oluştur
  - Global state yönetimi
  - Provider ile App'i sarmalama
  
- [ ] React Router ekle (opsiyonel)
  - Ekranlar arası navigation
  - URL bazlı routing
  - Deep linking desteği

#### Faz 4: Optimizasyon (1-2 gün)
- [ ] Code splitting
  - React.lazy ile sayfa lazy loading
  - Bundle size optimize et
  
- [ ] Performance
  - React.memo ile gereksiz render'ları önle
  - useMemo/useCallback kullan
  
- [ ] Test coverage
  - Her hook için unit test
  - Her page için integration test

### Öncelik
**Orta** - Yeni ekran eklemeden önce yapılmalı

### Tahmini Süre
**5-10 gün** (part-time çalışma ile)

---

## 📋 Diğer İyileştirmeler

### Yakın Gelecek
- [ ] Responsive design testleri (mobil, tablet)
- [ ] Dark mode iyileştirmeleri
- [ ] Animasyon performansı
- [ ] Accessibility (ARIA labels, keyboard navigation)

### Gelecek Özellikler
- [ ] İstatistik ekranı
- [ ] Profil sistemi
- [ ] Liderlik tablosu
- [ ] Sosyal paylaşım geliştirmeleri
- [ ] Çoklu dil desteği

---

## 📝 Notlar
- Mevcut test suite korunmalı (64/64 ✅)
- Her faz sonrası tests çalıştırılmalı
- Refactoring sırasında feature freeze
- Git branch'ler ile çalışılmalı (refactor/hooks, refactor/pages, vb.)

**Son Güncelleme:** 28 Ekim 2025
