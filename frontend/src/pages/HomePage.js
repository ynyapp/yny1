import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, ArrowRight, TrendingUp, Clock, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { turkishCities, cuisineTypes } from '../mockData';
import { restaurantsAPI } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('İstanbul');
  const [searchQuery, setSearchQuery] = useState('');
  const [popularRestaurants, setPopularRestaurants] = useState([]);

  useEffect(() => {
    loadPopularRestaurants();
  }, []);

  const loadPopularRestaurants = async () => {
    try {
      const data = await restaurantsAPI.getAll({ city: 'İstanbul', page_size: 6 });
      setPopularRestaurants(data.items || data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    }
  };

  const handleSearch = () => {
    navigate(`/restaurants?city=${selectedCity}&search=${searchQuery}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-50 to-red-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Yemek Siparişi Hiç Bu Kadar Kolay Olmamıştı
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Binlerce restorandan sevdiğin yemekleri kapına sipariş et
            </p>

            {/* Search Box */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 border rounded-lg px-4 py-3 bg-gray-50">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-gray-700 font-medium"
                  >
                    {turkishCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 flex items-center gap-2 border rounded-lg px-4 py-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Restoran veya yemek ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 border-none outline-none text-gray-700"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Ara
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cuisine Categories */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popüler Mutfaklar</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {cuisineTypes.slice(0, 10).map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => navigate(`/restaurants?cuisine=${cuisine}`)}
              className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all transform hover:scale-105 border border-gray-200"
            >
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="font-semibold text-gray-900">{cuisine}</h3>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Restaurants */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Popüler Restoranlar</h2>
          <Button
            variant="ghost"
            onClick={() => navigate('/restaurants')}
            className="text-red-600 hover:text-red-700"
          >
            Tümünü Gör
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
            >
              <div className="relative h-48">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                {restaurant.discount && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {restaurant.discount}
                  </div>
                )}
                {!restaurant.isOpen && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">Şu Anda Kapalı</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{restaurant.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{restaurant.cuisine}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{restaurant.rating}</span>
                    <span className="text-gray-500">({restaurant.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-sm text-gray-600">{restaurant.location}</span>
                  <span className="text-sm font-semibold text-gray-700">{restaurant.priceRange}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Neden Yemek Nerede Yenir?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Binlerce Restoran</h3>
              <p className="text-gray-600">Türkiye'nin her yerinden binlerce restoran seçeneği</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Hızlı Teslimat</h3>
              <p className="text-gray-600">Siparişiniz ortalama 30 dakikada kapınızda</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <Star className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Güvenli Ödeme</h3>
              <p className="text-gray-600">Güvenli ödeme seçenekleri ile hızlı ödeme</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;