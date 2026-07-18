import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS, TRACKING_BADGE } from '../../../shared/constants/theme.js';
import { LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog.jsx';
import { useToast } from '../../../shared/components/common/Toast.jsx';
import useOrders, { useOrderDetail } from '../hooks/useOrders.js';
import { OrderStepper } from '../components/OrderStepper.jsx';
import { notifyNow } from '../../../shared/notifications/index.js';

const POLL_INTERVAL = 15000;

const ESTIMATED_TIME = {
  PREPARING: '25–35 min',
  READY:     '15–20 min',
};

/* ─── Pulsing dot (animated, for in-progress statuses) ────────── */
const PulsingDot = ({ color }) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });

  return (
    <Animated.View
      style={[s.pulsingDot, { backgroundColor: color, opacity, transform: [{ scale }] }]}
    />
  );
};

PulsingDot.propTypes = {
  color: PropTypes.string.isRequired
};

/* ─── Map card (phone mockup + delivery person row) ──────────── */
const MapCard = ({ visible }) => {
  const { t } = useTranslation();
  if (!visible) return null;
  return (
    <View style={s.mapCard}>
      {/* navigation arrow button */}
      <TouchableOpacity style={s.navBtn}>
        <MaterialIcons name="navigation" size={18} color={COLORS.primary} />
      </TouchableOpacity>

      {/* phone frame */}
      <View style={s.phoneFrame}>
        <View style={s.phoneScreen}>
          {/* subtle grid lines */}
          <View style={s.gridH1} /><View style={s.gridH2} />
          <View style={s.gridV1} /><View style={s.gridV2} />
          <View style={s.pinWrap}>
            <MaterialIcons name="location-on" size={28} color={COLORS.primary} />
          </View>
        </View>
      </View>

      {/* delivery person strip */}
      <View style={s.deliveryStrip}>
        <View style={s.avatarCircle}>
          <MaterialIcons name="person" size={20} color={COLORS.onPrimary} />
        </View>
        <View style={s.deliveryInfo}>
          <Text style={s.deliveryName}>{t('tracking.driverName')}</Text>
          <Text style={s.deliverySub}>{t('tracking.driverSubtitle')}</Text>
        </View>
        <TouchableOpacity style={s.chatBtn}>
          <MaterialIcons name="chat" size={16} color={COLORS.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

MapCard.propTypes = {
  visible: PropTypes.bool.isRequired
};

/* ─── Main screen ────────────────────────────────────────────── */
const OrderTrackingScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const toast  = useToast();
  const { orderId } = route.params;
  const { order, loading, error, fetchOrder, setOrder } = useOrderDetail();
  const { cancelOrder } = useOrders();
  const notifiedRef = useRef(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [cancelling, setCancelling]         = useState(false);

  useEffect(() => {
    fetchOrder(orderId);
    const iv = setInterval(() => fetchOrder(orderId), POLL_INTERVAL);
    return () => clearInterval(iv);
  }, [orderId, fetchOrder]);

  useEffect(() => {
    const st = (order?.status ?? '').toUpperCase();
    if (st === 'CANCELLED' && !notifiedRef.current) {
      notifiedRef.current = true;
      notifyNow(
        t('tracking.notificationCancelledTitle'),
        t('tracking.notificationCancelledBody', { restaurant: order.restaurantName }),
        'order'
      );
    }
  }, [order?.status, order?.restaurantName, t]);

  if (loading && !order) return <LoadingSpinner />;
  if (error  || !order)  return <EmptyState icon="error-outline" message={t('orders.loadError')} />;

  const status        = (order?.status ?? '').toUpperCase();
  const badge         = TRACKING_BADGE[status] ?? TRACKING_BADGE.PENDING;
  const estimatedTime = ESTIMATED_TIME[status];
  const showMap       = status !== 'PENDING' && status !== 'CANCELLED';
  const isPulsing      = status === 'PENDING' || status === 'PREPARING' || status === 'READY';
  const canCancel     = status === 'PENDING';
  const total         = order.total ?? order.items.reduce((acc, it) => acc + it.subtotal, 0);
  const orderTime     = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const confirmCancel = async () => {
    setConfirmVisible(false);
    setCancelling(true);
    try {
      const updated = await cancelOrder(order.id);
      setOrder(updated);
      toast.show({ type: 'success', title: t('tracking.orderCancelledTitle') });
    } catch {
      toast.show({ type: 'error', title: t('common.error'), message: t('orders.cancelError') });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

      {/* ── Back button ── */}
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
        <MaterialIcons name="chevron-left" size={26} color={COLORS.textMuted} />
        <Text style={s.backText}>{t('common.back')}</Text>
      </TouchableOpacity>

      {/* ── Status badge ── */}
      <View style={s.badgeRow}>
        <View style={[s.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
          {isPulsing ? (
            <PulsingDot color={badge.text} />
          ) : (
            <View style={[s.staticDot, { backgroundColor: badge.text }]} />
          )}
          <Text style={[s.badgeText, { color: badge.text }]}>
            {t(`tracking.status.${status}`, order.status)}
          </Text>
        </View>
      </View>

      {/* ── Estimated time ── */}
      {estimatedTime ? (
        <View style={[s.timeBlock, { backgroundColor: badge.bg, borderColor: badge.border }]}>
          <Text style={[s.timeText, { color: badge.text }]}>{estimatedTime}</Text>
          <Text style={s.timeSub}>{t('tracking.estimatedTimeLabel')}</Text>
        </View>
      ) : status === 'PENDING' ? (
        <Text style={s.waitText}>
          {t('orders.pendingMessage')}
        </Text>
      ) : null}

      {/* ── Stepper ── */}
      <View style={s.stepperWrapper}>
        <OrderStepper status={status} />
      </View>

      {/* ── Map card ── */}
      <MapCard visible={showMap} />

      {/* ── Order details card ── */}
      <View style={s.orderCard}>
        {/* Header row 1 */}
        <View style={s.cardRow}>
          <Text style={s.orderNum}>
            {t('orders.orderNumber', { number: order.id.slice(-6).toUpperCase() })}
          </Text>
          <Text style={s.totalLabel}>{t('orders.total')}</Text>
        </View>
        {/* Header row 2 */}
        <View style={s.cardRow}>
          {!!orderTime && <Text style={s.orderTime}>{t('tracking.placedAt', { time: orderTime })}</Text>}
          <Text style={s.totalValue}>{t('common.currency')}{total.toFixed(2)}</Text>
        </View>

        <View style={s.divider} />

        {order.items.map((item, i) => (
          <View key={i} style={s.itemRow}>
            <Text style={s.itemName} numberOfLines={2}>
              {item.quantity}x {item.name}
            </Text>
            <Text style={s.itemPrice}>
              {t('common.currency')}{item.subtotal.toFixed(2)}
            </Text>
          </View>
        ))}

        {/* Help / cancel row */}
        <View style={s.helpRow}>
          <MaterialIcons name="help-outline" size={14} color={COLORS.textMuted} />
          <Text style={s.helpText}> {t('tracking.needHelp')}</Text>
          {canCancel && (
            <TouchableOpacity
              onPress={() => setConfirmVisible(true)}
              disabled={cancelling}
              style={s.cancelButton}
            >
              <Text style={s.cancelLink}>{t('orders.cancelOrder')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ConfirmDialog
        visible={confirmVisible}
        title={t('orders.cancelConfirmTitle')}
        message={t('orders.cancelConfirmMessage')}
        destructive
        onConfirm={confirmCancel}
        onCancel={() => setConfirmVisible(false)}
      />
    </ScrollView>
  );
};

/* ─── Styles ─────────────────────────────────────────────────── */
const s = StyleSheet.create({
  scroll: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    backgroundColor: COLORS.background,
    flexGrow: 1,
  },

  /* back */
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: SPACING.lg,
  },
  backText: { ...TYPOGRAPHY.bodyMd, color: COLORS.textMuted },

  /* badge */
  badgeRow:  { alignItems: 'center', marginBottom: SPACING.md },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  staticDot: { width: 8, height: 8, borderRadius: RADIUS.full, marginRight: 6 },
  pulsingDot: { width: 8, height: 8, borderRadius: RADIUS.full, marginRight: 6 },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  /* time */
  timeBlock: {
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  timeText: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
  },
  timeSub: { ...TYPOGRAPHY.bodyMd, color: COLORS.textMuted, marginTop: 4 },
  waitText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
  },

  /* stepper */
  stepperWrapper: { marginBottom: SPACING.xl },

  /* map card */
  mapCard: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  navBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.onPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  phoneFrame: {
    alignSelf: 'center',
    marginVertical: SPACING.md,
    width: 130,
    height: 180,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: COLORS.espresso,
    overflow: 'hidden',
    backgroundColor: COLORS.mapFrame,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: COLORS.mapScreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* subtle grid lines to suggest a map */
  gridH1: { position: 'absolute', left: 0, right: 0, top: '33%', height: 1, backgroundColor: 'rgba(0,0,0,0.07)' },
  gridH2: { position: 'absolute', left: 0, right: 0, top: '66%', height: 1, backgroundColor: 'rgba(0,0,0,0.07)' },
  gridV1: { position: 'absolute', top: 0, bottom: 0, left: '33%', width: 1, backgroundColor: 'rgba(0,0,0,0.07)' },
  gridV2: { position: 'absolute', top: 0, bottom: 0, left: '66%', width: 1, backgroundColor: 'rgba(0,0,0,0.07)' },
  pinWrap: { zIndex: 1 },

  deliveryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.onPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.espresso,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryInfo: { flex: 1, marginLeft: SPACING.sm },
  deliveryName: { ...TYPOGRAPHY.bodyMd, color: COLORS.text, fontWeight: '600' },
  deliverySub:  { ...TYPOGRAPHY.labelSm, color: COLORS.textMuted, textTransform: 'none' },
  chatBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* order card */
  orderCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  orderNum:   { ...TYPOGRAPHY.bodyMd, color: COLORS.text, fontWeight: '600' },
  totalLabel: { ...TYPOGRAPHY.labelSm, color: COLORS.textMuted, textTransform: 'none' },
  orderTime:  { ...TYPOGRAPHY.labelSm, color: COLORS.textMuted, textTransform: 'none' },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryContainer,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  itemName:  { ...TYPOGRAPHY.bodyMd, color: COLORS.text, flex: 1, marginRight: SPACING.sm },
  itemPrice: { ...TYPOGRAPHY.bodyMd, color: COLORS.textMuted },

  /* help row */
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  helpText:   { ...TYPOGRAPHY.labelSm, color: COLORS.textMuted, textTransform: 'none' },
  cancelButton: { marginLeft: SPACING.sm },
  cancelLink: { ...TYPOGRAPHY.labelSm, color: COLORS.primaryContainer, fontWeight: '600', textTransform: 'none' },
});

OrderTrackingScreen.propTypes = {
  navigation: PropTypes.shape({ goBack: PropTypes.func.isRequired }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({ orderId: PropTypes.string.isRequired }).isRequired
  }).isRequired
};

export default OrderTrackingScreen;
