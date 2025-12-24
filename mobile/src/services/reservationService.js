import api from '../config/api';

export const reservationService = {
  // Create a new reservation
  createReservation: async (reservationData) => {
    const response = await api.post('/api/reservations/', reservationData);
    return response.data;
  },

  // Get user's reservations
  getUserReservations: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/api/reservations/my-reservations', { params });
    return response.data;
  },

  // Get reservation by ID
  getReservationById: async (reservationId) => {
    const response = await api.get(`/api/reservations/${reservationId}`);
    return response.data;
  },

  // Cancel a reservation
  cancelReservation: async (reservationId) => {
    const response = await api.put(`/api/reservations/${reservationId}/cancel`);
    return response.data;
  },
};
