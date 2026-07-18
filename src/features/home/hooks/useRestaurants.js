import { useState, useCallback } from 'react';
import restaurantClient from '../../../shared/api/restaurantClient.js';

const mapRestaurant = (r) => ({
  id: r._id,
  name: r.name,
  image: r.photo,
  category: r.category,
  rating: r.rating?.average || 0,
  reviewCount: r.rating?.count || 0,
  avgPrice: r.avgPrice,
  address: r.address,
  schedule: r.schedule,
  tags: r.tags || []
});

/**
 * Fetches the list of restaurants via `restaurantClient`.
 * @returns {{ restaurants: Array<object>, loading: boolean, error: string|null, fetchRestaurants: () => Promise<void> }}
 */
const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get('/restaurants/get');
      const data = response.data?.data || response.data || [];
      setRestaurants(data.map(mapRestaurant));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { restaurants, loading, error, fetchRestaurants };
};

/**
 * Fetches a single restaurant by id via `restaurantClient`.
 * @returns {{ restaurant: object|null, loading: boolean, error: string|null, fetchRestaurant: (id: string) => Promise<void> }}
 */
export const useRestaurantDetail = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRestaurant = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get(`/restaurants/${id}`);
      const data = response.data?.data || response.data;
      setRestaurant(mapRestaurant(data));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { restaurant, loading, error, fetchRestaurant };
};

export default useRestaurants;
