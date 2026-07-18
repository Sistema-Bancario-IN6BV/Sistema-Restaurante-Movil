// src/shared/api/authClient.js
import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints.js';
import useAuthStore from '../store/authStore.js';
import { refreshAccessToken } from './tokenRefresh.js';

/**
 * Axios client for the AuthService API (`ENDPOINTS.AUTH`).
 * Attaches the bearer token from `authStore` to every request. On a 401 from
 * a protected endpoint it tries to refresh the access token once and retries
 * the original request; if that also fails (or there's no refresh token) it
 * logs the user out. `noLogoutEndpoints` are unauthenticated flows
 * (login/register/password-reset/email-verification/refresh) where a 401
 * should just fail normally instead of triggering a refresh or logout.
 */
const authClient = axios.create({
  baseURL: ENDPOINTS.AUTH,
  headers: {
    'Content-Type': 'application/json'
  }
});

const noLogoutEndpoints = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/resend-verification', '/refresh', '/logout'];

authClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isNoLogoutEndpoint = noLogoutEndpoints.some((endpoint) => originalRequest?.url?.includes(endpoint));

    if (error.response?.status !== 401 || isNoLogoutEndpoint) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const newToken = await refreshAccessToken();
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return authClient(originalRequest);
  }
);

export default authClient;
