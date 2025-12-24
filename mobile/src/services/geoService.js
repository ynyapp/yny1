import api from '../config/api';

export const geoService = {
  // Search location by query
  searchLocation: async (query) => {
    const response = await api.get('/api/geo/search', { params: { q: query } });
    return response.data;
  },

  // Get location details by coordinates
  getLocationByCoords: async (lat, lng) => {
    const response = await api.get('/api/geo/reverse', { params: { lat, lng } });
    return response.data;
  },
};
