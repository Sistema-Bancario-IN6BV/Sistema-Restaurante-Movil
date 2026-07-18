// src/shared/store/cartStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,

      addItem: (restaurantId, item) => {
        const state = get();

        if (state.restaurantId && state.restaurantId !== restaurantId && state.items.length > 0) {
          return { conflict: true };
        }

        set((state) => {
          const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
          let items;
          if (existing) {
            items = state.items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            );
          } else {
            items = [...state.items, { ...item, quantity: item.quantity || 1 }];
          }
          return { items, restaurantId };
        });

        return { conflict: false };
      },

      replaceCart: (restaurantId, item) => {
        set({ items: [{ ...item, quantity: item.quantity || 1 }], restaurantId });
      },

      removeItem: (menuItemId) => {
        set((state) => {
          const items = state.items.filter((i) => i.menuItemId !== menuItemId);
          return { items, restaurantId: items.length > 0 ? state.restaurantId : null };
        });
      },

      updateQuantity: (menuItemId, quantity) => {
        set((state) => ({
          items: state.items
            .map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0)
        }));
      },

      updateNotes: (menuItemId, notes) => {
        set((state) => ({
          items: state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, notes } : i))
        }));
      },

      clearCart: () => {
        set({ items: [], restaurantId: null });
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'kinaleat:cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items, restaurantId: state.restaurantId })
    }
  )
);

export default useCartStore;
