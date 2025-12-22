import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Filter, Star, Clock, MapPin, Search, X, SlidersHorizontal, 
  Grid, List, ChevronDown, Bike, UtensilsCrossed, Heart
} from 'lucide-react';
import { restaurantsAPI, geoAPI } from '../api';
import { cuisineTypes } from '../mockData';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FilterModal from '../components/FilterModal';
import RestaurantMap from '../components/RestaurantMap';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const RestaurantsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'İstanbul');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || '');
  const [selectedFeature, setSelectedFeature] = useState(searchParams.get('feature') || '');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or map
  const [serviceType, setServiceType] = useState('all'); // all, delivery, dineIn
  const [cities, setCities] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  
  const [filters, setFilters] = useState({
    selectedCuisines: selectedCuisine ? [selectedCuisine] : [],
    minRating: 0,
    sortBy: 'popularity',
    pureVeg: false,
    openNow: false,
    petFriendly: false,
    outdoorSeating: false,
  });

  const quickFilters = [
    { id: 'rating4', label: 'Puan: 4.0+', active: filters.minRating >= 4 },
    { id: 'rating45', label: 'Puan: 4.5+', active: filters.minRating >= 4.5 },
    { id: 'openNow', label: 'Şu An Açık', active: filters.openNow },
    { id: 'veg', label: 'Vejetaryen', active: filters.pureVeg },
    { id: 'petFriendly', label: 'Pet Friendly', active: filters.petFriendly },
    { id: 'outdoorSeating', label: 'Açık Hava', active: filters.outdoorSeating },
  ];

  useEffect(() => {
    loadCities();
    getUserLocation();
    fetchRestaurants();
  }, [searchQuery, selectedCity, filters, serviceType, selectedFeature, nearbyOnly]);

  useEffect(() => {
    // Update feature from URL params
    const feature = searchParams.get('feature');
    if (feature) {
      setSelectedFeature(feature);
    }
  }, [searchParams]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or not available');
        }
      );
    }
  };

  const loadCities = async () => {
    try {
      const data = await geoAPI.getCities();
      setCities(data || [{ city: 'İstanbul', restaurantCount: 8 }]);
    } catch {
      setCities([{ city: 'İstanbul', restaurantCount: 8 }]);
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = {
        city: selectedCity,
        search: searchQuery,
        min_rating: filters.minRating || undefined,
        feature: selectedFeature || undefined,
      };
      
      // Add user location for nearby search
      if (userLocation && nearbyOnly) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
        params.max_distance = 10; // 10 km radius
      } else if (userLocation) {
        // Always send location to calculate distance
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      
      if (filters.selectedCuisines.length > 0) {
        params.cuisine = filters.selectedCuisines[0];
      }

      const data = await restaurantsAPI.getAll(params);
      let filtered = data.items || data || [];

      // Apply service type filter
      if (serviceType === 'delivery') {
        filtered = filtered.filter(r => r.hasDelivery !== false);
      } else if (serviceType === 'dineIn') {
        filtered = filtered.filter(r => r.hasTableBooking);
      }

      // Apply additional filters
      if (filters.pureVeg) {
        filtered = filtered.filter(r => r.tags?.includes('Vejetaryen'));
      }
      if (filters.openNow) {
        filtered = filtered.filter(r => r.isOpen !== false);
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
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'deliveryTime':
        return sorted.sort((a, b) => {
          const timeA = parseInt(a.deliveryTime) || 30;
          const timeB = parseInt(b.deliveryTime) || 30;
          return timeA - timeB;
        });
      case 'costLowToHigh':
        return sorted.sort((a, b) => (a.priceRange?.length || 2) - (b.priceRange?.length || 2));
      case 'costHighToLow':
        return sorted.sort((a, b) => (b.priceRange?.length || 2) - (a.priceRange?.length || 2));
      default:
        return sorted;
    }
  };

  const toggleQuickFilter = (filterId) => {
    if (filterId === 'rating4') {
      setFilters(prev => ({ ...prev, minRating: prev.minRating >= 4 ? 0 : 4 }));
    } else if (filterId === 'rating45') {
      setFilters(prev => ({ ...prev, minRating: prev.minRating >= 4.5 ? 0 : 4.5 }));
    } else if (filterId === 'openNow') {
      setFilters(prev => ({ ...prev, openNow: !prev.openNow }));
    } else if (filterId === 'veg') {
      setFilters(prev => ({ ...prev, pureVeg: !prev.pureVeg }));
    } else if (filterId === 'petFriendly') {
      setFilters(prev => ({ ...prev, petFriendly: !prev.petFriendly }));
    } else if (filterId === 'outdoorSeating') {
      setFilters(prev => ({ ...prev, outdoorSeating: !prev.outdoorSeating }));
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  const clearAllFilters = () => {
    setFilters({
      selectedCuisines: [],
      minRating: 0,
      sortBy: 'popularity',
      pureVeg: false,
      openNow: false,
      petFriendly: false,
      outdoorSeating: false,
    });
    setSearchQuery('');
    setSelectedCuisine('');
  };

  const hasActiveFilters = filters.minRating > 0 || filters.openNow || filters.pureVeg || filters.petFriendly || filters.outdoorSeating || filters.selectedCuisines.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          {/* Search & Location Row */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Location Selector */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-3 min-w-[200px]">
              <MapPin className="w-5 h-5 text-red-600" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent border-none outline-none text-gray-700 font-medium flex-1"
              >
                {cities.map(c => (
                  <option key={c.city} value={c.city}>{c.city}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Restoran veya yemek ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 rounded-xl border-gray-200"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Service Type Tabs & Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Service Type */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              {[
                { id: 'all', label: 'Tümü', icon: UtensilsCrossed },
                { id: 'delivery', label: 'Teslimat', icon: Bike },
                { id: 'dineIn', label: 'Dine-in', icon: UtensilsCrossed },
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setServiceType(type.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                      serviceType === type.id 
                        ? 'bg-white text-red-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Filters & Filter Button */}
            <div className="flex items-center gap-2 flex-wrap">
              {quickFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => toggleQuickFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                    filter.active 
                      ? 'bg-red-50 border-red-200 text-red-600' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}

              <Button 
                variant="outline" 
                onClick={() => setShowFilterModal(true)}
                className="rounded-full"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtreler
                {hasActiveFilters && (
                  <span className="ml-2 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded ${viewMode === 'map' ? 'bg-white shadow-sm' : ''}`}
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cuisine Chips */}
      <div className="bg-white border-b py-3">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilters(prev => ({ ...prev, selectedCuisines: [] }))}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filters.selectedCuisines.length === 0
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tümü
            </button>
            {cuisineTypes.slice(0, 12).map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setFilters(prev => ({
                  ...prev,
                  selectedCuisines: prev.selectedCuisines.includes(cuisine) ? [] : [cuisine]
                }))}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  filters.selectedCuisines.includes(cuisine)
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {selectedCity} Restoranları
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {restaurants.length} restoran bulundu
            </p>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearAllFilters} className="text-red-600">
              <X className="w-4 h-4 mr-1" /> Filtreleri Temizle
            </Button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">Restoran Bulunamadı</h3>
            <p className="text-gray-500 mt-2">Farklı filtreler deneyebilirsiniz</p>
            <Button onClick={clearAllFilters} className="mt-4">
              Filtreleri Temizle
            </Button>
          </div>
        ) : viewMode === 'map' ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <RestaurantMap 
              restaurants={restaurants}
              height="600px"
              onRestaurantClick={(r) => navigate(`/restaurant/${r.id}`)}
            />
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {restaurants.map((restaurant) => (
                <RestaurantCard 
                  key={restaurant.id} 
                  restaurant={restaurant} 
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  compact
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant} 
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal 
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />

      <Footer />
    </div>
  );
};

// Restaurant Card Component
const RestaurantCard = ({ restaurant, onClick, compact = false }) => {
  const [liked, setLiked] = useState(false);

  if (compact) {
    return (
      <div 
        onClick={onClick}
        className="flex gap-4 p-4 bg-white rounded-xl border hover:shadow-md transition cursor-pointer"
      >
        <img 
          src={restaurant.image || 'https://via.placeholder.com/100'} 
          alt={restaurant.name}
          className="w-24 h-24 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{restaurant.name}</h3>
          <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              {restaurant.rating || 'N/A'}
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <Clock className="w-4 h-4" />
              {restaurant.deliveryTime || '30-40 dk'}
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            {restaurant.hasDelivery !== false && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Teslimat</span>
            )}
            {restaurant.hasTableBooking && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Rezervasyon</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition cursor-pointer group"
    >
      <div className="relative">
        <img 
          src={restaurant.image || 'https://via.placeholder.com/400x200'} 
          alt={restaurant.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {restaurant.hasDelivery !== false && (
            <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
              <Bike className="w-3 h-3" /> Teslimat
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold">{restaurant.rating || 'N/A'}</span>
        </div>

        {/* Like Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition"
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{restaurant.name}</h3>
            <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>{restaurant.deliveryTime || '30-40 dk'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-sm">{restaurant.priceRange || '₺₺'}</span>
            {restaurant.minOrder && (
              <span className="text-gray-400 text-sm ml-2">Min: {restaurant.minOrder}₺</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantsPage;
