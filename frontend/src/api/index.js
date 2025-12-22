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

  getByRestaurant: async (restaurantId) => {
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

// Geo/Location API
export const geoAPI = {
  search: async (query) => {
    const response = await axiosInstance.get('/geo/search', { params: { q: query } });
    return response.data;
  },

  reverseGeocode: async (lat, lng) => {
    const response = await axiosInstance.get('/geo/reverse', { params: { lat, lng } });
    return response.data;
  },

  getNearbyRestaurants: async (lat, lng, radius = 5) => {
    const response = await axiosInstance.get('/geo/restaurants/nearby', { params: { lat, lng, radius } });
    return response.data;
  },

  getRoute: async (startLat, startLng, endLat, endLng) => {
    const response = await axiosInstance.get('/geo/route', { 
      params: { start_lat: startLat, start_lng: startLng, end_lat: endLat, end_lng: endLng } 
    });
    return response.data;
  },

  getCities: async () => {
    const response = await axiosInstance.get('/geo/cities');
    return response.data;
  },

  checkDeliveryArea: async (restaurantId, lat, lng) => {
    const response = await axiosInstance.get('/geo/delivery-area/check', { 
      params: { restaurant_id: restaurantId, lat, lng } 
    });
    return response.data;
  },
};

// Coupons API
export const couponsAPI = {
  validate: async (code, restaurantId, orderAmount) => {
    const response = await axiosInstance.get(`/coupons/validate/${code}`, { 
      params: { restaurant_id: restaurantId, order_amount: orderAmount } 
    });
    return response.data;
  },

  apply: async (code, orderId, discountApplied) => {
    const response = await axiosInstance.post('/coupons/apply', { code, orderId, discountApplied });
    return response.data;
  },

  getMyCoupons: async () => {
    const response = await axiosInstance.get('/coupons/my-coupons');
    return response.data;
  },
};

// Campaigns API
export const campaignsAPI = {
  getActive: async (campaignType, city) => {
    const response = await axiosInstance.get('/campaigns/active', { 
      params: { campaign_type: campaignType, city } 
    });
    return response.data;
  },

  getHomepage: async () => {
    const response = await axiosInstance.get('/campaigns/homepage');
    return response.data;
  },

  recordClick: async (campaignId) => {
    const response = await axiosInstance.post(`/campaigns/${campaignId}/click`);
    return response.data;
  },
};

// Reservations API
export const reservationsAPI = {
  create: async (reservationData) => {
    const response = await axiosInstance.post('/reservations', reservationData);
    return response.data;
  },

  getMyReservations: async (status) => {
    const response = await axiosInstance.get('/reservations/my-reservations', { params: { status } });
    return response.data;
  },

  getById: async (reservationId) => {
    const response = await axiosInstance.get(`/reservations/${reservationId}`);
    return response.data;
  },

  cancel: async (reservationId, reason) => {
    const response = await axiosInstance.put(`/reservations/${reservationId}/cancel`, { reason });
    return response.data;
  },

  getAvailability: async (restaurantId, date) => {
    const response = await axiosInstance.get(`/reservations/restaurant/${restaurantId}/availability`, { 
      params: { date } 
    });
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (unreadOnly = false, limit = 20) => {
    const response = await axiosInstance.get('/notifications', { params: { unread_only: unreadOnly, limit } });
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.put('/notifications/read-all');
    return response.data;
  },

  delete: async (notificationId) => {
    const response = await axiosInstance.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboard: async () => {
    const response = await axiosInstance.get('/admin/analytics/dashboard');
    return response.data;
  },

  getOrderAnalytics: async (period = 'week') => {
    const response = await axiosInstance.get('/admin/analytics/orders', { params: { period } });
    return response.data;
  },

  getUserAnalytics: async () => {
    const response = await axiosInstance.get('/admin/analytics/users');
    return response.data;
  },

  // Restaurants
  getRestaurants: async (page = 1, limit = 20, search, city, cuisine) => {
    const response = await axiosInstance.get('/admin/restaurants', { 
      params: { page, limit, search, city, cuisine } 
    });
    return response.data;
  },

  getRestaurantDetails: async (restaurantId) => {
    const response = await axiosInstance.get(`/admin/restaurants/${restaurantId}`);
    return response.data;
  },

  createRestaurant: async (restaurantData) => {
    const response = await axiosInstance.post('/admin/restaurants', restaurantData);
    return response.data;
  },

  updateRestaurant: async (restaurantId, restaurantData) => {
    const response = await axiosInstance.put(`/admin/restaurants/${restaurantId}`, restaurantData);
    return response.data;
  },

  deleteRestaurant: async (restaurantId) => {
    const response = await axiosInstance.delete(`/admin/restaurants/${restaurantId}`);
    return response.data;
  },

  // Menu Items
  getMenuItems: async (restaurantId, category) => {
    const response = await axiosInstance.get('/admin/menu-items', { 
      params: { restaurant_id: restaurantId, category } 
    });
    return response.data;
  },

  createMenuItem: async (menuItemData) => {
    const response = await axiosInstance.post('/admin/menu-items', menuItemData);
    return response.data;
  },

  updateMenuItem: async (itemId, itemData) => {
    const response = await axiosInstance.put(`/admin/menu-items/${itemId}`, itemData);
    return response.data;
  },

  deleteMenuItem: async (itemId) => {
    const response = await axiosInstance.delete(`/admin/menu-items/${itemId}`);
    return response.data;
  },

  // Orders
  getOrders: async (page = 1, limit = 20, status, restaurantId) => {
    const response = await axiosInstance.get('/admin/orders', { 
      params: { page, limit, status, restaurant_id: restaurantId } 
    });
    return response.data;
  },

  getOrderDetails: async (orderId) => {
    const response = await axiosInstance.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  updateOrderStatus: async (orderId, status, reason) => {
    const response = await axiosInstance.put(`/admin/orders/${orderId}/status`, { status, reason });
    return response.data;
  },

  // Users
  getUsers: async (page = 1, limit = 20, search) => {
    const response = await axiosInstance.get('/admin/users', { params: { page, limit, search } });
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await axiosInstance.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  makeUserAdmin: async (userId) => {
    const response = await axiosInstance.put(`/admin/users/${userId}/make-admin`);
    return response.data;
  },

  // Coupons
  getCoupons: async (isActive) => {
    const response = await axiosInstance.get('/admin/coupons', { params: { is_active: isActive } });
    return response.data;
  },

  createCoupon: async (couponData) => {
    const response = await axiosInstance.post('/admin/coupons', couponData);
    return response.data;
  },

  updateCoupon: async (couponId, couponData) => {
    const response = await axiosInstance.put(`/admin/coupons/${couponId}`, couponData);
    return response.data;
  },

  deleteCoupon: async (couponId) => {
    const response = await axiosInstance.delete(`/admin/coupons/${couponId}`);
    return response.data;
  },

  getCouponUsage: async (couponId) => {
    const response = await axiosInstance.get(`/admin/coupons/${couponId}/usage`);
    return response.data;
  },

  // Campaigns
  getCampaigns: async (isActive, campaignType) => {
    const response = await axiosInstance.get('/admin/campaigns', { 
      params: { is_active: isActive, campaign_type: campaignType } 
    });
    return response.data;
  },

  createCampaign: async (campaignData) => {
    const response = await axiosInstance.post('/admin/campaigns', campaignData);
    return response.data;
  },

  updateCampaign: async (campaignId, campaignData) => {
    const response = await axiosInstance.put(`/admin/campaigns/${campaignId}`, campaignData);
    return response.data;
  },

  deleteCampaign: async (campaignId) => {
    const response = await axiosInstance.delete(`/admin/campaigns/${campaignId}`);
    return response.data;
  },

  getCampaignAnalytics: async (campaignId) => {
    const response = await axiosInstance.get(`/admin/campaigns/${campaignId}/analytics`);
    return response.data;
  },

  // API Keys
  getAPIKeys: async () => {
    const response = await axiosInstance.get('/admin/api-keys');
    return response.data;
  },

  createAPIKey: async (apiKeyData) => {
    const response = await axiosInstance.post('/admin/api-keys', apiKeyData);
    return response.data;
  },

  updateAPIKey: async (keyId, keyData) => {
    const response = await axiosInstance.put(`/admin/api-keys/${keyId}`, keyData);
    return response.data;
  },

  deleteAPIKey: async (keyId) => {
    const response = await axiosInstance.delete(`/admin/api-keys/${keyId}`);
    return response.data;
  },

  getAPIKeyUsage: async (keyId) => {
    const response = await axiosInstance.get(`/admin/api-keys/${keyId}/usage`);
    return response.data;
  },

  // Reviews
  getReviews: async (restaurantId, minRating) => {
    const response = await axiosInstance.get('/admin/reviews', { 
      params: { restaurant_id: restaurantId, min_rating: minRating } 
    });
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await axiosInstance.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  },

  // Reservations
  getReservations: async (status, restaurantId, date) => {
    const response = await axiosInstance.get('/admin/reservations', { 
      params: { status, restaurant_id: restaurantId, date } 
    });
    return response.data;
  },

  updateReservationStatus: async (reservationId, status, reason) => {
    const response = await axiosInstance.put(`/admin/reservations/${reservationId}/status`, { status, reason });
    return response.data;
  },

  // Notifications
  sendBulkNotification: async (notificationData) => {
    const response = await axiosInstance.post('/admin/notifications/send-bulk', notificationData);
    return response.data;
  },

  // Settings
  getSettings: async () => {
    const response = await axiosInstance.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (settingsData) => {
    const response = await axiosInstance.put('/admin/settings', settingsData);
    return response.data;
  },
};