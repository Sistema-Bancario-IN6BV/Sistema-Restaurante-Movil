// src/shared/store/notificationsStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_ITEMS = 50;

const useNotificationsStore = create(
  persist(
    (set, get) => ({
      items: [],

      addNotification: (title, body, type = 'system') => {
        const notification = {
          id: `${Date.now()}-${Math.random()}`,
          title,
          body,
          type,
          date: new Date().toISOString(),
          read: false
        };
        set({ items: [notification, ...get().items].slice(0, MAX_ITEMS) });
      },

      markAllRead: () => {
        set({ items: get().items.map((item) => ({ ...item, read: true })) });
      }
    }),
    {
      name: 'notifications-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

export default useNotificationsStore;
