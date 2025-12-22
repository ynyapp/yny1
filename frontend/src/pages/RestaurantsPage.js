import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, Star, Clock, MapPin, Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { restaurantsAPI } from '../api';
import { cuisineTypes, turkishCities } from '../mockData';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Collections from '../components/Collections';
import FilterModal from '../components/FilterModal';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const RestaurantsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'İstanbul');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [serviceType, setServiceType] = useState('delivery');
  
  // Filter states
  const [filters, setFilters] = useState({
    selectedCuisines: [],
    minRating: 0,
    sortBy: 'popularity',
    pureVeg: false,
    openNow: false,
    outdoorSeating: false,
    petFriendly: false,
    servesAlcohol: false,
  });

  useEffect(() => {
    fetchRestaurants();
  }, [searchQuery, selectedCity, filters, serviceType]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = {
        city: selectedCity,
        search: searchQuery,
        min_rating: filters.minRating || undefined,
      };
      
      if (filters.selectedCuisines.length > 0) {
        params.cuisine = filters.selectedCuisines[0];
      }

      const data = await restaurantsAPI.getAll(params);
      let filtered = data.items || data;

      // Apply additional filters
      if (filters.pureVeg) {
        filtered = filtered.filter(r => r.tags?.includes('Vejetaryen'));
      }
      if (filters.openNow) {
        filtered = filtered.filter(r => r.isOpen);
      }

      // Sort restaurants
      filtered = sortRestaurants(filtered, filters.sortBy);

      setRestaurants(filtered);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const sortRestaurants = (restaurants, sortType) => {
    const sorted = [...restaurants];
    switch (sortType) {
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'cost_low':
        return sorted.sort((a, b) => a.minOrder - b.minOrder);
      case 'cost_high':
        return sorted.sort((a, b) => b.minOrder - a.minOrder);
      case 'delivery_time':
        return sorted.sort((a, b) => {
          const aTime = parseInt(a.deliveryTime.split('-')[0]);
          const bTime = parseInt(b.deliveryTime.split('-')[0]);
          return aTime - bTime;
        });
      default:
        return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      selectedCuisines: [],
      minRating: 0,
      sortBy: 'popularity',
      pureVeg: false,
      openNow: false,
      outdoorSeating: false,
      petFriendly: false,
      servesAlcohol: false,
    });
  };

  const hasActiveFilters = () => {
    return filters.selectedCuisines.length > 0 || 
           filters.minRating > 0 || 
           filters.pureVeg || 
           filters.openNow ||
           filters.outdoorSeating ||
           filters.petFriendly ||
           filters.servesAlcohol;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Search Bar - Sticky */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
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
                placeholder="Restoran, mutfak veya yemek ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none outline-none text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Service Type Tabs */}
        <div className="container mx-auto px-4">
          <Tabs value={serviceType} onValueChange={setServiceType} className="w-full">
            <TabsList className="w-full justify-start border-b-0 bg-transparent h-auto p-0">
              <TabsTrigger
                value="delivery"
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none pb-3 px-6 text-gray-600"
              >
                Paket Servis
              </TabsTrigger>
              <TabsTrigger
                value="dineout"
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none pb-3 px-6 text-gray-600"
              >
                Restoranda Yemek
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Collections */}
        <Collections />

        {/* Quick Filters Bar */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilterModal(true)}
            className="gap-2 whitespace-nowrap border-2"
          >
            <Filter className="w-4 h-4" />
            Filtreler
          </Button>

          <Button
            variant={filters.minRating >= 4.5 ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('minRating', filters.minRating === 4.5 ? 0 : 4.5)}
            className={`whitespace-nowrap ${filters.minRating >= 4.5 ? 'bg-red-600 text-white' : ''}`}
          >
            ⭐ Puan 4.5+
          </Button>

          <Button
            variant={filters.pureVeg ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('pureVeg', !filters.pureVeg)}
            className={`whitespace-nowrap ${filters.pureVeg ? 'bg-green-600 text-white hover:bg-green-700' : ''}`}
          >
            🥬 Vejeteryan
          </Button>

          <Button
            variant={filters.petFriendly ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('petFriendly', !filters.petFriendly)}
            className={`whitespace-nowrap ${filters.petFriendly ? 'bg-blue-600 text-white' : ''}`}
          >
            🐕 Evcil Hayvan Dostu
          </Button>

          <Button
            variant={filters.outdoorSeating ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('outdoorSeating', !filters.outdoorSeating)}
            className={`whitespace-nowrap ${filters.outdoorSeating ? 'bg-teal-600 text-white' : ''}`}
          >
            🌳 Açık Hava
          </Button>

          <Button
            variant={filters.servesAlcohol ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('servesAlcohol', !filters.servesAlcohol)}
            className={`whitespace-nowrap ${filters.servesAlcohol ? 'bg-purple-600 text-white' : ''}`}
          >
            🍷 Alkol Servisi
          </Button>

          <Button
            variant={filters.openNow ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('openNow', !filters.openNow)}
            className={`whitespace-nowrap ${filters.openNow ? 'bg-orange-600 text-white' : ''}`}
          >
            🕐 Şimdi Açık
          </Button>

          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700 whitespace-nowrap"
            >
              <X className="w-4 h-4 mr-1" />
              Temizle
            </Button>
          )}
        </div>

        {/* Restaurant Count & Sort */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {loading ? (
              <p className="text-gray-600">Yükleniyor...</p>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900">
                  {restaurants.length} Restoran
                </h2>
                <p className="text-gray-600">{selectedCity} • {serviceType === 'delivery' ? 'Paket Servis' : 'Restoranda Yemek'}</p>
              </>
            )}
          </div>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
          >
            <option value="popularity">Popülerlik</option>
            <option value="rating">En Yüksek Puan</option>
            <option value="delivery_time">Teslimat Süresi</option>
            <option value="cost_low">Düşük Fiyat</option>
            <option value="cost_high">Yüksek Fiyat</option>
          </select>
        </div>
        {/* Restaurant List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Restoranlar yükleniyor...</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Restoran Bulunamadı</h3>
            <p className="text-gray-600 mb-6">Arama kriterlerinize uygun restoran bulunamadı.</p>
            <Button onClick={clearAllFilters} className="bg-red-600 hover:bg-red-700 text-white">
              Filtreleri Temizle
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => navigate(`/restaurant/${restaurant.slug || restaurant.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 group"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Restaurant Image */}
                  <div className="relative w-full sm:w-72 h-56 sm:h-auto flex-shrink-0">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Discount Badge */}
                    {restaurant.discount && (
                      <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg flex items-center gap-1">
                        <span>💰</span>
                        {restaurant.discount}
                      </div>
                    )}

                    {/* Closed Overlay */}
                    {!restaurant.isOpen && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <div className="text-center text-white">
                          <p className="font-bold text-lg mb-1">Şu Anda Kapalı</p>
                          <p className="text-sm opacity-90">Yakında Açılacak</p>
                        </div>
                      </div>
                    )}

                    {/* Delivery Time Badge */}
                    {restaurant.isOpen && serviceType === 'delivery' && (
                      <div className="absolute bottom-3 left-3 bg-white px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-800 flex items-center gap-1.5 shadow-md">
                        <Clock className="w-4 h-4 text-red-600" />
                        {restaurant.deliveryTime}
                      </div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-bold text-sm shadow-lg">
                      <span>{restaurant.rating}</span>
                      <Star className="w-3.5 h-3.5 fill-white" />
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {restaurant.tags.slice(0, 4).map(tag => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Location & Price */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{restaurant.location?.city}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="font-semibold text-gray-800">{restaurant.priceRange}</span>
                      {serviceType === 'delivery' && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span>Min. {restaurant.minOrder}₺</span>
                        </>
                      )}
                    </div>

                    {/* Bottom Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {serviceType === 'delivery' && (
                          <>
                            <span>🚚 Teslimat: {restaurant.deliveryFee}₺</span>
                            <span className="text-gray-300">•</span>
                          </>
                        )}
                        <span>{restaurant.reviewCount} değerlendirme</span>
                      </div>

                      {serviceType === 'dineout' && restaurant.isOpen && (
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/restaurant/${restaurant.slug || restaurant.id}`);
                          }}
                        >
                          Rezervasyon Yap
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={fetchRestaurants}
        onClear={clearAllFilters}
      />

      <Footer />
    </div>
  );
};

export default RestaurantsPage;