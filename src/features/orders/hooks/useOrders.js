import { useState, useCallback } from 'react';
import restaurantClient from '../../../shared/api/restaurantClient.js';

const VALID_STATUSES = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];

const mapOrder = (order) => ({
  id: order._id,
  restaurantId: order.restaurantId?._id || order.restaurantId,
  restaurantName: order.restaurantId?.name,
  restaurantImage: order.restaurantId?.photo || null,
  tableId: order.tableId?._id || order.tableId,
  tableNumber: order.tableId?.number,
  type: order.type,
  status: VALID_STATUSES.includes(order.status) ? order.status : 'PENDING',
  items: (order.items || []).map((item) => ({
    ...item,
    menuItemId: item.menuItemId?._id || item.menuItemId,
    image: item.menuItemId?.image || null
  })),
  deliveryAddress: order.deliveryAddress,
  subtotal: order.subtotal,
  taxAmount: order.taxAmount,
  total: order.total,
  statusHistory: order.statusHistory || [],
  createdAt: order.createdAt
});

/**
 * Fetches, creates and cancels the current user's orders via `restaurantClient`.
 * @returns {{
 *   orders: Array<object>,
 *   loading: boolean,
 *   error: string|null,
 *   fetchOrders: () => Promise<void>,
 *   createOrder: (payload: {restaurantId: string, items: Array, type: string, deliveryAddress?: object, tableId?: string}) => Promise<object>,
 *   cancelOrder: (orderId: string) => Promise<object>
 * }}
 */
const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get('/orders/my');
      const data = response.data?.data || [];
      setOrders(data.map(mapOrder));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async ({ restaurantId, items, type, deliveryAddress, tableId }) => {
    const payload = {
      restaurantId,
      items: items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        notes: item.notes
      })),
      type
    };
    if (deliveryAddress) payload.deliveryAddress = deliveryAddress;
    if (tableId) payload.tableId = tableId;

    const response = await restaurantClient.post('/orders/create', payload);
    return mapOrder(response.data?.data);
  }, []);

  const cancelOrder = useCallback(async (orderId) => {
    const response = await restaurantClient.patch(`/orders/${orderId}/cancel`);
    return mapOrder(response.data?.data);
  }, []);

  return { orders, loading, error, fetchOrders, createOrder, cancelOrder };
};

/**
 * Fetches a single order by id via `restaurantClient`.
 * @returns {{
 *   order: object|null,
 *   loading: boolean,
 *   error: string|null,
 *   fetchOrder: (orderId: string) => Promise<void>,
 *   setOrder: (updater: object|((prev: object|null) => object|null)) => void
 * }}
 */
export const useOrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await restaurantClient.get(`/orders/${orderId}`);
      setOrder(mapOrder(response.data?.data));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { order, loading, error, fetchOrder, setOrder };
};

export default useOrders;
