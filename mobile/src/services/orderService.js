import api from '../config/api';

export const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  // Get user's orders
  getUserOrders: async (params = {}) => {
    const response = await api.get('/api/orders/my-orders', { params });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  },

  // Cancel an order
  cancelOrder: async (orderId) => {
    const response = await api.put(`/api/orders/${orderId}/cancel`);
    return response.data;
  },

  // Track order
  trackOrder: async (orderId) => {
    const response = await api.get(`/api/orders/${orderId}/track`);
    return response.data;
  },
};
