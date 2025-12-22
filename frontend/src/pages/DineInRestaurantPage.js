import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, Clock, MapPin, Phone, Share2, Heart, Calendar, Users,
  Info, MessageSquare, Camera, ArrowLeft, Check
} from 'lucide-react';
import { restaurantsAPI, reviewsAPI, reservationsAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RestaurantMap from '../components/RestaurantMap';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const DineInRestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [liked, setLiked] = useState(false);
  
  // Reservation state
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
      const [restaurantData, reviewsData] = await Promise.all([
        restaurantsAPI.getById(id),
        reviewsAPI.getByRestaurant(id)
      ]);
      
      setRestaurant(restaurantData);
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
      setReservationData({
        date: '',
        time: '',
        partySize: 2,
        specialRequests: ''
      });
    } catch (error) {
      toast({ title: "Hata", description: error.response?.data?.detail || "Rezervasyon yapılamadı", variant: "destructive" });
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <img 
          src={restaurant.image || 'https://via.placeholder.com/1200x400'} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
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
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto">
            <span className="bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-full inline-flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4" /> Masa Rezervasyonu Mevcut
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">{restaurant.name}</h1>
            <p className="text-white/90 text-lg mb-4">{restaurant.cuisine} • {restaurant.priceRange}</p>
            
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-lg">{restaurant.rating || 'N/A'}</span>
                <span className="text-white/80">({reviews.length} değerlendirme)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Açık</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm mb-6 sticky top-20 z-20">
              <div className="flex border-b overflow-x-auto">
                {[
                  { id: 'overview', label: 'Genel Bakış', icon: Info },
                  { id: 'about', label: 'Hakkında', icon: Info },
                  { id: 'reviews', label: 'Değerlendirmeler', icon: MessageSquare },
                  { id: 'photos', label: 'Fotoğraflar', icon: Camera },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition border-b-2 ${
                        activeTab === tab.id 
                          ? 'border-blue-600 text-blue-600' 
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
                  <div className="bg-white rounded-xl p-6 border-l-4 border-blue-500">
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
                    <p className="text-sm text-gray-500">10:00 - 23:00</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 border-l-4 border-purple-500">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-6 h-6 text-purple-500" />
                      <h3 className="font-semibold text-gray-900">Rezervasyon</h3>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">Önerilir</p>
                    <p className="text-sm text-gray-500">Hafta sonu dolu olabilir</p>
                  </div>
                </div>

                {/* About Section */}
                {restaurant.description && (
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Hakkımızda</h3>
                    <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
                  </div>
                )}

                {/* Highlights */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Öne Çıkan Özellikler</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">Rezervasyon Kabul Edilir</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">Gruplar İçin Uygun</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                      <Heart className="w-5 h-5 text-pink-600" />
                      <span className="text-gray-700">Romantik Ortam</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Açık Hava Oturma</span>
                    </div>
                  </div>
                </div>

                {/* Atmosphere & Features */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ortam ve Özellikler</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Ortam</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Şık', 'Romantik', 'Rahat', 'Modern'].map((item) => (
                          <span key={item} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Kalabalık</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Turistler', 'İş Toplantıları', 'Aileler', 'Çiftler'].map((item) => (
                          <span key={item} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Teklifler</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Alkol Servisi</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Kahve ve Tatlı</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Kokteyl</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dining Options */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Yemek Seçenekleri</h3>
                  <div className="grid sm:grid-cols-4 gap-3">
                    {['Kahvaltı', 'Öğle Yemeği', 'Akşam Yemeği', 'Tatlı'].map((option) => (
                      <div key={option} className="flex items-center justify-center gap-2 p-3 border rounded-lg">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="bg-white rounded-2xl p-8 space-y-8">
                {/* Description */}
                {restaurant.description && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Hakkımızda</h3>
                    <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
                  </div>
                )}

                {/* Features */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Özellikler</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { icon: Check, text: 'Masa Rezervasyonu' },
                      { icon: Check, text: 'Açık Hava Oturma' },
                      { icon: Check, text: 'Otopark Mevcut' },
                      { icon: Check, text: 'WiFi' },
                      ...(restaurant.tags || []).map(tag => ({ icon: Check, text: tag }))
                    ].map((feature, idx) => {
                      const Icon = feature.icon;
                      return (
                        <div key={idx} className="flex items-center gap-3 text-gray-700">
                          <Icon className="w-5 h-5 text-green-600" />
                          <span>{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-red-600" /> Konum
                  </h3>
                  <p className="text-gray-600 mb-4">{restaurant.location?.address || 'Adres bilgisi yok'}</p>
                  
                  {restaurant.location?.coordinates && (
                    <RestaurantMap 
                      restaurants={[restaurant]}
                      center={[restaurant.location.coordinates.lat, restaurant.location.coordinates.lng]}
                      zoom={15}
                      height="300px"
                    />
                  )}
                </div>

                {/* Contact */}
                {restaurant.phone && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Phone className="w-6 h-6 text-red-600" /> İletişim
                    </h3>
                    <a href={`tel:${restaurant.phone}`} className="text-red-600 hover:underline text-lg">
                      {restaurant.phone}
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Rating Summary */}
                <div className="bg-white rounded-2xl p-8">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-gray-900">{restaurant.rating || 'N/A'}</div>
                      <div className="flex items-center justify-center mt-2">
                        {[1,2,3,4,5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-6 h-6 ${star <= (restaurant.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-gray-500 mt-2">{reviews.length} değerlendirme</p>
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
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
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
                    className="w-full h-56 object-cover rounded-xl"
                  />
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="w-full h-56 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Reservation Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Reservation Form */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Masa Rezervasyonu</h3>
                    <p className="text-sm text-gray-500">Hemen rezervasyon yapın</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
                    <Input
                      type="date"
                      value={reservationData.date}
                      onChange={(e) => {
                        setReservationData({...reservationData, date: e.target.value});
                        loadAvailability(e.target.value);
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Saat</label>
                    <select
                      value={reservationData.time}
                      onChange={(e) => setReservationData({...reservationData, time: e.target.value})}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Saat seçin</option>
                      {availableSlots.filter(s => s.isAvailable).map((slot) => (
                        <option key={slot.time} value={slot.time}>
                          {slot.time} ({slot.available} masa)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kişi Sayısı</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setReservationData(prev => ({...prev, partySize: Math.max(1, prev.partySize - 1)}))}
                        className="w-12 h-12 border rounded-full flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="text-2xl font-semibold">{reservationData.partySize}</span>
                      <button
                        onClick={() => setReservationData(prev => ({...prev, partySize: Math.min(20, prev.partySize + 1)}))}
                        className="w-12 h-12 border rounded-full flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Özel İstekler</label>
                    <textarea
                      value={reservationData.specialRequests}
                      onChange={(e) => setReservationData({...reservationData, specialRequests: e.target.value})}
                      className="w-full px-4 py-3 border rounded-lg"
                      rows="3"
                      placeholder="Özel isteklerinizi yazın..."
                    />
                  </div>

                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                    onClick={handleReservation}
                    disabled={!reservationData.date || !reservationData.time}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Rezervasyon Yap
                  </Button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Hızlı Bilgiler</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{restaurant.location?.city || 'İstanbul'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">10:00 - 23:00</span>
                  </div>
                  {restaurant.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a href={`tel:${restaurant.phone}`} className="text-blue-600 hover:underline">
                        {restaurant.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Maksimum 20 kişi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <Toaster />
    </div>
  );
};

export default DineInRestaurantPage;
