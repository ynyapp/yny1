import api from '../config/api';

export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/api/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/api/user/profile', userData);
    return response.data;
  },

  // Get user addresses
  getAddresses: async () => {
    const response = await api.get('/api/user/addresses');
    return response.data;
  },

  // Add new address
  addAddress: async (addressData) => {
    const response = await api.post('/api/user/addresses', addressData);
    return response.data;
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    const response = await api.put(`/api/user/addresses/${addressId}`, addressData);
    return response.data;
  },

  // Delete address
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/api/user/addresses/${addressId}`);
    return response.data;
  },

  // Set default address
  setDefaultAddress: async (addressId) => {
    const response = await api.put(`/api/user/addresses/${addressId}/set-default`);
    return response.data;
  },
};
