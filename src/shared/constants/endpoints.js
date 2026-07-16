// src/shared/constants/endpoints.js
export const ENDPOINTS = {
  AUTH: process.env.EXPO_PUBLIC_AUTH_URL || 'http://localhost:5105/api/v1/auth',
  RESTAURANT: process.env.EXPO_PUBLIC_RESTAURANT_URL || 'http://localhost:3000/Restaurante/v1'
};
