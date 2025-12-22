import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, ChevronRight, Star, Clock, Bike, Utensils, Coffee, Pizza, Flame, Fish, Salad, IceCream, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { restaurantsAPI, campaignsAPI, geoAPI, collectionsAPI } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RestaurantMap from '../components/RestaurantMap';
import LocationSearch from '../components/LocationSearch';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('İstanbul');
  const [searchQuery, setSearchQuery] = useState('');
  const [popularRestaurants, setPopularRestaurants] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [collections, setCollections] = useState([]);
  const [cities, setCities] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadPopularRestaurants();
    loadCampaigns();
    loadCities();
    loadCollections();
  }, []);

  const loadPopularRestaurants = async () => {
    try {
      const data = await restaurantsAPI.getAll({ city: 'İstanbul', page_size: 8 });
      setPopularRestaurants(data.items || data || []);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const data = await campaignsAPI.getHomepage();
      setCampaigns(data || []);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  };

  const loadCollections = async () => {
    try {
      const data = await collectionsAPI.getAll(null, 8);
      setCollections(data || []);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const loadCities = async () => {
    try {
      const data = await geoAPI.getCities();
      setCities(data || []);
    } catch (error) {
      setCities([{ city: 'İstanbul', restaurantCount: 8 }]);
    }
  };

  const handleLocationSelect = async (location) => {
    setUserLocation({ lat: location.lat, lng: location.lng });
    try {
      const nearby = await geoAPI.getNearbyRestaurants(location.lat, location.lng, 10);
      setNearbyRestaurants(nearby || []);
      setShowMap(true);
    } catch (error) {
      console.error('Failed to load nearby restaurants:', error);
    }
  };

  const handleSearch = () => {
    navigate(`/restaurants?city=${selectedCity}&search=${searchQuery}`);
  };

  const cuisineCategories = [
    { name: 'Kebap', icon: Flame, color: 'bg-orange-100 text-orange-600', query: 'Kebap' },
    { name: 'Pizza', icon: Pizza, color: 'bg-red-100 text-red-600', query: 'Pizza' },
    { name: 'Burger', icon: Utensils, color: 'bg-yellow-100 text-yellow-600', query: 'Burger' },
    { name: 'Balık', icon: Fish, color: 'bg-blue-100 text-blue-600', query: 'Balık' },
    { name: 'Salata', icon: Salad, color: 'bg-green-100 text-green-600', query: 'Salata' },
    { name: 'Tatlı', icon: IceCream, color: 'bg-pink-100 text-pink-600', query: 'Tatlı' },
    { name: 'Kahvaltı', icon: Coffee, color: 'bg-amber-100 text-amber-600', query: 'Kahvaltı' },
    { name: 'Dünya', icon: Utensils, color: 'bg-purple-100 text-purple-600', query: '' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - Modern Design */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-500 to-orange-500">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Bike className="w-4 h-4" />
                <span className="text-sm font-medium">30 dakikada kapınızda</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Lezzetin Yeni
                <br />
                <span className="text-yellow-300">Adresi</span>
              </h1>
              
              <p className="text-lg text-white/90 mb-8 max-w-lg">
                Türkiye'nin en sevilen restoranlarından dilediğin yemeği hızlıca kapına sipariş et.
              </p>

              {/* Search Box */}
              <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-xl">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <LocationSearch 
                      onLocationSelect={handleLocationSelect}
                      placeholder="Adresinizi girin..."
                    />
                  </div>
                  <Button
                    onClick={() => nearbyRestaurants.length > 0 ? navigate('/restaurants') : handleSearch()}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Keşfet
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-8 mt-10">
                <div>
                  <p className="text-3xl font-bold">500+</p>
                  <p className="text-white/70 text-sm">Restoran</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">50K+</p>
                  <p className="text-white/70 text-sm">Mutlu Müşteri</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">4.8</p>
                  <p className="text-white/70 text-sm">Ortalama Puan</p>
                </div>
              </div>
            </div>

            {/* Right Content - Food Images */}
            <div className="hidden lg:block relative">
              <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-400 rounded-full opacity-20 blur-3xl"></div>
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img 
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop" 
                    alt="Pizza" 
                    className="rounded-2xl shadow-xl w-full h-40 object-cover transform hover:scale-105 transition"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=250&fit=crop" 
                    alt="Burger" 
                    className="rounded-2xl shadow-xl w-full h-52 object-cover transform hover:scale-105 transition"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <img 
                    src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=250&fit=crop" 
                    alt="BBQ" 
                    className="rounded-2xl shadow-xl w-full h-52 object-cover transform hover:scale-105 transition"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=300&h=200&fit=crop" 
                    alt="Salad" 
                    className="rounded-2xl shadow-xl w-full h-40 object-cover transform hover:scale-105 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Cuisine Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Ne Yemek İstersin?</h2>
          <button 
            onClick={() => navigate('/restaurants')}
            className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            Tümünü Gör <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
          {cuisineCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.name}
                onClick={() => navigate(`/restaurants?cuisine=${category.query}`)}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:shadow-lg transition group"
              >
                <div className={`w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center group-hover:scale-110 transition`}>
                  <Icon className="w-8 h-8" />
                </div>
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Collections Section */}
      {collections.length > 0 && (
        <section className="container mx-auto px-4 py-12 bg-gray-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Koleksiyonlar</h2>
              <p className="text-gray-500 mt-1">Özel seçilmiş restoranlar</p>
            </div>
            <button 
              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              Tümünü Gör <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {collections.map((collection) => (
              <div 
                key={collection.id}
                onClick={() => navigate(`/restaurants?collection=${collection.id}`)}
                className="min-w-[280px] cursor-pointer group"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition">
                  <img 
                    src={collection.image} 
                    alt={collection.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <h3 className="font-bold text-lg">{collection.title}</h3>
                      <p className="text-sm text-white/80">{collection.restaurantCount} restoran</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Campaigns Banner */}
      {campaigns.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Kampanyalar</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.slice(0, 3).map((campaign) => (
              <div 
                key={campaign.id}
                className="relative overflow-hidden rounded-2xl cursor-pointer group"
                onClick={() => campaignsAPI.recordClick(campaign.id)}
              >
                <img 
                  src={campaign.image} 
                  alt={campaign.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="font-bold text-lg">{campaign.title}</h3>
                    <p className="text-sm text-white/80">{campaign.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Map Section (shows when location is selected) */}
      {showMap && nearbyRestaurants.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Yakınınızdaki Restoranlar</h2>
            <span className="text-gray-500">{nearbyRestaurants.length} restoran bulundu</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <RestaurantMap 
              restaurants={nearbyRestaurants.slice(0, 10)}
              userLocation={userLocation}
              center={userLocation ? [userLocation.lat, userLocation.lng] : [41.0082, 28.9784]}
              height="400px"
              onRestaurantClick={(r) => navigate(`/restaurant/${r.id}`)}
            />
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {nearbyRestaurants.slice(0, 5).map((restaurant) => (
                <div 
                  key={restaurant.id}
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  className="flex gap-4 p-4 bg-white rounded-xl border hover:shadow-md transition cursor-pointer"
                >
                  <img 
                    src={restaurant.image} 
                    alt={restaurant.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {restaurant.rating}
                      </span>
                      <span className="text-blue-600 font-medium">{restaurant.distance} km</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Restaurants */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Popüler Restoranlar</h2>
            <p className="text-gray-500 mt-1">En çok tercih edilen lezzetler</p>
          </div>
          <button 
            onClick={() => navigate('/restaurants')}
            className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            Tümünü Gör <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularRestaurants.slice(0, 8).map((restaurant) => (
            <div 
              key={restaurant.id}
              onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition cursor-pointer group"
            >
              <div className="relative">
                <img 
                  src={restaurant.image} 
                  alt={restaurant.name}
                  className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                />
                {restaurant.hasDelivery && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Teslimat
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold">{restaurant.rating}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{restaurant.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{restaurant.cuisine}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <span className="text-gray-400">{restaurant.priceRange}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cities Section */}
      {cities.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Hizmet Verdiğimiz Şehirler</h2>
            <div className="flex flex-wrap gap-4">
              {cities.map((city) => (
                <button
                  key={city.city}
                  onClick={() => navigate(`/restaurants?city=${city.city}`)}
                  className="flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition"
                >
                  <MapPin className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-700">{city.city}</span>
                  <span className="text-sm text-gray-400">({city.restaurantCount})</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nasıl Çalışır?</h2>
          <p className="text-gray-500">3 adımda siparişinizi verin</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Konum Seçin', desc: 'Adresinizi girin veya konumunuzu paylaşın', color: 'bg-red-100 text-red-600' },
            { step: '02', title: 'Restoran Seçin', desc: 'Yüzlerce restoran arasından seçim yapın', color: 'bg-orange-100 text-orange-600' },
            { step: '03', title: 'Siparişi Alın', desc: 'Kapınıza kadar teslimat ile keyfini çıkarın', color: 'bg-green-100 text-green-600' },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl font-bold">{item.step}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-red-600 to-orange-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Hemen Sipariş Verin</h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            İlk siparişinize özel %20 indirim fırsatını kaçırmayın!
          </p>
          <Button 
            onClick={() => navigate('/restaurants')}
            className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold text-lg"
          >
            Restoranları Keşfet <ArrowRight className="w-5 h-5 ml-2 inline" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
