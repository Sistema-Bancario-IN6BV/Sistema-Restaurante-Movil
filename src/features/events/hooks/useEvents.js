import { useState, useCallback } from 'react';
import restaurantClient from '../../../shared/api/restaurantClient.js';

const mapEvent = (e) => ({
  id: e._id,
  restaurantId: e.restaurantId?._id || e.restaurantId,
  restaurantName: e.restaurantId?.name,
  title: e.title,
  description: e.description,
  date: e.date,
  startTime: e.startTime,
  endTime: e.endTime,
  capacity: e.capacity,
  registeredCount: e.registeredCount ?? 0,
  availableSpots:
    e.availableSpots != null
      ? e.availableSpots
      : e.capacity != null
        ? e.capacity - (e.registeredCount ?? 0)
        : null,
  isFull: e.isFull ?? (e.capacity != null && (e.registeredCount ?? 0) >= e.capacity),
  price: e.price ?? 0,
  status: e.status,
  services: e.services || [],
  coverImage: e.coverImage,
  tags: e.tags || []
});

/**
 * Fetches the list of events via `restaurantClient`.
 * @returns {{ events: Array<object>, loading: boolean, error: string|null, fetchEvents: (params?: object) => Promise<void> }}
 */
const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get('/events', { params });
      const payload = response.data?.data ?? response.data ?? [];
      const list = Array.isArray(payload) ? payload : [];
      setEvents(list.map(mapEvent));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, loading, error, fetchEvents };
};

/**
 * Fetches a single event and exposes register/unregister actions via `restaurantClient`.
 * @returns {{
 *   event: object|null,
 *   loading: boolean,
 *   error: string|null,
 *   fetchEvent: (id: string) => Promise<void>,
 *   setEvent: Function,
 *   registerToEvent: (id: string) => Promise<object>,
 *   unregisterFromEvent: (id: string) => Promise<object>
 * }}
 */
export const useEventDetail = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvent = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get(`/events/${id}`);
      setEvent(mapEvent(response.data?.data ?? response.data));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const registerToEvent = useCallback(async (id) => {
    const response = await restaurantClient.post(`/events/${id}/register`);
    return response.data?.data ?? response.data;
  }, []);

  const unregisterFromEvent = useCallback(async (id) => {
    const response = await restaurantClient.delete(`/events/${id}/register`);
    return response.data?.data ?? response.data;
  }, []);

  return { event, loading, error, fetchEvent, setEvent, registerToEvent, unregisterFromEvent };
};

export default useEvents;
