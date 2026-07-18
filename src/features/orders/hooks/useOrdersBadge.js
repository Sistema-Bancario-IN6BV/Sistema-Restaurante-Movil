import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import restaurantClient from '../../../shared/api/restaurantClient.js';

const ACTIVE_STATUSES = ['PENDING', 'PREPARING', 'READY'];

/**
 * Counts the current user's active orders (PENDING/PREPARING/READY) for the
 * Orders tab badge, refreshing whenever the screen regains focus.
 * @returns {number} Count of active orders.
 */
const useOrdersBadge = () => {
  const [count, setCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchCount = async () => {
        try {
          const response = await restaurantClient.get('/orders/my');
          const orders = response.data?.data || response.data || [];
          const active = orders.filter((order) => ACTIVE_STATUSES.includes(order.status)).length;
          if (!cancelled) setCount(active);
        } catch {
          if (!cancelled) setCount(0);
        }
      };

      fetchCount();

      return () => {
        cancelled = true;
      };
    }, [])
  );

  return count;
};

export default useOrdersBadge;
