import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import authClient from '../../../shared/api/authClient.js';
import useAuthStore from '../../../shared/store/authStore.js';

/**
 * Login/register/password-recovery actions against the AuthService, backed
 * by `authClient` and `authStore`.
 * @returns {{
 *   handleLogin: (credentials: {emailOrUsername: string, password: string}) => Promise<{success: boolean, error?: string}>,
 *   handleRegister: (userData: object) => Promise<{success: boolean, data?: object, error?: string}>,
 *   handleForgotPassword: (params: {email: string}) => Promise<{success: boolean, data?: object, error?: string}>,
 *   handleResendVerification: (params: {email: string}) => Promise<{success: boolean, data?: object, error?: string}>,
 *   handleLogout: () => Promise<void>,
 *   loading: boolean,
 *   error: string|null,
 *   logout: () => void
 * }}
 */
export const useAuth = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login, logout } = useAuthStore();

  const handleLogin = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authClient.post('/login', credentials);
      const { token, refreshToken, userDetails } = response.data;

      login(token, refreshToken, userDetails);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('auth.loginErrorDefault');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [login, t]);

  /**
   * Revokes the current refresh token server-side (best effort — errors are
   * swallowed since the local session is cleared regardless) and then logs
   * out locally.
   * @returns {Promise<void>}
   */
  const handleLogout = useCallback(async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      try {
        await authClient.post('/logout', { refreshToken });
      } catch {
        // best effort — proceed with local logout regardless
      }
    }
    logout();
  }, [logout]);

  const handleRegister = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('surname', userData.surname);
      formData.append('username', userData.username);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('phone', userData.phone);

      const response = await authClient.post('/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('auth.registerErrorDefault');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleForgotPassword = useCallback(async ({ email }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authClient.post('/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('auth.forgotPasswordErrorDefault');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleResendVerification = useCallback(async ({ email }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authClient.post('/resend-verification', { email });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('auth.forgotPasswordErrorDefault');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [t]);

  return {
    handleLogin,
    handleRegister,
    handleForgotPassword,
    handleResendVerification,
    handleLogout,
    loading,
    error,
    logout
  };
};
