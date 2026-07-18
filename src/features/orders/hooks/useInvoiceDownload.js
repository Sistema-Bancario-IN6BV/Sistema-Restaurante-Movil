import { useState } from 'react';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import useAuthStore from '../../../shared/store/authStore.js';
import { getInvoicePdfUrl } from '../../../shared/api/invoices.js';

/**
 * Downloads and shares an order's invoice PDF.
 * @returns {{ downloading: boolean, downloadInvoice: (orderId: string, dialogTitle?: string) => Promise<void> }}
 */
const useInvoiceDownload = () => {
  const [downloading, setDownloading] = useState(false);

  /**
   * Downloads the invoice PDF for `orderId` to cache and opens the native share sheet.
   * @param {string} orderId
   * @param {string} [dialogTitle] - Title shown in the native share sheet.
   * @returns {Promise<void>}
   */
  const downloadInvoice = async (orderId, dialogTitle) => {
    setDownloading(true);
    try {
      const token = useAuthStore.getState().token;
      const destination = new File(Paths.cache, `factura-${orderId}.pdf`);
      if (destination.exists) {
        destination.delete();
      }
      const file = await File.downloadFileAsync(getInvoicePdfUrl(orderId), destination, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle });
      }
    } finally {
      setDownloading(false);
    }
  };

  return { downloading, downloadInvoice };
};

export default useInvoiceDownload;
