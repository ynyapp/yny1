# Yemek Nerede Yenir - API Contracts & Integration Plan

## 1. Mock Data → Backend Integration Plan

### Mock Verilerin Değiştirilmesi
- **mockData.js**: Tüm mock veriler kaldırılacak
- **Context'ler**: CartContext ve AuthContext backend API'leri ile entegre edilecek
- **Sayfalar**: API çağrıları eklenecek

## 2. MongoDB Modelleri

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  phone: String,
  password: String (hashed),
  addresses: [{
    title: String,
    address: String,
    coordinates: { lat: Number, lng: Number },
    isDefault: Boolean
  }],
  savedCards: [{
    cardToken: String,
    lastFourDigits: String,
    cardHolder: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Restaurant Model
```javascript
{
  _id: ObjectId,
  name: String (indexed),
  slug: String (unique, indexed, for SEO),
  cuisine: String (indexed),
  rating: Number,
  reviewCount: Number,
  deliveryTime: String,
  priceRange: String,
  location: {
    address: String,
    city: String (indexed),
    coordinates: { lat: Number, lng: Number }
  },
  image: String,
  isOpen: Boolean,
  discount: String,
  tags: [String] (indexed),
  minOrder: Number,
  deliveryFee: Number,
  openingHours: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### MenuItem Model
```javascript
{
  _id: ObjectId,
  restaurantId: ObjectId (indexed),
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String (indexed),
  isAvailable: Boolean,
  createdAt: Date
}
```

### Order Model
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique, indexed),
  userId: ObjectId (indexed),
  restaurantId: ObjectId (indexed),
  items: [{
    menuItemId: ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  deliveryAddress: Object,
  paymentMethod: String,
  status: String (enum: 'pending', 'confirmed', 'preparing', 'on-the-way', 'delivered', 'cancelled'),
  subtotal: Number,
  deliveryFee: Number,
  serviceFee: Number,
  total: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Review Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  restaurantId: ObjectId (indexed),
  orderId: ObjectId,
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}
```

## 3. API Endpoints

### Authentication (JWT-based)
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Kullanıcı çıkışı
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi

### Restaurants
- `GET /api/restaurants` - Restoran listesi (filters: city, cuisine, rating, search)
- `GET /api/restaurants/:slug` - Restoran detayı (SEO-friendly slug)
- `GET /api/restaurants/:id/menu` - Restoran menüsü

### Menu Items
- `GET /api/menu/:restaurantId` - Restoran menüsü

### Orders
- `POST /api/orders` - Sipariş oluştur (requires auth)
- `GET /api/orders` - Kullanıcı siparişleri (requires auth)
- `GET /api/orders/:id` - Sipariş detayı (requires auth)

### Reviews
- `POST /api/reviews` - Yorum ekle (requires auth)
- `GET /api/reviews/:restaurantId` - Restoran yorumları

### User Profile
- `GET /api/user/profile` - Profil bilgisi (requires auth)
- `PUT /api/user/profile` - Profil güncelle (requires auth)
- `POST /api/user/addresses` - Adres ekle (requires auth)
- `DELETE /api/user/addresses/:id` - Adres sil (requires auth)

## 4. Güvenlik Özellikleri

### Authentication & Authorization
- JWT token ile kimlik doğrulama
- Bcrypt ile şifre hashleme (10 rounds)
- Token expiration (24 saat)
- Refresh token mekanizması

### Input Validation
- Pydantic ile input validation
- XSS koruması
- SQL injection koruması (MongoDB kullanımı)
- Rate limiting (her IP için dakikada 100 istek)

### Security Headers
- CORS yapılandırması
- Content Security Policy
- XSS Protection
- HTTPS enforcing (production)

## 5. Performance Optimizations

### Database
- Proper indexing (email, city, restaurantId, userId)
- Query optimization
- Pagination (default 20 items)
- Database connection pooling

### Caching Strategy
- Restaurant listesi cache (5 dakika)
- Menu cache (10 dakika)
- Redis kullanımı (optional, şimdilik memory cache)

### API Response
- Gzip compression
- Minimal response payload
- Lazy loading support

## 6. SEO Optimizations

### Frontend (React)
- React Helmet ile meta tags
- Dynamic meta descriptions
- Open Graph tags
- Canonical URLs
- Sitemap.xml generation

### Backend Support
- SEO-friendly slugs (/restaurant/kebapci-halil-kadikoy)
- Server-side rendering hazırlığı
- Structured data (JSON-LD) için endpoint

### URL Structure
```
/ - Homepage
/restaurants - Restaurant listing
/restaurants?city=Istanbul&cuisine=Kebap - Filtered listing
/restaurant/:slug - Restaurant detail (SEO-friendly)
/cart - Shopping cart
/checkout - Checkout page
/orders - User orders
/profile - User profile
```

## 7. Mobile Responsiveness

### Already Implemented
- Tailwind responsive classes
- Mobile-first design
- Touch-friendly buttons
- Mobile menu
- Responsive images

### To Be Added
- PWA support (manifest.json, service worker)
- Offline mode
- Push notifications (optional)
- App-like navigation

## 8. Frontend-Backend Integration Steps

### Step 1: Authentication Context Update
- Replace localStorage with JWT tokens
- Add API calls for login/register/logout
- Add token refresh mechanism

### Step 2: Restaurants Page
- Replace mockRestaurants with API call
- Add pagination
- Add proper error handling

### Step 3: Restaurant Detail Page
- Fetch restaurant by slug
- Fetch menu items
- Add to cart with auth check

### Step 4: Cart & Checkout
- Save cart to database (optional)
- Process order with backend
- Payment integration placeholder

### Step 5: User Profile
- Fetch user data from API
- Update profile functionality
- Address management

### Step 6: Orders
- Fetch order history
- Real-time status updates (optional: WebSocket)

## 9. Testing Strategy
- Unit tests for critical functions
- Integration tests for API endpoints
- E2E tests for main user flows
- Performance testing

## 10. Deployment Considerations
- Environment variables (.env)
- Database migrations
- Backup strategy
- Monitoring & logging
- Error tracking (Sentry optional)
