import { useState } from 'react';
import useCartStore from '../../../shared/store/cartStore.js';
import useOrders from '../../orders/hooks/useOrders.js';

const TAX_RATE = 0.12;

/**
 * Cart totals, order-type selection and order-placement logic for CartScreen.
 * @returns {{
 *   items: Array,
 *   orderType: string,
 *   setOrderType: (type: string) => void,
 *   placing: boolean,
 *   subtotal: number,
 *   tax: number,
 *   total: number,
 *   updateQuantity: (menuItemId: string, quantity: number) => void,
 *   removeItem: (menuItemId: string) => void,
 *   placeOrder: (form: { street?: string, city?: string, notes?: string }) => Promise<object>
 * }}
 */
const useCart = () => {
  const { items, restaurantId, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const { createOrder } = useOrders();
  const [orderType, setOrderType] = useState('DELIVERY');
  const [placing, setPlacing] = useState(false);

  const subtotal = getTotal();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  /**
   * Validates the delivery address (when applicable), creates the order and
   * clears the cart on success.
   * @param {{street?: string, city?: string, notes?: string}} form
   * @returns {Promise<object>} the created order.
   * @throws {Error} with `code: 'STREET_REQUIRED'` when a delivery street is missing.
   */
  const placeOrder = async (form) => {
    if (orderType === 'DELIVERY' && !form.street?.trim()) {
      const error = new Error('Street is required for delivery orders');
      error.code = 'STREET_REQUIRED';
      throw error;
    }

    setPlacing(true);
    try {
      const payload = {
        restaurantId,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes
        })),
        type: orderType
      };
      if (orderType === 'DELIVERY') {
        payload.deliveryAddress = {
          street: form.street.trim(),
          city: form.city?.trim(),
          notes: form.notes?.trim()
        };
      }

      const order = await createOrder(payload);
      clearCart();
      return order;
    } finally {
      setPlacing(false);
    }
  };

  return {
    items,
    orderType,
    setOrderType,
    placing,
    subtotal,
    tax,
    total,
    updateQuantity,
    removeItem,
    placeOrder
  };
};

export default useCart;
