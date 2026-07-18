import { useState, useCallback } from 'react';
import restaurantClient from '../../../shared/api/restaurantClient.js';

const mapReservation = (r) => ({
  id: r._id,
  restaurantId: r.restaurantId?._id || r.restaurantId,
  restaurantName: r.restaurantId?.name,
  restaurantImage: r.restaurantId?.photo,
  restaurantCategory: r.restaurantId?.category,
  tableId: r.tableId?._id || r.tableId,
  tableNumber: r.tableId?.number,
  tableCapacity: r.tableId?.capacity,
  date: r.date,
  time: r.time,
  guests: r.guests,
  status: r.status,
  notes: r.notes,
  cancelReason: r.cancelReason,
  createdAt: r.createdAt
});

const toDateOnly = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Fetches and manages the current user's reservations via `restaurantClient`.
 * @returns {{
 *   reservations: Array<object>,
 *   loading: boolean,
 *   error: string|null,
 *   fetchReservations: () => Promise<void>,
 *   checkAvailability: (params: {tableId: string, date: Date|string, time: string, reservationId?: string}) => Promise<boolean>,
 *   createReservation: (params: {restaurantId: string, tableId: string, date: Date|string, time: string, guests: number, notes?: string}) => Promise<object>,
 *   updateReservation: (id: string, params: {tableId: string, date: Date|string, time: string, guests: number, notes?: string}) => Promise<object>,
 *   cancelReservation: (id: string) => Promise<object>
 * }}
 */
const useReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get('/reservations/my');
      const data = response.data?.data || [];
      setReservations(data.map(mapReservation));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAvailability = useCallback(async ({ tableId, date, time, reservationId }) => {
    const response = await restaurantClient.post('/reservations/check-availability', {
      tableId,
      date: toDateOnly(date),
      time,
      reservationId
    });
    return response.data?.available ?? false;
  }, []);

  const createReservation = useCallback(async ({ restaurantId, tableId, date, time, guests, notes }) => {
    const [hours, minutes] = time.split(':');
    const reservationDate = new Date(date);
    reservationDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const response = await restaurantClient.post('/reservations/create', {
      restaurant: restaurantId,
      table: tableId,
      reservationDate: reservationDate.toISOString(),
      guests,
      notes
    });
    return mapReservation(response.data?.data);
  }, []);

  const updateReservation = useCallback(async (id, { tableId, date, time, guests, notes }) => {
    const response = await restaurantClient.put(`/reservations/${id}`, {
      tableId,
      date: toDateOnly(date),
      time,
      guests,
      notes
    });
    return mapReservation(response.data?.data);
  }, []);

  const cancelReservation = useCallback(async (id) => {
    const response = await restaurantClient.patch(`/reservations/${id}/cancel`);
    return mapReservation(response.data?.data);
  }, []);

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    checkAvailability,
    createReservation,
    updateReservation,
    cancelReservation
  };
};

/**
 * Fetches a single reservation by id via `restaurantClient`.
 * @returns {{ reservation: object|null, loading: boolean, error: string|null, fetchReservation: (id: string) => Promise<void>, setReservation: Function }}
 */
export const useReservationDetail = () => {
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReservation = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get(`/reservations/${id}`);
      setReservation(mapReservation(response.data?.data));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { reservation, loading, error, fetchReservation, setReservation };
};

export default useReservations;
