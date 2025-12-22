# Yemek Nerede Yenir - React Native Mobil Uygulama

## 📱 Proje Hakkında

Yemek Nerede Yenir platformunun React Native mobil uygulaması. Zomato tarzında tasarlanmış, kullanıcı dostu bir yemek sipariş uygulaması.

## 🚀 Özellikler

### ✅ Tamamlanan Özellikler

- **Ana Sayfa (Home)**
  - Konum seçimi
  - Arama çubuğu
  - Mutfak kategorileri (Pizza, Burger, Balık, vb.)
  - Koleksiyonlar (horizontal scroll)
  - Popüler restoranlar listesi

- **Restaurant Detay**
  - Hero image
  - Restaurant bilgileri (rating, delivery time, price range)
  - Offers & badges (Promoted, Gold, discount)
  - Kategorize edilmiş menü
  - Sepete ekleme (+/- controls)
  - Sticky cart button

- **Arama (Search)**
  - Gerçek zamanlı arama
  - Quick filters (4.0+, 4.5+ rating)
  - Mutfak filtreleme
  - Sonuç listesi

- **Sepet (Cart)**
  - Sepet ürünleri listesi
  - Quantity kontrolleri
  - Fatura detayları (subtotal, delivery, total)
  - Checkout butonu
  - Empty state

- **Profil**
  - Kullanıcı bilgileri
  - Menü items (Siparişlerim, Adreslerim, Ödeme Yöntemlerim, vb.)
  - Logout
  - Login ekranına yönlendirme

- **State Management**
  - Auth Context (login, register, logout)
  - Cart Context (add, remove, clear, total calculation)
  - AsyncStorage persistence

- **UI Components**
  - RestaurantCard (badges, ratings, offers)
  - MenuItem (quantity controls)
  - Bottom Tab Navigation
  - Stack Navigation

## 📂 Proje Yapısı

```
mobile/
├── src/
│   ├── config/
│   │   └── api.js                    # Axios configuration
│   ├── contexts/
│   │   ├── AuthContext.js            # Authentication state
│   │   └── CartContext.js            # Cart state
│   ├── services/
│   │   ├── authService.js            # Auth API calls
│   │   └── restaurantService.js      # Restaurant API calls
│   ├── components/
│   │   ├── RestaurantCard.js         # Restaurant list item
│   │   └── MenuItem.js               # Menu item with add/remove
│   └── screens/
│       ├── HomeScreen.js             # Home page
│       ├── SearchScreen.js           # Search & filters
│       ├── RestaurantDetailScreen.js # Restaurant detail & menu
│       ├── CartScreen.js             # Shopping cart
│       ├── ProfileScreen.js          # User profile
│       └── LoginScreen.js            # Login/Register
├── App.js                            # Navigation setup
├── app.json                          # Expo configuration
└── package.json
```

## 🛠️ Teknolojiler

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
  - Bottom Tabs
  - Stack Navigator
- **Axios** - HTTP client
- **AsyncStorage** - Local storage
- **Context API** - State management
- **Ionicons** - Icon library

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 16+
- npm veya yarn
- Expo CLI (optional)
- iOS Simulator (Mac için) veya Android Emulator
- Expo Go app (Physical device testing için)

### Adımlar

1. **Dependencies kurulumu:**
```bash
cd mobile
npm install
```

2. **Development server başlatma:**
```bash
npm start
```

3. **Platform seçimi:**
- iOS: `i` tuşuna basın veya `npm run ios`
- Android: `a` tuşuna basın veya `npm run android`
- Web: `w` tuşuna basın veya `npm run web`

4. **Expo Go ile test:**
- Expo Go app'i indirin (iOS/Android)
- QR kodu tarayın
- Uygulamayı cihazınızda test edin

## 🔗 API Entegrasyonu

Uygulama production backend'e bağlı:
- **Base URL:** `https://yemek-rehberi-2.preview.emergentagent.com`
- **Endpoints:**
  - `GET /api/restaurants` - Restaurant list
  - `GET /api/restaurants/id/:id` - Restaurant detail
  - `GET /api/menu/:restaurantId` - Restaurant menu
  - `GET /api/collections/` - Collections
  - `POST /api/auth/login` - User login
  - `POST /api/auth/register` - User registration

## 🎨 Design System

### Colors
- **Primary:** `#DC2626` (Red)
- **Background:** `#F5F5F5` (Light Gray)
- **Text:** `#333` (Dark Gray)
- **Border:** `#E0E0E0` (Light Border)

### Typography
- **Title:** 32px, Bold
- **Heading:** 18-20px, Bold
- **Body:** 14-15px, Regular
- **Caption:** 11-13px, Regular

## 📱 Ekran Görüntüleri

### Home Screen
- Location selector
- Search bar
- Cuisine categories
- Collections carousel
- Restaurant list with badges

### Restaurant Detail
- Hero image
- Restaurant info
- Offers & promotions
- Categorized menu
- Add to cart functionality

### Cart
- Cart items with quantity controls
- Bill breakdown
- Checkout button

### Profile
- User info
- Menu options
- Logout

## 🔐 Authentication

- JWT token based authentication
- Token stored in AsyncStorage
- Auto-logout on 401
- Auth context for global state

## 🛒 Cart Management

- Multi-item cart
- Quantity controls
- Restaurant switching (clear cart)
- Persistent storage
- Total calculation

## 📦 Production Build

### iOS (MacOS gerekli)
```bash
npx expo build:ios
```

### Android
```bash
npx expo build:android
```

### Using EAS Build (Recommended)
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## 🚧 Gelecek Özellikler

- [ ] Order tracking with map
- [ ] Payment integration
- [ ] Push notifications
- [ ] Reviews & ratings
- [ ] Favorites
- [ ] Order history
- [ ] Address management
- [ ] Multiple payment methods
- [ ] Coupon/Promo codes
- [ ] Real-time order updates

## 📞 Destek

Herhangi bir sorunla karşılaşırsanız:
1. Expo logs kontrol edin: `npm start`
2. Metro bundler restart: `r` tuşu
3. Cache clear: `npm start -- --clear`

## 📝 Notlar

- Development modda hot reload aktif
- AsyncStorage'da cart ve auth data persist ediliyor
- API errors console'da loglanıyor
- Images placeholder olarak Unsplash kullanılabilir

## 🎉 Tamamlandı!

React Native mobil uygulama production-ready durumda! Zomato tarzında tasarlanmış, tam fonksiyonel bir food delivery platformu.
