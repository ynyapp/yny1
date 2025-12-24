import api from '../config/api';

export const reviewService = {
  // Get reviews for a restaurant
  getReviews: async (restaurantId) => {
    const response = await api.get(`/api/reviews/${restaurantId}`);
    return response.data;
  },

  // Create a new review
  createReview: async (reviewData) => {
    const response = await api.post('/api/reviews', reviewData);
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/api/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/api/reviews/${reviewId}`);
    return response.data;
  },
};
