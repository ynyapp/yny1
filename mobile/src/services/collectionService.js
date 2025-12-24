import api from '../config/api';

export const collectionService = {
  // Get all collections
  getCollections: async () => {
    const response = await api.get('/api/collections/');
    return response.data;
  },

  // Get collection by ID
  getCollectionById: async (collectionId) => {
    const response = await api.get(`/api/collections/${collectionId}`);
    return response.data;
  },
};
