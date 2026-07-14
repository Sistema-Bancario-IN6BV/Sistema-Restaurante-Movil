import { useState, useCallback } from 'react';
import restaurantClient from '../../../shared/api/restaurantClient.js';

const mapMenuItem = (item) => ({
  id: item._id,
  restaurantId: item.restaurantId?._id || item.restaurantId,
  restaurantName: item.restaurantId?.name,
  name: item.name,
  description: item.description,
  price: item.price,
  type: item.type,
  ingredients: item.ingredients || [],
  allergens: item.allergens || [],
  image: item.image,
  available: item.available
});

/**
 * Fetches a restaurant's menu, grouped by item type, via `restaurantClient`.
 * @returns {{ menu: Record<string, Array<object>>, loading: boolean, error: string|null, fetchMenu: (restaurantId: string) => Promise<void> }}
 */
export const useRestaurantMenu = () => {
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMenu = useCallback(async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get(`/menu/restaurants/${restaurantId}/menu`);
      const data = response.data?.data || {};
      const mapped = Object.fromEntries(
        Object.entries(data).map(([type, items]) => [type, items.map(mapMenuItem)])
      );
      setMenu(mapped);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { menu, loading, error, fetchMenu };
};

/**
 * Fetches a single menu item by id via `restaurantClient`.
 * @returns {{ item: object|null, loading: boolean, error: string|null, fetchItem: (itemId: string) => Promise<void> }}
 */
export const useMenuItemDetail = () => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItem = useCallback(async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get(`/menu/${itemId}`);
      const data = response.data?.data;
      setItem(mapMenuItem(data));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { item, loading, error, fetchItem };
};
