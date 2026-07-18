import { useState, useCallback } from 'react';
import restaurantClient from '../../../shared/api/restaurantClient.js';

const mapReview = (review) => ({
  id: review._id,
  rating: review.rating,
  comment: review.comment,
  subRatings: review.subRatings,
  adminReply: review.adminReply,
  createdAt: review.createdAt
});

/**
 * Fetches a restaurant's reviews via `restaurantClient`.
 * @returns {{ reviews: Array<object>, loading: boolean, error: string|null, fetchReviews: (restaurantId: string) => Promise<void> }}
 */
const useReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get(`/reviews/restaurant/${restaurantId}`);
      const data = response.data?.data || [];
      setReviews(data.map(mapReview));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { reviews, loading, error, fetchReviews };
};

export default useReviews;
