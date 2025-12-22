import api from '../config/api';

export const restaurantService = {
  // Get all restaurants
  getRestaurants: async (params = {}) => {
    const response = await api.get('/api/restaurants', { params });
    return response.data;
  },

  // Get restaurant by ID
  getRestaurantById: async (id) => {
    const response = await api.get(`/api/restaurants/id/${id}`);
    return response.data;
  },

  // Get restaurant menu
  getRestaurantMenu: async (restaurantId) => {
    const response = await api.get(`/api/menu/${restaurantId}`);
    return response.data;
  },

  // Get collections
  getCollections: async () => {
    const response = await api.get('/api/collections/');
    return response.data;
  },

  // Search location
  searchLocation: async (query) => {
    const response = await api.get('/api/geo/search', { params: { q: query } });
    return response.data;
  },
};
