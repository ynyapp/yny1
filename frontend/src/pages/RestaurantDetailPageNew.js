import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Phone, ArrowLeft, Plus, Minus, Share2, Heart, Navigation } from 'lucide-react';
import { restaurantsAPI, menuAPI, reviewsAPI } from '../api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  
  useEffect(() => {
    loadRestaurantData();
  }, [id]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      let restaurantData;
      try {
        restaurantData = await restaurantsAPI.getBySlug(id);
      } catch {
        restaurantData = await restaurantsAPI.getById(id);
      }
      
      setRestaurant(restaurantData);
      
      const menuData = await menuAPI.getMenu(restaurantData.id);
      setMenu(menuData);
      
      if (activeTab === 'reviews') {
        const reviewsData = await reviewsAPI.getByRestaurant(restaurantData.id);
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error('Failed to load restaurant:', error);
      toast({
        title: "Hata",
        description: "Restoran bilgileri yüklenemedi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews' && restaurant && reviews.length === 0) {
      loadReviews();
    }
  }, [activeTab]);

  const loadReviews = async () => {
    try {
      const reviewsData = await reviewsAPI.getByRestaurant(restaurant.id);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handleAddToCart = (item) => {
    const restaurantData = {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug
    };
    addToCart(item, restaurantData);
    toast({
      title: "Sepete Eklendi",
      description: `${item.name} sepetinize eklendi`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restoran bulunamadı</h2>
          <Button onClick={() => navigate('/restaurants')}>Restoranları Gör</Button>
        </div>
      </div>
    );
  }

  const categories = [...new Set(menu.map(item => item.category))];
  const mockImages = [restaurant.image, restaurant.image, restaurant.image, restaurant.image];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Toaster />

      <div className="bg-gray-50">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-red-600">Ana Sayfa</button>
            <span>/</span>
            <button onClick={() => navigate('/restaurants')} className="hover:text-red-600">İstanbul</button>
            <span>/</span>
            <span className="text-gray-900">{restaurant.name}</span>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Restaurant Info */}
            <div className="lg:col-span-2">
              {/* Photo Gallery */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
                <div className="grid grid-cols-4 gap-2 p-2">
                  <div className="col-span-3 row-span-2">
                    <img
                      src={mockImages[selectedImage]}
                      alt={restaurant.name}
                      className="w-full h-[400px] object-cover rounded-xl cursor-pointer hover:opacity-90 transition"
                      onClick={() => {/* Open gallery modal */}}
                    />
                  </div>
                  {mockImages.slice(1, 4).map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img}
                        alt=""
                        className="w-full h-[196px] object-cover rounded-xl cursor-pointer hover:opacity-90 transition"
                        onClick={() => setSelectedImage(idx + 1)}
                      />
                      {idx === 2 && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 rounded-xl flex items-center justify-center cursor-pointer hover:bg-opacity-50 transition">
                          <span className="text-white font-semibold">Tümünü Gör</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Restaurant Header */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                    <p className="text-gray-600 mb-3">{restaurant.tags?.join(', ')}</p>
                    <p className="text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {restaurant.location?.address}, {restaurant.location?.city}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Share2 className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Heart className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Ratings */}
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg">
                      <span className="font-bold text-lg">{restaurant.rating}</span>
                      <Star className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{restaurant.reviewCount} Dining Ratings</p>
                    </div>
                  </div>
                </div>

                {/* Info Badges */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {restaurant.isOpen ? `Açık • ${restaurant.deliveryTime}` : 'Kapalı'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                    <span className="text-sm text-gray-700">💰 {restaurant.priceRange} İki Kişilik</span>
                  </div>
                  {restaurant.discount && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold">
                      <span className="text-sm">🎉 {restaurant.discount}</span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="mt-4 pt-4 border-t flex items-center gap-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Phone className="w-4 h-4" />
                    Ara
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Navigation className="w-4 h-4" />
                    Yol Tarifi
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start bg-white border-b rounded-none h-auto p-0">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-6 py-4"
                    >
                      Genel Bakış
                    </TabsTrigger>
                    {restaurant.isOpen && menu.length > 0 && (
                      <TabsTrigger
                        value="order"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-6 py-4"
                      >
                        Sipariş Ver
                      </TabsTrigger>
                    )}
                    <TabsTrigger
                      value="reviews"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-6 py-4"
                    >
                      Yorumlar
                    </TabsTrigger>
                    <TabsTrigger
                      value="photos"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-6 py-4"
                    >
                      Fotoğraflar
                    </TabsTrigger>
                    <TabsTrigger
                      value="menu"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-6 py-4"
                    >
                      Menü
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="p-6">
                    <div className="space-y-6">
                      {/* Menu Preview */}
                      {menu.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Menü</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {menu.slice(0, 4).map(item => (
                              <div key={item.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer">
                                <img src={item.image} alt={item.name} className="w-full h-32 object-cover" />
                                <div className="p-3">
                                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                  <p className="text-red-600 font-bold">{item.price}₺</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => setActiveTab('menu')}
                          >
                            Tüm Menüyü Gör
                          </Button>
                        </div>
                      )}

                      {/* More Info */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Daha Fazla Bilgi</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="font-semibold">Teslimat:</span>
                            <span>{restaurant.deliveryFee}₺</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="font-semibold">Min. Sipariş:</span>
                            <span>{restaurant.minOrder}₺</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="font-semibold">Teslimat Süresi:</span>
                            <span>{restaurant.deliveryTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Order Tab */}
                  <TabsContent value="order" className="p-6">
                    {!restaurant.isOpen ? (
                      <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">Bu restoran şu anda kapalı.</p>
                      </div>
                    ) : menu.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">Menü henüz eklenmedi.</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {categories.map(category => (
                          <div key={category}>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{category}</h3>
                            <div className="space-y-4">
                              {menu.filter(item => item.category === category).map(item => (
                                <div key={item.id} className="flex gap-4 p-4 border rounded-xl hover:shadow-md transition">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-lg font-bold text-red-600">{item.price}₺</span>
                                      <Button
                                        onClick={() => handleAddToCart(item)}
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Ekle
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Reviews Tab */}
                  <TabsContent value="reviews" className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-gray-900">{restaurant.rating}</div>
                          <div className="flex items-center justify-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < Math.floor(restaurant.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{restaurant.reviewCount} Değerlendirme</p>
                        </div>
                      </div>

                      {reviews.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500">Henüz yorum yapılmamış.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reviews.map(review => (
                            <div key={review.id} className="p-4 border rounded-xl">
                              <div className="flex items-start gap-4">
                                <img
                                  src={review.userAvatar || `https://i.pravatar.cc/150?u=${review.userId}`}
                                  alt={review.userName}
                                  className="w-12 h-12 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                                    <span className="text-sm text-gray-500">
                                      {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-gray-700">{review.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Photos Tab */}
                  <TabsContent value="photos" className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                      {mockImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt=""
                          className="w-full h-48 object-cover rounded-xl cursor-pointer hover:opacity-90 transition"
                        />
                      ))}
                    </div>
                  </TabsContent>

                  {/* Menu Tab */}
                  <TabsContent value="menu" className="p-6">
                    <div className="space-y-8">
                      {categories.map(category => (
                        <div key={category}>
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">{category}</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {menu.filter(item => item.category === category).map(item => (
                              <div key={item.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition">
                                <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
                                <div className="p-4">
                                  <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-red-600">{item.price}₺</span>
                                    {restaurant.isOpen && (
                                      <Button
                                        onClick={() => handleAddToCart(item)}
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Ekle
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Side - Order Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                {restaurant.isOpen && menu.length > 0 ? (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Sipariş Ver</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Online sipariş için menüden seçim yapın
                    </p>
                    <Button
                      onClick={() => setActiveTab('order')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold"
                    >
                      Menüyü Gör & Sipariş Ver
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Rezervasyon Yap</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Bu restoranda masa rezervasyonu yapabilirsiniz
                    </p>
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold"
                      disabled={!restaurant.isOpen}
                    >
                      {restaurant.isOpen ? 'Masa Rezervasyonu Yap' : 'Şu Anda Kapalı'}
                    </Button>
                  </>
                )}

                {/* Offers */}
                {restaurant.discount && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-semibold text-blue-900 mb-2">Aktif Fırsatlar</h4>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <span>💰</span>
                      <span>{restaurant.discount}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RestaurantDetailPage;
