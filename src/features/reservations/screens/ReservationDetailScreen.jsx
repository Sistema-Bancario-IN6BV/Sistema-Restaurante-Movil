import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../../shared/constants/theme.js';
import { formatCategory } from '../../../shared/constants/categories.js';
import { Card, Badge, LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import Button from '../../../shared/components/common/Button.jsx';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog.jsx';
import { useToast } from '../../../shared/components/common/Toast.jsx';
import useReservations, { useReservationDetail } from '../hooks/useReservations.js';
import { scheduleReminder } from '../../../shared/notifications/index.js';
import { ROOT_SCREENS, TABS, HOME_STACK_SCREENS, RESERVATIONS_STACK_SCREENS } from '../../../navigation/screenNames.js';

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED'];
const REMINDERS_KEY = 'kinaleat:reservation-reminders';

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const scheduleConfirmedReminder = async (reservation, t) => {
  try {
    const raw = await AsyncStorage.getItem(REMINDERS_KEY);
    const scheduled = raw ? JSON.parse(raw) : [];
    if (scheduled.includes(reservation.id)) return;

    const [hours, minutes] = reservation.time.split(':');
    const reservationDate = new Date(reservation.date);
    reservationDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    const reminderDate = new Date(reservationDate.getTime() - 60 * 60 * 1000);

    const id = await scheduleReminder(
      t('reservations.reminderTitle'),
      t('reservations.reminderBody', { restaurant: reservation.restaurantName }),
      reminderDate,
      'reservation'
    );

    if (id) {
      scheduled.push(reservation.id);
      await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(scheduled));
    }
  } catch {
    // best-effort, ignore errors scheduling local reminders
  }
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconCircle}>
      <MaterialIcons name={icon} size={18} color={COLORS.primary} />
    </View>
    <View style={styles.infoTextWrap}>
      {!!label && <Text style={styles.infoLabel}>{label}</Text>}
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const ReservationDetailScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { reservationId, justCreated } = route.params;
  const { reservation, loading, error, fetchReservation, setReservation } = useReservationDetail();
  const { cancelReservation } = useReservations();
  const [cancelling, setCancelling] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const bannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchReservation(reservationId);
  }, [reservationId, fetchReservation]);

  useEffect(() => {
    if (justCreated) {
      Animated.timing(bannerAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    }
  }, [justCreated, bannerAnim]);

  useEffect(() => {
    if (reservation?.status === 'CONFIRMED') {
      scheduleConfirmedReminder(reservation, t);
    }
  }, [reservation?.id, reservation?.status]);

  if (loading || !reservation) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <EmptyState icon="error-outline" message={t('reservations.loadError')} />;
  }

  const handleCancel = () => {
    setConfirmVisible(true);
  };

  const confirmCancel = async () => {
    setConfirmVisible(false);
    setCancelling(true);
    try {
      const updated = await cancelReservation(reservation.id);
      setReservation(updated);
    } catch {
      toast.show({ type: 'error', title: t('common.error'), message: t('reservations.cancelError') });
    } finally {
      setCancelling(false);
    }
  };

  const goToRestaurant = () => {
    navigation.navigate(ROOT_SCREENS.MAIN_TABS, {
      screen: TABS.HOME,
      params: {
        screen: HOME_STACK_SCREENS.RESTAURANT_DETAIL,
        params: { restaurantId: reservation.restaurantId, restaurantName: reservation.restaurantName }
      }
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroWrapper}>
          {reservation.restaurantImage ? (
            <Image source={{ uri: reservation.restaurantImage }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <MaterialIcons name="restaurant" size={48} color={COLORS.textMuted} />
            </View>
          )}

          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.heroGradient} />

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.surfaceContainerLowest} />
          </TouchableOpacity>

          <View style={styles.heroOverlayContent}>
            {!!reservation.restaurantCategory && (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>
                  {t(`categories.${reservation.restaurantCategory}`, formatCategory(reservation.restaurantCategory))}
                </Text>
              </View>
            )}
            <View style={styles.heroTitleRow}>
              <Text style={styles.heroTitle}>{reservation.restaurantName}</Text>
              <Badge
                status={reservation.status}
                label={t(`reservations.status.${reservation.status}`, reservation.status)}
              />
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {justCreated && (
            <Animated.View
              style={[
                styles.successBanner,
                {
                  opacity: bannerAnim,
                  transform: [{ scale: bannerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }]
                }
              ]}
            >
              <View style={styles.successIconCircle}>
                <MaterialIcons name="check-circle" size={36} color={COLORS.onPrimary} />
              </View>
              <Text style={styles.successTitle}>{t('reservations.createSuccess')}</Text>
              <Text style={styles.successSubtitle}>{t('reservations.confirmedSubtitle')}</Text>
            </Animated.View>
          )}

          <Card>
            <InfoRow icon="event" label={t('reservations.date')} value={formatDate(reservation.date)} />
            <InfoRow icon="schedule" label={t('reservations.time')} value={reservation.time} />
            <InfoRow
              icon="groups"
              label={t('reservations.numberOfGuests')}
              value={t('reservations.guests', { count: reservation.guests })}
            />
            {reservation.tableNumber != null && (
              <InfoRow
                icon="event-seat"
                value={t('reservations.tableInfo', {
                  number: reservation.tableNumber,
                  capacity: reservation.tableCapacity
                })}
              />
            )}
          </Card>

          {!!reservation.notes && (
            <Card>
              <Text style={styles.sectionTitle}>{t('reservations.notes')}</Text>
              <Text style={styles.bodyText}>{reservation.notes}</Text>
            </Card>
          )}

          {reservation.status === 'CANCELLED' && !!reservation.cancelReason && (
            <Card>
              <Text style={styles.sectionTitle}>{t('reservations.cancelReservation')}</Text>
              <Text style={styles.bodyText}>{reservation.cancelReason}</Text>
            </Card>
          )}

          <Button
            title={t('restaurant.viewDetails')}
            variant="secondary"
            onPress={goToRestaurant}
            style={styles.actionButton}
          />

          {ACTIVE_STATUSES.includes(reservation.status) && (
            <Button
              title={t('reservations.modify')}
              onPress={() => navigation.navigate(RESERVATIONS_STACK_SCREENS.CREATE, { reservation })}
              style={styles.actionButton}
            />
          )}

          {ACTIVE_STATUSES.includes(reservation.status) && (
            <Button
              title={t('reservations.cancelReservation')}
              variant="secondary"
              onPress={handleCancel}
              loading={cancelling}
              style={styles.actionButton}
            />
          )}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmVisible}
        title={t('reservations.cancelConfirmTitle')}
        message={t('reservations.cancelConfirmMessage')}
        destructive
        onConfirm={confirmCancel}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    flexGrow: 1
  },
  heroWrapper: {
    width: '100%',
    height: 200
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
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 130
  },
  backButton: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.overlayDark,
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroOverlayContent: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: SPACING.md
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.overlayDark,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    marginBottom: SPACING.xs
  },
  categoryPillText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.surfaceContainerLowest,
    textTransform: 'none'
  },
  heroTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  heroTitle: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.surfaceContainerLowest,
    flex: 1,
    marginRight: SPACING.sm
  },
  body: {
    padding: SPACING.lg
  },
  successBanner: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  successTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    textAlign: 'center'
  },
  successSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md
  },
  infoTextWrap: {
    flex: 1
  },
  infoLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  infoValue: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.sm
  },
  bodyText: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.text
  },
  actionButton: {
    marginTop: SPACING.md
  }
});

export default ReservationDetailScreen;
