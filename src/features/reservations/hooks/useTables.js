import { useState, useCallback } from 'react';
import restaurantClient from '../../../shared/api/restaurantClient.js';

const mapTable = (t) => ({
  id: t._id,
  number: t.number,
  capacity: t.capacity,
  location: t.location,
  status: t.status
});

/**
 * Fetches a restaurant's tables via `restaurantClient`.
 * @returns {{ tables: Array<object>, loading: boolean, error: string|null, fetchTables: (restaurantId: string) => Promise<void> }}
 */
const useTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTables = useCallback(async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get(`/tables/restaurant/${restaurantId}`);
      setTables((response.data?.tables || []).map(mapTable));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { tables, loading, error, fetchTables };
};

export default useTables;
