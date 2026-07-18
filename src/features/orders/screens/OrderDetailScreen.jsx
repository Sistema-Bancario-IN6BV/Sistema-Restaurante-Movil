import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../shared/constants/theme.js';
import { Card, Badge, LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import Button from '../../../shared/components/common/Button.jsx';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog.jsx';
import { useToast } from '../../../shared/components/common/Toast.jsx';
import useOrders, { useOrderDetail } from '../hooks/useOrders.js';
import useInvoiceDownload from '../hooks/useInvoiceDownload.js';
import { OrderStepper } from '../components/OrderStepper.jsx';
import { ORDERS_STACK_SCREENS } from '../../../navigation/screenNames.js';

const ACTIVE_STATUSES = ['PREPARING', 'READY'];

const formatDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

const OrderDetailScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { orderId } = route.params;
  const { order, loading, error, fetchOrder, setOrder } = useOrderDetail();
  const { cancelOrder } = useOrders();
  const { downloading: downloadingInvoice, downloadInvoice } = useInvoiceDownload();
  const [cancelling, setCancelling] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    fetchOrder(orderId);
  }, [orderId, fetchOrder]);

  if (loading || !order) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <EmptyState icon="error-outline" message={t('orders.loadError')} />;
  }

  const handleCancel = () => {
    setConfirmVisible(true);
  };

  const confirmCancel = async () => {
    setConfirmVisible(false);
    setCancelling(true);
    try {
      const updated = await cancelOrder(order.id);
      setOrder(updated);
    } catch {
      toast.show({ type: 'error', title: t('common.error'), message: t('orders.cancelError') });
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      await downloadInvoice(order.id, t('orders.downloadInvoice'));
    } catch (err) {
      console.warn('Invoice download failed:', err?.message);
      toast.show({ type: 'error', title: t('common.error'), message: t('orders.invoiceError') });
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('orders.detailTitle')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        {order.restaurantImage ? (
          <Image source={{ uri: order.restaurantImage }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <MaterialIcons name="restaurant" size={36} color={COLORS.textMuted} />
          </View>
        )}
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle} numberOfLines={1}>{order.restaurantName}</Text>
          <Badge status={order.status} label={t(`orders.status.${order.status}`, order.status)} />
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialIcons name="receipt-long" size={15} color={COLORS.textMuted} />
          <Text style={styles.metaText}>{t('orders.orderNumber', { number: order.id.slice(-6).toUpperCase() })}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="schedule" size={15} color={COLORS.textMuted} />
          <Text style={styles.metaText}>{formatDateTime(order.createdAt)}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="local-shipping" size={15} color={COLORS.textMuted} />
          <Text style={styles.metaText}>{t(`orders.type.${order.type}`)}</Text>
        </View>
      </View>

      {order.status === 'PENDING' && (
        <View style={styles.pendingNotice}>
          <MaterialIcons name="schedule" size={18} color={COLORS.secondary} />
          <Text style={styles.pendingNoticeText}>{t('orders.pendingMessage')}</Text>
        </View>
      )}

      {order.deliveryAddress?.street && (
        <Card>
          <Text style={styles.sectionTitle}>{t('orders.deliveryAddress')}</Text>
          <Text style={styles.bodyText}>{order.deliveryAddress.street}</Text>
          {!!order.deliveryAddress.city && <Text style={styles.bodyText}>{order.deliveryAddress.city}</Text>}
          {!!order.deliveryAddress.notes && <Text style={styles.mutedText}>{order.deliveryAddress.notes}</Text>}
        </Card>
      )}

      {order.tableNumber != null && (
        <Card>
          <Text style={styles.sectionTitle}>{t('orders.table', { number: order.tableNumber })}</Text>
        </Card>
      )}

      <Card>
        <Text style={styles.sectionTitle}>{t('orders.items')}</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.itemThumb} />
            ) : (
              <View style={[styles.itemThumb, styles.itemThumbPlaceholder]}>
                <MaterialIcons name="restaurant" size={20} color={COLORS.textMuted} />
              </View>
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.mutedText}>{item.quantity} x {t('common.currency')}{item.unitPrice.toFixed(2)}</Text>
              {!!item.notes && <Text style={styles.mutedText}>{item.notes}</Text>}
            </View>
            <Text style={styles.itemPrice}>{t('common.currency')}{item.subtotal.toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.totalsRow}>
          <Text style={styles.mutedText}>{t('orders.subtotal')}</Text>
          <Text style={styles.bodyText}>{t('common.currency')}{order.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.mutedText}>{t('orders.tax')}</Text>
          <Text style={styles.bodyText}>{t('common.currency')}{order.taxAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalLabel}>{t('orders.total')}</Text>
          <Text style={styles.totalValue}>{t('common.currency')}{order.total.toFixed(2)}</Text>
        </View>
      </Card>

      {order.status !== 'CANCELLED' && (
        <Card>
          <Text style={styles.sectionTitle}>{t('orders.history')}</Text>
          <OrderStepper status={order.status} />
        </Card>
      )}

      {ACTIVE_STATUSES.includes(order.status) && (
        <Button
          title={t('orders.trackOrder')}
          onPress={() => navigation.navigate(ORDERS_STACK_SCREENS.TRACKING, { orderId: order.id })}
          style={styles.actionButton}
        />
      )}

      {order.status === 'PENDING' && (
        <Button
          title={t('orders.cancelOrder')}
          variant="secondary"
          onPress={handleCancel}
          loading={cancelling}
          style={styles.actionButton}
        />
      )}

      {order.status === 'DELIVERED' && (
        <Button
          title={t('orders.rateOrder')}
          onPress={() => navigation.navigate(ORDERS_STACK_SCREENS.RATE, { orderId: order.id, restaurantId: order.restaurantId })}
          style={styles.actionButton}
        />
      )}

      {order.status === 'DELIVERED' && (
        <Button
          title={t('orders.downloadInvoice')}
          variant="secondary"
          onPress={handleDownloadInvoice}
          loading={downloadingInvoice}
          style={styles.actionButton}
        />
      )}

      <ConfirmDialog
        visible={confirmVisible}
        title={t('orders.cancelConfirmTitle')}
        message={t('orders.cancelConfirmMessage')}
        destructive
        onConfirm={confirmCancel}
        onCancel={() => setConfirmVisible(false)}
      />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background
  },
  headerBack: {
    padding: SPACING.xs
  },
  headerSpacer: {
    width: 24
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text
  },
  pendingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg
  },
  pendingNoticeText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginLeft: SPACING.sm,
    flex: 1
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    backgroundColor: COLORS.background,
    flexGrow: 1
  },
  heroCard: {
    height: 140,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  heroPlaceholder: {
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    backgroundColor: COLORS.overlayDark
  },
  heroContent: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    bottom: SPACING.md,
    gap: SPACING.xs
  },
  heroTitle: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.surfaceContainerLowest
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    textTransform: 'none'
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.sm
  },
  bodyText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text
  },
  mutedText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    marginRight: SPACING.sm
  },
  itemThumbPlaceholder: {
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemInfo: {
    flex: 1,
    marginRight: SPACING.sm
  },
  itemName: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text
  },
  itemPrice: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text
  },
  divider: {
    borderTopWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.sm
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs
  },
  totalLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.text
  },
  totalValue: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    textTransform: 'none'
  },
  actionButton: {
    marginTop: SPACING.md
  }
});

OrderDetailScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({ orderId: PropTypes.string.isRequired }).isRequired
  }).isRequired
};

export default OrderDetailScreen;
