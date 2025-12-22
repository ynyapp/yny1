// Mock data for Yemek Nerede Yenir

export const turkishCities = [
  'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Eskişehir', 'Kayseri'
];

export const cuisineTypes = [
  'Türk Mutfağı', 'Kebap', 'Pizza', 'Burger', 'Balık', 'Çin Mutfağı', 'İtalyan', 'Fast Food', 'Tatlı', 'Kahvaltı'
];

export const mockRestaurants = [
  {
    id: '1',
    name: 'Kebapçı Halil',
    cuisine: 'Kebap',
    rating: 4.5,
    reviewCount: 250,
    deliveryTime: '25-35 dk',
    priceRange: '₺₺',
    location: 'Kadıköy, İstanbul',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80',
    isOpen: true,
    discount: '20% İndirim',
    tags: ['Kebap', 'Türk Mutfağı', 'Et Yemekleri'],
    minOrder: 50,
    deliveryFee: 10
  },
  {
    id: '2',
    name: 'Pizza House',
    cuisine: 'Pizza',
    rating: 4.3,
    reviewCount: 180,
    deliveryTime: '30-40 dk',
    priceRange: '₺₺',
    location: 'Beşiktaş, İstanbul',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    isOpen: true,
    discount: null,
    tags: ['Pizza', 'İtalyan', 'Fast Food'],
    minOrder: 40,
    deliveryFee: 12
  },
  {
    id: '3',
    name: 'Burger King',
    cuisine: 'Burger',
    rating: 4.2,
    reviewCount: 520,
    deliveryTime: '20-30 dk',
    priceRange: '₺',
    location: 'Şişli, İstanbul',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    isOpen: true,
    discount: '30% İndirim',
    tags: ['Burger', 'Fast Food', 'Amerikan'],
    minOrder: 35,
    deliveryFee: 8
  },
  {
    id: '4',
    name: 'Balık Evi',
    cuisine: 'Balık',
    rating: 4.7,
    reviewCount: 95,
    deliveryTime: '35-45 dk',
    priceRange: '₺₺₺',
    location: 'Bebek, İstanbul',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
    isOpen: true,
    discount: null,
    tags: ['Balık', 'Deniz Ürünleri', 'Akdeniz'],
    minOrder: 100,
    deliveryFee: 15
  },
  {
    id: '5',
    name: 'Çin Lokantası',
    cuisine: 'Çin Mutfağı',
    rating: 4.4,
    reviewCount: 310,
    deliveryTime: '25-35 dk',
    priceRange: '₺₺',
    location: 'Beyoğlu, İstanbul',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80',
    isOpen: false,
    discount: null,
    tags: ['Çin Mutfağı', 'Asya', 'Noodle'],
    minOrder: 45,
    deliveryFee: 10
  },
  {
    id: '6',
    name: 'Pasta e Basta',
    cuisine: 'İtalyan',
    rating: 4.6,
    reviewCount: 140,
    deliveryTime: '30-40 dk',
    priceRange: '₺₺₺',
    location: 'Nişantaşı, İstanbul',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    isOpen: true,
    discount: '15% İndirim',
    tags: ['İtalyan', 'Pasta', 'Pizza'],
    minOrder: 60,
    deliveryFee: 12
  },
  {
    id: '7',
    name: 'Kahvaltı Dünyası',
    cuisine: 'Kahvaltı',
    rating: 4.8,
    reviewCount: 420,
    deliveryTime: '20-30 dk',
    priceRange: '₺₺',
    location: 'Moda, İstanbul',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80',
    isOpen: true,
    discount: null,
    tags: ['Kahvaltı', 'Türk Mutfağı', 'Sağlıklı'],
    minOrder: 40,
    deliveryFee: 10
  },
  {
    id: '8',
    name: 'Tatlı Dünyası',
    cuisine: 'Tatlı',
    rating: 4.5,
    reviewCount: 280,
    deliveryTime: '15-25 dk',
    priceRange: '₺',
    location: 'Etiler, İstanbul',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
    isOpen: true,
    discount: '10% İndirim',
    tags: ['Tatlı', 'Dessert', 'Baklava'],
    minOrder: 30,
    deliveryFee: 8
  }
];

export const menuItems = {
  '1': [
    { id: 'm1', name: 'Adana Kebap', description: 'Közde pişmiş acılı kıyma kebap', price: 85, image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80', category: 'Ana Yemek' },
    { id: 'm2', name: 'Urfa Kebap', description: 'Közde pişmiş acısız kıyma kebap', price: 85, image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=80', category: 'Ana Yemek' },
    { id: 'm3', name: 'Karışık Izgara', description: 'Tavuk, köfte ve kebap karışımı', price: 95, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', category: 'Ana Yemek' },
    { id: 'm4', name: 'Ayran', description: 'Taze ayran', price: 10, image: 'https://images.unsplash.com/photo-1623309766947-fec9e67e5cf2?w=400&q=80', category: 'İçecek' },
  ],
  '2': [
    { id: 'm5', name: 'Margherita Pizza', description: 'Domates sosu, mozzarella, fesleğen', price: 65, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', category: 'Pizza' },
    { id: 'm6', name: 'Pepperoni Pizza', description: 'Domates sosu, mozzarella, pepperoni', price: 75, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80', category: 'Pizza' },
    { id: 'm7', name: 'Karışık Pizza', description: 'Sucuk, sosis, mantar, mısır, biber', price: 80, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', category: 'Pizza' },
    { id: 'm8', name: 'Coca Cola', description: '330ml kutu', price: 15, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80', category: 'İçecek' },
  ],
  '3': [
    { id: 'm9', name: 'Whopper Menü', description: 'Whopper, patates, içecek', price: 70, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', category: 'Menü' },
    { id: 'm10', name: 'Chicken Royal', description: 'Tavuklu burger menü', price: 65, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80', category: 'Menü' },
    { id: 'm11', name: 'King Nuggets', description: '9 parça nugget', price: 45, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80', category: 'Atıştırmalık' },
  ]
};

export const mockReviews = [
  { id: 'r1', userName: 'Ahmet Y.', rating: 5, date: '2 gün önce', comment: 'Harika bir deneyimdi, kesinlikle tekrar sipariş vereceğim!', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 'r2', userName: 'Ayşe K.', rating: 4, date: '1 hafta önce', comment: 'Lezzetliydi ama teslimat biraz geç geldi.', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 'r3', userName: 'Mehmet S.', rating: 5, date: '2 hafta önce', comment: 'Çok kaliteli ve taze malzemeler kullanılmış.', avatar: 'https://i.pravatar.cc/150?img=33' },
  { id: 'r4', userName: 'Zeynep A.', rating: 3, date: '3 hafta önce', comment: 'İdare eder, daha iyisini yemiştim.', avatar: 'https://i.pravatar.cc/150?img=9' },
];

export const mockUser = {
  name: 'Kullanıcı',
  email: 'kullanici@example.com',
  phone: '+90 555 123 4567',
  addresses: [
    { id: 'a1', title: 'Ev', address: 'Kadıköy Mah. Bahariye Cad. No:15 Kadıköy/İstanbul', isDefault: true },
    { id: 'a2', title: 'İş', address: 'Levent Mah. Büyükdere Cad. No:201 Şişli/İstanbul', isDefault: false }
  ],
  savedCards: [
    { id: 'c1', cardNumber: '**** **** **** 1234', cardHolder: 'KULLANICI ADI', expiryDate: '12/25' }
  ]
};

export const mockOrders = [
  {
    id: 'o1',
    restaurantName: 'Kebapçı Halil',
    date: '2024-01-15',
    status: 'delivered',
    total: 145,
    items: [
      { name: 'Adana Kebap', quantity: 2, price: 85 },
      { name: 'Ayran', quantity: 2, price: 10 }
    ]
  },
  {
    id: 'o2',
    restaurantName: 'Pizza House',
    date: '2024-01-10',
    status: 'delivered',
    total: 95,
    items: [
      { name: 'Margherita Pizza', quantity: 1, price: 65 },
      { name: 'Pepperoni Pizza', quantity: 1, price: 75 }
    ]
  }
];