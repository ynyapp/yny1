import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, Clock, MapPin, Phone, Share2, Heart, ChevronRight, 
  Plus, Minus, ShoppingBag, Calendar, Users, Info, MessageSquare,
  Bike, UtensilsCrossed, Camera, Check, X, ArrowLeft
} from 'lucide-react';
import { restaurantsAPI, menuAPI, reviewsAPI, reservationsAPI } from '../api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RestaurantMap from '../components/RestaurantMap';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, getCartTotal } = useCart();
  const { isAuthenticated, user } = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [liked, setLiked] = useState(false);
  
  // Reservation state
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationData, setReservationData] = useState({
    date: '',
    time: '',
    partySize: 2,
    specialRequests: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    loadRestaurantData();
  }, [id]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      const [restaurantData, menuData, reviewsData] = await Promise.all([
        restaurantsAPI.getById(id),
        menuAPI.getByRestaurant(id),
        reviewsAPI.getByRestaurant(id)
      ]);
      
      setRestaurant(restaurantData);
      setMenuItems(menuData || []);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Failed to load restaurant:', error);
      toast({ title: "Hata", description: "Restoran bilgileri yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async (date) => {
    if (!date) return;
    try {
      const data = await reservationsAPI.getAvailability(id, date);
      setAvailableSlots(data.timeSlots || []);
    } catch (error) {
      console.error('Failed to load availability:', error);
    }
  };

  const handleReservation = async () => {
    if (!isAuthenticated) {
      toast({ title: "Giriş Gerekli", description: "Rezervasyon yapmak için giriş yapmalısınız", variant: "destructive" });
      navigate('/login');
      return;
    }

    try {
      await reservationsAPI.create({
        restaurantId: id,
        ...reservationData
      });
      toast({ title: "Başarılı", description: "Rezervasyonunuz alındı!" });
      setShowReservationModal(false);
    } catch (error) {
      toast({ title: "Hata", description: error.response?.data?.detail || "Rezervasyon yapılamadı", variant: "destructive" });
    }
  };

  const handleAddToCart = (item) => {
    addToCart({
      ...item,
      restaurantId: id,
      restaurantName: restaurant.name
    });
    toast({ title: "Sepete Eklendi", description: `${item.name} sepete eklendi` });
  };

  // Get unique categories from menu
  const categories = ['Tümü', ...new Set(menuItems.map(item => item.category).filter(Boolean))];
  
  // Filter menu items by category
  const filteredMenuItems = selectedCategory === 'Tümü' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  // Calculate cart items for this restaurant
  const restaurantCartItems = cartItems.filter(item => item.restaurantId === id);
  const restaurantCartTotal = restaurantCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-700">Restoran bulunamadı</h2>
          <Button onClick={() => navigate('/restaurants')} className="mt-4">
            Restoranlara Dön
          </Button>
        </div>
      </div>
    );
  }

  const isDeliveryRestaurant = restaurant.hasDelivery !== false;
  const isDineInRestaurant = restaurant.hasTableBooking;
  const isDineInOnly = restaurant && (restaurant.type === 'dine-in' || (isDineInRestaurant && !isDeliveryRestaurant));

  // Redirect to Dine-in specific page if restaurant is dine-in only
  if (restaurant && isDineInOnly && !window.location.pathname.includes('/dinein')) {
    window.location.href = `/restaurant/${id}/dinein`;
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img 
          src={restaurant.image || 'https://via.placeholder.com/1200x400'} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={() => setLiked(!liked)}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
          <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              {isDeliveryRestaurant && (
                <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <Bike className="w-3 h-3" /> Online Sipariş
                </span>
              )}
              {isDineInRestaurant && (
                <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <UtensilsCrossed className="w-3 h-3" /> Dine-in / Rezervasyon
                </span>
              )}
              {restaurant.isOpen !== false && (
                <span className="bg-green-500/80 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Açık
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-white/80 mb-3">{restaurant.cuisine} • {restaurant.priceRange}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{restaurant.rating || 'N/A'}</span>
                <span className="text-white/70">({reviews.length} değerlendirme)</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{restaurant.deliveryTime || '30-40 dk'}</span>
              </div>
              {restaurant.minOrder && (
                <span className="text-white/80">Min: {restaurant.minOrder}₺</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm mb-6 sticky top-20 z-20">
              <div className="flex border-b overflow-x-auto">
                {[
                  { id: 'overview', label: 'Genel Bakış', icon: Info },
                  { id: 'menu', label: 'Menü', icon: UtensilsCrossed },
                  { id: 'about', label: 'Hakkında', icon: Info },
                  { id: 'reviews', label: 'Değerlendirmeler', icon: MessageSquare },
                  { id: 'photos', label: 'Fotoğraflar', icon: Camera },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center gap-2 py-4 px-6 font-medium transition border-b-2 whitespace-nowrap ${
                        activeTab === tab.id 
                          ? 'border-red-600 text-red-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Info Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-6 border-l-4 border-red-500">
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                      <h3 className="font-semibold text-gray-900">Değerlendirme</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{restaurant.rating || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{reviews.length} değerlendirme</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 border-l-4 border-green-500">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-6 h-6 text-green-500" />
                      <h3 className="font-semibold text-gray-900">Çalışma Saatleri</h3>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">Şu an açık</p>
                    <p className="text-sm text-gray-500">{restaurant.deliveryTime}</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 border-l-4 border-blue-500">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-6 h-6 text-blue-500" />
                      <h3 className="font-semibold text-gray-900">Konum</h3>
                    </div>
                    <p className="text-sm text-gray-700">{restaurant.location?.city || 'İstanbul'}</p>
                    <p className="text-xs text-gray-500 mt-1">{restaurant.location?.address || ''}</p>
                  </div>
                </div>

                {/* About Section */}
                {restaurant.description && (
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Açıklama</h3>
                    <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
                  </div>
                )}

                {/* Service Options */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Hizmet Seçenekleri</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {isDeliveryRestaurant && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">Online Sipariş</span>
                      </div>
                    )}
                    {isDineInRestaurant && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Check className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">Rezervasyon</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Check className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Paket Servis</span>
                    </div>
                  </div>
                </div>

                {/* Popular Items */}
                {menuItems.length > 0 && (
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Popüler Ürünler</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {menuItems.slice(0, 4).map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 border rounded-lg hover:shadow-md transition">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-red-600 font-semibold mt-1">{item.price}₺</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Atmosphere & Features */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Özellikler ve Ortam</h3>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {restaurant.tags?.map((tag, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-700">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{tag}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Kredi Kartı</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>WiFi</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Aileler İçin Uygun</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="space-y-6">
                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                        selectedCategory === category
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Menu Items */}
                {filteredMenuItems.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center">
                    <p className="text-gray-500">Bu kategoride ürün bulunmuyor</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMenuItems.map((item) => (
                      <MenuItemCard 
                        key={item.id} 
                        item={item} 
                        onAdd={() => handleAddToCart(item)}
                        isDeliveryAvailable={isDeliveryRestaurant}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="bg-white rounded-2xl p-6 space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-red-600" /> İletişim Bilgileri
                  </h3>
                  {restaurant.phone && (
                    <a href={`tel:${restaurant.phone}`} className="text-red-600 hover:underline block mb-2">
                      {restaurant.phone}
                    </a>
                  )}
                  <p className="text-gray-600">{restaurant.location?.address || 'Adres bilgisi yok'}</p>
                </div>

                {/* Opening Hours */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-600" /> Çalışma Saatleri
                  </h3>
                  <div className="space-y-2 text-sm">
                    {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-gray-600">{day}</span>
                        <span className="font-medium text-gray-900">10:00 - 23:00</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Ödeme Yöntemleri</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Kredi Kartı', 'Banka Kartı', 'Nakit', 'Temassız Ödeme'].map((method) => (
                      <span key={method} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Accessibility */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Erişilebilirlik</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Tekerlekli Sandalye Erişimi</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Engelli Tuvaleti</span>
                    </div>
                  </div>
                </div>

                {/* Location Map */}
                {restaurant.location?.coordinates && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-red-600" /> Konum
                    </h3>
                    <RestaurantMap 
                      restaurants={[restaurant]}
                      center={[restaurant.location.coordinates.lat, restaurant.location.coordinates.lng]}
                      zoom={15}
                      height="300px"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Rating Summary */}
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900">{restaurant.rating || 'N/A'}</div>
                      <div className="flex items-center justify-center mt-1">
                        {[1,2,3,4,5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-5 h-5 ${star <= (restaurant.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-gray-500 text-sm mt-1">{reviews.length} değerlendirme</p>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center">
                    <p className="text-gray-500">Henüz değerlendirme yok</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-semibold">
                            {review.userName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{review.userName || 'Anonim'}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[1,2,3,4,5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="bg-white rounded-2xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <img 
                    src={restaurant.image} 
                    alt={restaurant.name}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  {/* Placeholder for more photos */}
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order/Reservation Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Delivery Card */}
              {isDeliveryRestaurant && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Bike className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Online Sipariş</h3>
                      <p className="text-sm text-gray-500">{restaurant.deliveryTime || '30-40 dk'} teslimat</p>
                    </div>
                  </div>

                  {restaurantCartItems.length > 0 ? (
                    <div className="space-y-3">
                      <div className="border-t pt-3">
                        {restaurantCartItems.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm py-1">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{(item.price * item.quantity).toLocaleString()}₺</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-3">
                        <span>Toplam</span>
                        <span>{restaurantCartTotal.toLocaleString()}₺</span>
                      </div>
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => navigate('/cart')}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Sepete Git ({restaurantCartItems.length})
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Henüz ürün eklemediniz</p>
                    </div>
                  )}

                  {restaurant.minOrder && (
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Minimum sipariş tutarı: {restaurant.minOrder}₺
                    </p>
                  )}
                </div>
              )}

              {/* Reservation Card */}
              {isDineInRestaurant && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Masa Rezervasyonu</h3>
                      <p className="text-sm text-gray-500">Online rezervasyon yapın</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowReservationModal(true)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Rezervasyon Yap
                  </Button>
                </div>
              )}

              {/* Restaurant Quick Info */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Hızlı Bilgiler</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{restaurant.location?.city || 'İstanbul'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{restaurant.deliveryTime || '30-40 dk'}</span>
                  </div>
                  {restaurant.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${restaurant.phone}`} className="text-red-600 hover:underline">
                        {restaurant.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Rezervasyon Yap</h3>
              <button onClick={() => setShowReservationModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                <Input
                  type="date"
                  value={reservationData.date}
                  onChange={(e) => {
                    setReservationData({...reservationData, date: e.target.value});
                    loadAvailability(e.target.value);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Saat</label>
                <select
                  value={reservationData.time}
                  onChange={(e) => setReservationData({...reservationData, time: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Saat seçin</option>
                  {availableSlots.filter(s => s.isAvailable).map((slot) => (
                    <option key={slot.time} value={slot.time}>
                      {slot.time} ({slot.available} masa müsait)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kişi Sayısı</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setReservationData(prev => ({...prev, partySize: Math.max(1, prev.partySize - 1)}))}
                    className="w-10 h-10 border rounded-full flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-semibold">{reservationData.partySize}</span>
                  <button
                    onClick={() => setReservationData(prev => ({...prev, partySize: Math.min(20, prev.partySize + 1)}))}
                    className="w-10 h-10 border rounded-full flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Özel İstekler (Opsiyonel)</label>
                <textarea
                  value={reservationData.specialRequests}
                  onChange={(e) => setReservationData({...reservationData, specialRequests: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Özel isteklerinizi yazın..."
                />
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleReservation}
                disabled={!reservationData.date || !reservationData.time}
              >
                Rezervasyon Onayla
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <Toaster />
    </div>
  );
};

// Menu Item Card Component
const MenuItemCard = ({ item, onAdd, isDeliveryAvailable }) => {
  return (
    <div className="bg-white rounded-2xl p-4 flex gap-4 hover:shadow-md transition">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-red-600">{item.price?.toLocaleString()}₺</span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-sm text-gray-400 line-through">{item.originalPrice?.toLocaleString()}₺</span>
          )}
        </div>
      </div>
      
      <div className="relative">
        {item.image && (
          <img 
            src={item.image} 
            alt={item.name}
            className="w-28 h-28 rounded-xl object-cover"
          />
        )}
        {isDeliveryAvailable && (
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetailPage;
