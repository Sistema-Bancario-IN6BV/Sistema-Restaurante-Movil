// src/shared/api/invoices.js
import { ENDPOINTS } from '../constants/endpoints.js';

/**
 * Builds the PDF download URL for an order's invoice.
 * @param {string} orderId
 * @returns {string} Absolute URL to the invoice PDF.
 */
export const getInvoicePdfUrl = (orderId) => `${ENDPOINTS.RESTAURANT}/invoices/order/${orderId}/pdf`;
