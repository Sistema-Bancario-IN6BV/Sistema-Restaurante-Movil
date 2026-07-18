// src/shared/api/restaurantClient.js
import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints.js';
import useAuthStore from '../store/authStore.js';
import { refreshAccessToken } from './tokenRefresh.js';

/**
 * Axios client for the Node restaurant/admin API (`ENDPOINTS.RESTAURANT`).
 * Attaches the bearer token from `authStore` to every request. On a 401 it
 * tries to refresh the access token once and retries the original request;
 * if that also fails (or there's no refresh token) it logs the user out.
 */
const restaurantClient = axios.create({
  baseURL: ENDPOINTS.RESTAURANT,
  headers: {
    'Content-Type': 'application/json'
  }
});

restaurantClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

restaurantClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const newToken = await refreshAccessToken();
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return restaurantClient(originalRequest);
  }
);

export default restaurantClient;
