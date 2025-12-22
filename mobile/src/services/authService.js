import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { token, user } = response.data;
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    const { token, user } = response.data;
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
