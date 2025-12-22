import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Phone, ArrowLeft, Plus, Minus } from 'lucide-react';
import { restaurantsAPI, menuAPI, reviewsAPI } from '../api';
import { useCart } from '../contexts/CartContext';
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
  const [activeTab, setActiveTab] = useState('menu');
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadRestaurantData();
  }, [id]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      // Try to fetch by slug first, if it fails, try by ID
      let restaurantData;
      try {
        restaurantData = await restaurantsAPI.getBySlug(id);
      } catch {
        restaurantData = await restaurantsAPI.getById(id);
      }
      
      setRestaurant(restaurantData);
      
      // Load menu
      const menuData = await menuAPI.getMenu(restaurantData.id);
      setMenu(menuData);
      
      // Load reviews if on reviews tab
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
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

  const handleAddToCart = (item) => {
    addToCart(item, restaurant);
    toast({
      title: "Sepete Eklendi",
      description: `${item.name} sepetinize eklendi`,
    });
  };

  const categories = [...new Set(menu.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster />

      {/* Restaurant Header */}
      <div className="relative h-80 bg-gray-900">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto px-4 pb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/restaurants')}
              className="text-white hover:bg-white/20 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </Button>
            <h1 className="text-4xl font-bold text-white mb-2">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{restaurant.rating}</span>
                <span className="opacity-75">({restaurant.reviewCount} değerlendirme)</span>
              </div>
              <div className="flex items-center gap-1 opacity-90">
                <Clock className="w-5 h-5" />
                <span>{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-1 opacity-90">
                <MapPin className="w-5 h-5" />
                <span>{restaurant.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Info Bar */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b-0 bg-transparent h-auto p-0">
              <TabsTrigger
                value="menu"
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none pb-4"
              >
                Menü
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none pb-4"
              >
                Yorumlar
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none pb-4"
              >
                Bilgiler
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div>
            {!restaurant.isOpen && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-semibold">Bu restoran şu anda kapalı. Ancak menüyü inceleyebilirsiniz.</p>
              </div>
            )}
            
            {menu.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-gray-500 text-lg">Menü henüz eklenmedi.</p>
              </div>
            ) : (
              categories.map(category => (
                <div key={category} className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menu
                      .filter(item => item.category === category)
                      .map(item => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                        >
                          <div className="flex">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-32 h-32 object-cover"
                            />
                            <div className="flex-1 p-4">
                              <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-red-600">{item.price}₺</span>
                                <Button
                                  onClick={() => handleAddToCart(item)}
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  disabled={!restaurant.isOpen}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Ekle
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-xl p-6 mb-6">
              <div className="flex items-center gap-6 mb-6">
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
                  <p className="text-sm text-gray-600 mt-1">{restaurant.reviewCount} değerlendirme</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {mockReviews.map(review => (
                <div key={review.id} className="bg-white rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={review.avatar}
                      alt={review.userName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                        <span className="text-sm text-gray-500">{review.date}</span>
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
          </div>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Adres</h3>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-600 mt-1" />
                  <p className="text-gray-700">{restaurant.location}</p>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Teslimat Bilgileri</h3>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-medium">Teslimat Süresi:</span> {restaurant.deliveryTime}</p>
                  <p><span className="font-medium">Minimum Sipariş:</span> {restaurant.minOrder}₺</p>
                  <p><span className="font-medium">Teslimat Ücreti:</span> {restaurant.deliveryFee}₺</p>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mutfak Türü</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default RestaurantDetailPage;