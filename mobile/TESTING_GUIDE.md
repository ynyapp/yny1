# 📱 Mobil Uygulama Test Rehberi

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler
- **Node.js** (v16 veya üzeri)
- **Yarn** (yüklü)
- **Expo Go** uygulaması (iOS/Android cihazınızda)
- **Aynı WiFi ağında** olun (bilgisayar ve telefon)

### 2. Uygulamayı Başlatma

```bash
# Mobil klasörüne gidin
cd /app/mobile

# Bağımlılıkları yükleyin (zaten yapıldı)
# yarn install

# Uygulamayı başlatın
yarn start
```

### 3. QR Kod ile Bağlanma

1. Terminal'de bir QR kod görünecek
2. Telefonunuzda **Expo Go** uygulamasını açın
3. QR kodu tarayın
4. Uygulama yüklenecek ve açılacak

---

## ✅ Test Senaryoları

### 🔐 Senaryo 1: Authentication (Login/Register)

#### Test Adımları:
1. **Profil** tab'ına gidin
2. **"Giriş Yap"** butonuna tıklayın
3. **"Kayıt Olun"** linkine tıklayın
4. Kayıt formunu doldurun:
   - Ad Soyad: `Test Kullanıcı`
   - E-posta: `test@example.com`
   - Telefon: `05551234567`
   - Şifre: `123456`
   - Şifre Tekrar: `123456`
5. **"Kayıt Ol"** butonuna tıklayın

#### Beklenen Sonuç:
- ✅ "Hesap oluşturuldu!" mesajı görünmeli
- ✅ Otomatik olarak giriş yapılmalı
- ✅ Profil sayfasında kullanıcı bilgileri görünmeli
- ✅ Redux store'da `auth.user` dolu olmalı

#### Hata Durumları Test Et:
- ❌ Boş form gönderme
- ❌ Şifrelerin eşleşmemesi
- ❌ Kısa şifre (6 karakterden az)
- ❌ Aynı e-posta ile tekrar kayıt

---

### 🏠 Senaryo 2: Home Screen

#### Test Adımları:
1. **Ana Sayfa** tab'ına gidin
2. Sayfanın yüklenmesini bekleyin
3. **Aşağı kaydırıp yukarı çekin** (Pull to Refresh)

#### Beklenen Sonuç:
- ✅ Restoran listesi görünmeli
- ✅ Koleksiyonlar görünmeli
- ✅ Pull to refresh çalışmalı
- ✅ Loading indicator görünmeli
- ✅ Redux store'da `restaurant.restaurants` dolu olmalı

#### Hata Durumları Test Et:
- ❌ Backend çalışmıyorsa hata mesajı
- ❌ İnternet bağlantısı yoksa

---

### 🍽️ Senaryo 3: Restaurant Detail

#### Test Adımları:
1. Ana sayfada bir restorana tıklayın
2. Restoran detay sayfasını bekleyin
3. Menü öğelerini görüntüleyin

#### Beklenen Sonuç:
- ✅ Restoran bilgileri görünmeli
- ✅ Restoran görselleri yüklenmeli
- ✅ Redux store'da `restaurant.selectedRestaurant` dolu olmalı

---

### 🛒 Senaryo 4: Cart Operations

#### Test Adımları:
1. Restoran detayında bir menü öğesine **"EKLE"** butonuna tıklayın
2. **Sepet** tab'ına gidin
3. Sepetteki öğeyi görüntüleyin
4. **Miktar artırma/azaltma** butonlarını test edin
5. **"Temizle"** butonuna tıklayın

#### Beklenen Sonuç:
- ✅ Ürün sepete eklenmeli
- ✅ Sepet badge'i güncellenm eli (sepette X ürün)
- ✅ Miktar değişikliği yapılabilmeli
- ✅ Redux store'da `cart.items` güncellenm eli
- ✅ Toplam tutar doğru hesaplanmalı

#### Hata Durumları Test Et:
- ❌ Farklı restoranlardan ürün ekleme (sepet temizlenm eli ve uyarı verilmeli)

---

### 👤 Senaryo 5: Profile Management

#### Test Adımları:
1. **Profil** tab'ına gidin
2. Kullanıcı bilgilerini görüntüleyin
3. **"Çıkış Yap"** butonuna tıklayın

#### Beklenen Sonuç:
- ✅ Kullanıcı bilgileri doğru görünmeli (Ad, E-posta)
- ✅ Avatar harfi doğru olmalı (Ad'ın ilk harfi)
- ✅ Çıkış yapınca giriş ekranına dönülmeli
- ✅ Redux store'daki `auth.user` silinmeli

---

## 🔧 Redux Store Kontrolü

Uygulamayı geliştirici modunda çalıştırırsanız Redux DevTools ile store'u görebilirsiniz:

### Store Yapısı:
```javascript
{
  auth: {
    user: { name, email, phone, id },
    token: "...",
    isAuthenticated: true,
    loading: false,
    error: null
  },
  restaurant: {
    restaurants: [...],
    selectedRestaurant: {...},
    collections: [...],
    loading: false,
    error: null
  },
  cart: {
    items: [...],
    restaurant: {...},
    subtotal: 0,
    deliveryFee: 15,
    serviceFee: 5,
    total: 0
  }
}
```

---

## 🐛 Bilinen Sorunlar ve Çözümler

### Sorun 1: "Network Request Failed"
**Sebep**: Backend'e erişilemiyor  
**Çözüm**: Backend'in çalıştığından emin olun: `https://foodspotter-tr.preview.emergentagent.com/api/restaurants`

### Sorun 2: Redux Store Boş
**Sebep**: Redux persist çalışmıyor olabilir  
**Çözüm**: Uygulamayı kapatıp yeniden açın veya cache'i temizleyin

### Sorun 3: Giriş Yapılamıyor
**Sebep**: Backend API hatası veya yanlış kimlik bilgileri  
**Çözüm**: 
- Backend'in çalıştığını kontrol edin
- Önce kayıt olun, sonra giriş yapın
- E-posta ve şifre doğru mu kontrol edin

### Sorun 4: Restoranlar Yüklenmiyor
**Sebep**: API endpoint değişmiş veya backend down olabilir  
**Çözüm**: 
- `/api/restaurants` endpoint'ini tarayıcıda test edin
- Redux store'da error mesajını kontrol edin

---

## 📊 Test Checklist

### Authentication ✅
- [ ] Kayıt ol (Register)
- [ ] Giriş yap (Login)
- [ ] Çıkış yap (Logout)
- [ ] Token persist (Uygulama kapatıp açınca giriş durumu korunuyor mu?)

### Home Screen ✅
- [ ] Restoran listesi yükleniyor
- [ ] Koleksiyonlar görünüyor
- [ ] Pull to refresh çalışıyor
- [ ] Redux store günceliniyor

### Restaurant Detail ✅
- [ ] Restoran detayı açılıyor
- [ ] Görseller yükleniyor
- [ ] Redux store günceliniyor

### Cart ✅
- [ ] Sepete ürün ekleniyor
- [ ] Miktar artırma/azaltma çalışıyor
- [ ] Sepet temizleniyor
- [ ] Toplam tutar doğru hesaplanıyor
- [ ] Redux store günceliniyor

### Profile ✅
- [ ] Kullanıcı bilgileri doğru görünüyor
- [ ] Çıkış yapılabiliyor
- [ ] Redux store temizleniyor

---

## 🎯 Sonraki Test Aşamaları

### Phase 1 (Şu an) ✅
- [x] Authentication
- [x] Home Screen
- [x] Restaurant Detail (basit)
- [x] Cart
- [x] Profile

### Phase 2 (Gelecek) ⏳
- [ ] Checkout Flow
- [ ] Order History
- [ ] Reservations
- [ ] Reviews
- [ ] Search

### Phase 3 (Gelecek) ⏳
- [ ] Maps & Location
- [ ] Notifications
- [ ] Image Upload
- [ ] Advanced Filters

---

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Redux store'u kontrol edin
2. Console log'ları inceleyin
3. Backend'in çalıştığını doğrulayın
4. Bu rehberdeki çözümleri deneyin

**İyi Testler!** 🚀
