import axios from 'axios';
import {API_BASE_URL} from '@env';
import {useAuthStore} from '../store/authStore';

export const api = axios.create({
  baseURL: API_BASE_URL || 'http://10.0.2.2:10000/api',
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
