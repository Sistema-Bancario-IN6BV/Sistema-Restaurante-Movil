// src/features/home/store/favoritesStore.js
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'kinaleat:favorites';

const persistIds = (ids) => {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids)).catch(() => {});
};

const useFavoritesStore = create((set, get) => ({
  ids: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      set({ ids: raw ? JSON.parse(raw) : [], hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  toggleFavorite: (id) => {
    set((state) => {
      const ids = state.ids.includes(id)
        ? state.ids.filter((x) => x !== id)
        : [...state.ids, id];
      persistIds(ids);
      return { ids };
    });
  }
}));

export default useFavoritesStore;
