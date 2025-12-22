import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { geoAPI } from '../api';
import { Input } from './ui/input';
import { Button } from './ui/button';

export default function LocationSearch({ 
  onLocationSelect, 
  placeholder = "Adres ara...",
  showCurrentLocation = true 
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        searchLocations();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchLocations = async () => {
    try {
      setLoading(true);
      const data = await geoAPI.search(query);
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Location search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (location) => {
    setQuery(location.displayName);
    setShowResults(false);
    if (onLocationSelect) {
      onLocationSelect({
        lat: location.lat,
        lng: location.lng,
        address: location.displayName,
        details: location.address
      });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tarayıcınız konum servislerini desteklemiyor.');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await geoAPI.reverseGeocode(latitude, longitude);
          setQuery(data.displayName);
          if (onLocationSelect) {
            onLocationSelect({
              lat: latitude,
              lng: longitude,
              address: data.displayName,
              details: data.address
            });
          }
        } catch (error) {
          console.error('Reverse geocode error:', error);
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Konum alınamadı. Lütfen konum izni verin.');
        setGettingLocation(false);
      }
    );
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder={placeholder}
            className="pl-10 pr-4"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
          )}
        </div>
        
        {showCurrentLocation && (
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="flex-shrink-0"
          >
            {gettingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectLocation(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-900 line-clamp-2">{result.displayName}</p>
                  <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Click outside handler */}
      {showResults && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
