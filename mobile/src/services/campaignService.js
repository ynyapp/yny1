import api from '../config/api';

export const campaignService = {
  // Get all campaigns
  getCampaigns: async () => {
    const response = await api.get('/api/campaigns');
    return response.data;
  },

  // Get active campaigns
  getActiveCampaigns: async () => {
    const response = await api.get('/api/campaigns/active');
    return response.data;
  },

  // Get campaign by ID
  getCampaignById: async (campaignId) => {
    const response = await api.get(`/api/campaigns/${campaignId}`);
    return response.data;
  },
};
