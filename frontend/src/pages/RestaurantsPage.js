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

      {/* Search Bar */}
      <div className="bg-white border-b sticky top-16 z-40">
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
          </div>
        </div>

        {/* Service Type Tabs */}
        <div className="container mx-auto px-4">
          <Tabs value={serviceType} onValueChange={setServiceType} className="w-full">
            <TabsList className="w-full justify-start border-b-0 bg-transparent h-auto p-0">
              <TabsTrigger
                value="delivery"
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none pb-3 px-6"
              >
                🛵 Delivery
              </TabsTrigger>
              <TabsTrigger
                value="dineout"
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none pb-3 px-6"
              >
                🍽️ Dining
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtreler
          </Button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="popularity">Popülerlik</option>
            <option value="rating">En Yüksek Puan</option>
            <option value="delivery_time">Teslimat Süresi</option>
            <option value="cost_low">Düşük Fiyat</option>
            <option value="cost_high">Yüksek Fiyat</option>
          </select>

          <Button
            variant={openNow ? "default" : "outline"}
            size="sm"
            onClick={() => setOpenNow(!openNow)}
            className={openNow ? "bg-red-600 text-white" : ""}
          >
            Şimdi Açık
          </Button>

          <Button
            variant={pureVeg ? "default" : "outline"}
            size="sm"
            onClick={() => setPureVeg(!pureVeg)}
            className={pureVeg ? "bg-green-600 text-white" : ""}
          >
            🥬 Vejeteryan
          </Button>

          {(selectedCuisines.length > 0 || minRating > 0 || pureVeg || openNow) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600"
            >
              <X className="w-4 h-4 mr-1" />
              Filtreleri Temizle
            </Button>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-32">
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
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Restoranlar yükleniyor...</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {restaurants.length} Restoran Bulundu
                  </h2>
                  <p className="text-gray-600">{selectedCity} bölgesinde • {serviceType === 'delivery' ? 'Paket Servis' : 'Restoranda Yemek'}</p>
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
                        onClick={() => navigate(`/restaurant/${restaurant.slug || restaurant.id}`)}
                        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative w-full sm:w-64 h-48">
                            <img
                              src={restaurant.image}
                              alt={restaurant.name}
                              className="w-full h-full object-cover"
                            />
                            {restaurant.discount && (
                              <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">
                                💰 {restaurant.discount}
                              </div>
                            )}
                            {!restaurant.isOpen && (
                              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">Şu Anda Kapalı</span>
                              </div>
                            )}
                            {restaurant.isOpen && serviceType === 'delivery' && (
                              <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {restaurant.deliveryTime}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-5">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{restaurant.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine}</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {restaurant.tags.slice(0, 3).map(tag => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded">
                                <span className="font-bold">{restaurant.rating}</span>
                                <Star className="w-3 h-3 fill-white" />
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{restaurant.location?.city}</span>
                              </div>
                              <span>•</span>
                              <span className="font-semibold text-gray-700">{restaurant.priceRange}</span>
                              {serviceType === 'delivery' && (
                                <>
                                  <span>•</span>
                                  <span>Min. {restaurant.minOrder}₺</span>
                                </>
                              )}
                            </div>
                            
                            {serviceType === 'delivery' && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t">
                                <span>🚚 Teslimat Ücreti: {restaurant.deliveryFee}₺</span>
                                <span>•</span>
                                <span>{restaurant.reviewCount} değerlendirme</span>
                              </div>
                            )}
                            
                            {serviceType === 'dineout' && restaurant.isOpen && (
                              <div className="mt-3">
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
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RestaurantsPage;