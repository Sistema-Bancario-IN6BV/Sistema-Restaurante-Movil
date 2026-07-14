import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'kinaleat:recently-visited';
const MAX_ITEMS = 5;

/**
 * Records `restaurant` as the most recently visited, deduplicating and
 * capping the list at `MAX_ITEMS` in AsyncStorage.
 * @param {{id: string}} restaurant
 * @returns {Promise<void>}
 */
export const addRecentlyVisited = async (restaurant) => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((item) => item.id !== restaurant.id);
    const updated = [restaurant, ...filtered].slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
};

/**
 * Reads the recently-visited restaurants list from AsyncStorage, refreshing
 * whenever the screen regains focus.
 * @returns {Array<object>} Recently visited restaurants, most recent first.
 */
const useRecentlyVisited = () => {
  const [items, setItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const load = async () => {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          if (!cancelled) setItems(raw ? JSON.parse(raw) : []);
        } catch {
          if (!cancelled) setItems([]);
        }
      };

      load();

      return () => {
        cancelled = true;
      };
    }, [])
  );

  return items;
};

export default useRecentlyVisited;
