import axiosInstance from './axios';

export const authAPI = {
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
};

export const restaurantsAPI = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/restaurants', { params });
    return response.data;
  },

  getBySlug: async (slug) => {
    const response = await axiosInstance.get(`/restaurants/${slug}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/restaurants/id/${id}`);
    return response.data;
  },
};

export const menuAPI = {
  getMenu: async (restaurantId) => {
    const response = await axiosInstance.get(`/menu/${restaurantId}`);
    return response.data;
  },
};

export const ordersAPI = {
  create: async (orderData) => {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  },

  getAll: async () => {
    const response = await axiosInstance.get('/orders');
    return response.data;
  },

  getById: async (orderId) => {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  },
};

export const reviewsAPI = {
  create: async (reviewData) => {
    const response = await axiosInstance.post('/reviews', reviewData);
    return response.data;
  },

  getByRestaurant: async (restaurantId) => {
    const response = await axiosInstance.get(`/reviews/${restaurantId}`);
    return response.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await axiosInstance.get('/user/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await axiosInstance.put('/user/profile', userData);
    return response.data;
  },

  addAddress: async (address) => {
    const response = await axiosInstance.post('/user/addresses', address);
    return response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await axiosInstance.delete(`/user/addresses/${addressId}`);
    return response.data;
  },
};