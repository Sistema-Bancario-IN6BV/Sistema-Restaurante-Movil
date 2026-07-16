// src/shared/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      login: (token, refreshToken, user) => {
        set({
          token,
          refreshToken,
          user,
          isAuthenticated: true
        });
      },

      logout: () => {
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false
        });
      },

      setAccessToken: (token) => {
        set({ token });
      },

      setTokens: (token, refreshToken) => {
        set({ token, refreshToken });
      },

      updateUser: (user) => {
        set((state) => ({ user: { ...state.user, ...user } }));
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            return SecureStore.getItem(name);
          } catch (error) {
            console.error('Error getting item from SecureStore:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            SecureStore.setItem(name, value);
          } catch (error) {
            console.error('Error setting item in SecureStore:', error);
          }
        },
        removeItem: (name) => {
          try {
            SecureStore.deleteItemAsync(name);
          } catch (error) {
            console.error('Error removing item from SecureStore:', error);
          }
        }
      })),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      }
    }
  )
);

export default useAuthStore;
