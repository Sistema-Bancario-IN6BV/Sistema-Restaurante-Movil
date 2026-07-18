// src/shared/api/tokenRefresh.js
import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints.js';
import useAuthStore from '../store/authStore.js';

let refreshPromise = null;

/**
 * Exchanges the stored refresh token for a new access token (with rotation:
 * the AuthService issues a new refresh token too). Concurrent callers share
 * the same in-flight request instead of triggering parallel refreshes.
 *
 * Uses a plain axios call (not `authClient`) to avoid recursing through the
 * same 401 interceptor that calls this function.
 *
 * @returns {Promise<string>} The new access token.
 * @throws {Error} If there is no refresh token, or the AuthService rejects it
 *   (expired/revoked) — the caller's session is logged out in that case.
 */
export const refreshAccessToken = () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const currentRefreshToken = useAuthStore.getState().refreshToken;
  if (!currentRefreshToken) {
    useAuthStore.getState().logout();
    return Promise.reject(new Error('No refresh token available'));
  }

  refreshPromise = axios
    .post(`${ENDPOINTS.AUTH}/refresh`, { refreshToken: currentRefreshToken })
    .then((response) => {
      const { token, refreshToken } = response.data;
      useAuthStore.getState().setTokens(token, refreshToken);
      return token;
    })
    .catch((err) => {
      useAuthStore.getState().logout();
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};
