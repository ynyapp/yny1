import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, Star, Clock, MapPin, Search, X } from 'lucide-react';
import { mockRestaurants, cuisineTypes, turkishCities } from '../mockData';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';

const RestaurantsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'İstanbul');
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 3]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    filterRestaurants();
  }, [searchQuery, selectedCity, selectedCuisines, priceRange, minRating]);

  const filterRestaurants = () => {
    let filtered = [...mockRestaurants];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(r => r.location.includes(selectedCity));
    }

    // Cuisine filter
    if (selectedCuisines.length > 0) {
      filtered = filtered.filter(r => selectedCuisines.includes(r.cuisine));
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(r => r.rating >= minRating);
    }

    setRestaurants(filtered);
  };

  const toggleCuisine = (cuisine) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  const clearFilters = () => {
    setSelectedCuisines([]);
    setPriceRange([0, 3]);
    setMinRating(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 border rounded-lg px-4 py-2 bg-gray-50">
              <MapPin className="w-5 h-5 text-red-600" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-gray-700"
              >
                {turkishCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex items-center gap-2 border rounded-lg px-4 py-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Restoran veya yemek ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none outline-none text-gray-700"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="md:hidden"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Filtreler</h3>
                {(selectedCuisines.length > 0 || minRating > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    Temizle
                  </Button>
                )}
              </div>

              {/* Cuisine Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Mutfak</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cuisineTypes.map(cuisine => (
                    <div key={cuisine} className="flex items-center space-x-2">
                      <Checkbox
                        id={cuisine}
                        checked={selectedCuisines.includes(cuisine)}
                        onCheckedChange={() => toggleCuisine(cuisine)}
                      />
                      <label
                        htmlFor={cuisine}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {cuisine}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Minimum Puan</h4>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 3.0].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex items-center space-x-2 w-full py-2 px-3 rounded-lg transition-colors ${
                        minRating === rating
                          ? 'bg-red-50 text-red-600'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{rating} ve üstü</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant List */}
          <div className="flex-1">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {restaurants.length} Restoran Bulundu
              </h2>
              <p className="text-gray-600">{selectedCity} bölgesinde</p>
            </div>

            {restaurants.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-gray-500 text-lg">Arama kriterlerinize uygun restoran bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-48 h-48">
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
                            <span className="text-white font-semibold">Kapalı</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                            <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{restaurant.rating}</span>
                            <span className="text-gray-500 text-sm">({restaurant.reviewCount})</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {restaurant.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{restaurant.deliveryTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{restaurant.location}</span>
                          </div>
                          <span className="font-semibold text-gray-700">{restaurant.priceRange}</span>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                          Min. Sipariş: {restaurant.minOrder}₺ • Teslimat: {restaurant.deliveryFee}₺
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RestaurantsPage;