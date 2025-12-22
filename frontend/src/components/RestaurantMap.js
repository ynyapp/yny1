import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom restaurant marker icon
const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// User location marker
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map center updates
function MapCenterHandler({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Component to handle click events for location selection
function LocationSelector({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng);
      }
    },
  });
  return null;
}

export default function RestaurantMap({ 
  restaurants = [], 
  userLocation = null,
  center = [41.0082, 28.9784], // Istanbul default
  zoom = 13,
  height = '400px',
  onRestaurantClick,
  onLocationSelect,
  showUserLocation = true,
  selectable = false
}) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (latlng) => {
    setSelectedLocation(latlng);
    if (onLocationSelect) {
      onLocationSelect(latlng);
    }
  };

  return (
    <div style={{ height, width: '100%' }} className="rounded-xl overflow-hidden shadow-lg">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapCenterHandler center={center} />
        
        {selectable && <LocationSelector onLocationSelect={handleLocationSelect} />}
        
        {/* User location marker */}
        {showUserLocation && userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Konumunuz</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Selected location marker */}
        {selectable && selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Seçilen Konum</p>
                <p className="text-xs text-gray-500">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Restaurant markers */}
        {restaurants.map((restaurant) => {
          const coords = restaurant.location?.coordinates;
          if (!coords?.lat || !coords?.lng) return null;
          
          return (
            <Marker 
              key={restaurant.id} 
              position={[coords.lat, coords.lng]} 
              icon={restaurantIcon}
              eventHandlers={{
                click: () => onRestaurantClick && onRestaurantClick(restaurant),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <img 
                    src={restaurant.image} 
                    alt={restaurant.name} 
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-bold text-gray-900">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm">{restaurant.rating}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-sm text-gray-600">{restaurant.deliveryTime}</span>
                  </div>
                  {restaurant.distance && (
                    <p className="text-sm text-blue-600 mt-1">
                      {restaurant.distance} km uzaklıkta
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
