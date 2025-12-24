# 📱 Yemek Nerede Yenir - Mobil Uygulama

React Native (Expo) tabanlı yemek sipariş ve restoran keşif uygulaması.

## 🚀 Özellikler

### ✅ Tamamlanan Özellikler
- 🔐 **Authentication**: Giriş, Kayıt, Çıkış
- 🏠 **Ana Sayfa**: Restoran listesi, Koleksiyonlar
- 🍽️ **Restoran Detay**: Restoran bilgileri, Menü
- 🛒 **Sepet**: Ürün ekleme/çıkarma, Toplam hesaplama
- 👤 **Profil**: Kullanıcı bilgileri, Çıkış yapma
- 🔄 **Redux State Management**: Merkezi state yönetimi
- 💾 **Redux Persist**: Oturum kalıcılığı

### ⏳ Yapım Aşamasında
- 💳 Checkout Flow
- 📋 Sipariş Geçmişi
- 🎫 Rezervasyonlar
- ⭐ Yorumlar
- 🗺️ Harita Entegrasyonu
- 🔔 Bildirimler

## 🛠️ Teknoloji Stack

- **Framework**: React Native (Expo)
- **State Management**: Redux Toolkit + Redux Persist
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **API Client**: Axios
- **UI Icons**: Expo Vector Icons (Ionicons)
- **Storage**: AsyncStorage

## 📦 Kurulum

### Gereksinimler
- Node.js v16+
- Yarn
- Expo Go (iOS/Android)

### Adımlar
```bash
# Klasöre gidin
cd /app/mobile

# Bağımlılıkları yükleyin
yarn install

# Uygulamayı başlatın
yarn start
```

### Expo Go ile Test
1. Telefonunuzda **Expo Go** uygulamasını indirin
2. Terminal'deki **QR kodu** tarayın
3. Uygulama yüklenecek

## 📁 Proje Yapısı

```
/app/mobile/
├── src/
│   ├── components/        # Reusable components
│   │   ├── RestaurantCard.js
│   │   └── MenuItem.js
│   ├── screens/          # Screen components
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── RestaurantDetailScreen.js
│   │   ├── CartScreen.js
│   │   ├── ProfileScreen.js
│   │   └── SearchScreen.js
│   ├── services/         # API services
│   │   ├── authService.js
│   │   ├── restaurantService.js
│   │   ├── orderService.js
│   │   ├── reservationService.js
│   │   ├── reviewService.js
│   │   ├── userService.js
│   │   ├── campaignService.js
│   │   ├── collectionService.js
│   │   └── geoService.js
│   ├── store/            # Redux store
│   │   ├── index.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── restaurantSlice.js
│   │       ├── cartSlice.js
│   │       ├── orderSlice.js
│   │       ├── reservationSlice.js
│   │       ├── reviewSlice.js
│   │       └── userSlice.js
│   ├── contexts/         # Legacy contexts (migration to Redux in progress)
│   │   ├── AuthContext.js
│   │   └── CartContext.js
│   └── config/           # Configuration
│       └── api.js        # Axios configuration
├── App.js               # Root component
├── package.json
└── README.md
```

## 🔧 Yapılandırma

### API Endpoint
Backend API URL: `/app/mobile/src/config/api.js`

```javascript
const API_BASE_URL = 'https://foodspotter-tr.preview.emergentagent.com';
```

**Not**: Production URL kullanıyoruz. Mobil uygulamalar `localhost` kullanamaz!

### Redux Store
Store yapılandırması: `/app/mobile/src/store/index.js`

**Persist edilen state'ler:**
- `auth` - Kullanıcı oturumu
- `cart` - Sepet bilgileri

## 📱 Ekranlar

### 1. Home Screen
- Restoran listesi
- Koleksiyonlar
- Mutfak kategorileri
- Pull to refresh
- **Redux Entegrasyonu**: ✅

### 2. Login/Register Screen
- Kullanıcı girişi
- Yeni hesap oluşturma
- Form validation
- **Redux Entegrasyonu**: ✅

### 3. Restaurant Detail Screen
- Restoran bilgileri
- Menü görüntüleme
- Yorumlar (yapım aşamasında)
- **Redux Entegrasyonu**: ⏳

### 4. Cart Screen
- Sepet içeriği
- Miktar kontrolü
- Toplam hesaplama
- Checkout (yapım aşamasında)
- **Redux Entegrasyonu**: ✅

### 5. Profile Screen
- Kullanıcı bilgileri
- Menü öğeleri
- Çıkış yapma
- **Redux Entegrasyonu**: ✅

## 🔐 Authentication Flow

```
Register → Login → Store Token → Persist → Auto-Login
```

1. Kullanıcı kayıt olur (`RegisterScreen`)
2. Backend token döner
3. Token AsyncStorage'a kaydedilir
4. Redux store'a kullanıcı bilgileri eklenir
5. Redux Persist token'ı kalıcı hale getirir
6. Uygulama tekrar açıldığında auto-login

## 🛒 Cart Flow

```
Add Item → Check Restaurant → Update Cart → Calculate Total
```

1. Kullanıcı menü öğesine "Ekle" yapar
2. Farklı restorandan ise sepet temizlenir
3. Redux store güncellenir
4. Toplam otomatik hesaplanır

## 🧪 Test

Test rehberi için: [TESTING_GUIDE.md](./TESTING_GUIDE.md)

### Hızlı Test
```bash
yarn start

# Expo Go ile QR kodu tarayın
# Test senaryolarını çalıştırın
```

## 🚧 Bilinen Sorunlar

1. **Checkout Flow**: Henüz tamamlanmadı
2. **Order History**: Yapım aşamasında
3. **Reservations**: Yapım aşamasında
4. **Reviews**: UI tamamlanmadı
5. **Maps**: Entegrasyon yapılacak

## 📊 İlerleme Durumu

**Tamamlanma**: ~65%

| Özellik | Durum | Tamamlanma |
|---------|-------|------------|
| Authentication | ✅ | %100 |
| Home Screen | ✅ | %90 |
| Restaurant Detail | ⏳ | %60 |
| Cart | ✅ | %85 |
| Profile | ✅ | %80 |
| Checkout | ⏳ | %0 |
| Orders | ⏳ | %0 |
| Reservations | ⏳ | %0 |
| Reviews | ⏳ | %30 |
| Maps | ⏳ | %0 |

## 🎯 Roadmap

### Phase 1 (Tamamlandı ✅)
- [x] Authentication screens
- [x] Home screen
- [x] Restaurant list
- [x] Cart management
- [x] Redux migration

### Phase 2 (Mevcut Sprint)
- [ ] Checkout flow
- [ ] Order history
- [ ] Reservations
- [ ] Reviews UI

### Phase 3 (Gelecek)
- [ ] Maps integration
- [ ] Notifications
- [ ] Image upload
- [ ] Advanced filters
- [ ] Favorites

## 🤝 Katkıda Bulunma

1. Değişiklikleri yapın
2. Test edin (TESTING_GUIDE.md)
3. Commit edin
4. Pull request oluşturun

## 📝 Notlar

- **Redux kullanıyoruz**: Context API'den Redux'a geçiş yapıldı
- **Production URL**: Mobil uygulama production URL kullanır
- **AsyncStorage**: Token ve user bilgileri AsyncStorage'da
- **Expo Go**: Development için Expo Go kullanıyoruz

## 🐛 Hata Bildirimi

Hata bulursanız:
1. Console log'ları kontrol edin
2. Redux store'u inceleyin
3. Backend'in çalıştığını doğrulayın
4. TESTING_GUIDE.md'ye bakın

## 📞 Destek

- Backend API: `https://foodspotter-tr.preview.emergentagent.com/api`
- Swagger Docs: `https://foodspotter-tr.preview.emergentagent.com/docs`

---

**Son Güncelleme**: 24 Aralık 2025  
**Versiyon**: 1.0.0  
**Durum**: Development 🚧
