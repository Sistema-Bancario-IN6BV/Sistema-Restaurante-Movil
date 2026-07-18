import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../../shared/constants/theme.js';
import { Card, Badge, LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import AppHeader from '../../../shared/components/common/AppHeader.jsx';
import useReservations from '../hooks/useReservations.js';
import { TABS, HOME_STACK_SCREENS, RESERVATIONS_STACK_SCREENS } from '../../../navigation/screenNames.js';

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

const ReservationRow = ({ reservation, onPress, t }) => (
  <Card onPress={onPress} style={styles.rowCard}>
    <View style={styles.rowContent}>
      {reservation.restaurantImage ? (
        <Image source={{ uri: reservation.restaurantImage }} style={styles.rowImage} />
      ) : (
        <View style={[styles.rowImage, styles.rowImagePlaceholder]}>
          <MaterialIcons name="restaurant" size={22} color={COLORS.textMuted} />
        </View>
      )}
      <View style={styles.rowInfo}>
        <View style={styles.rowHeader}>
          <Text style={styles.restaurantName} numberOfLines={1}>{reservation.restaurantName}</Text>
          <Badge
            status={reservation.status}
            label={t(`reservations.status.${reservation.status}`, reservation.status)}
          />
        </View>
        <Text style={styles.meta}>{formatDate(reservation.date)} · {reservation.time}</Text>
        <Text style={styles.meta}>{t('reservations.guests', { count: reservation.guests })}</Text>
        {reservation.tableNumber != null && (
          <Text style={styles.meta}>{t('reservations.table', { number: reservation.tableNumber })}</Text>
        )}
      </View>
    </View>
  </Card>
);

const ReservationsListScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { reservations, loading, error, fetchReservations } = useReservations();

  useFocusEffect(
    React.useCallback(() => {
      fetchReservations();
    }, [fetchReservations])
  );

  return (
    <View style={styles.container}>
      <AppHeader />
      <Text style={styles.headerTitle}>{t('navigation.reservations')}</Text>

      {loading && reservations.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchReservations}
          refreshing={loading}
          ListEmptyComponent={
            <EmptyState icon="event-busy" message={error ? t('reservations.loadError') : t('reservations.empty')} />
          }
          renderItem={({ item }) => (
            <ReservationRow
              reservation={item}
              t={t}
              onPress={() => navigation.navigate(RESERVATIONS_STACK_SCREENS.DETAIL, { reservationId: item.id })}
            />
          )}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate(TABS.HOME, { screen: HOME_STACK_SCREENS.HOME })}
      >
        <MaterialIcons name="add" size={28} color={COLORS.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    flexGrow: 1
  },
  rowCard: {
    padding: SPACING.sm
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  rowImage: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    marginRight: SPACING.md
  },
  rowImagePlaceholder: {
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rowInfo: {
    flex: 1
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  restaurantName: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm
  },
  meta: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md
  }
});

export default ReservationsListScreen;
