import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants/theme.js';
import { Card, Badge, LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import AppHeader from '../../../shared/components/common/AppHeader.jsx';
import useOrders from '../hooks/useOrders.js';
import { ORDERS_STACK_SCREENS } from '../../../navigation/screenNames.js';

const OrderRow = ({ order, onPress, t }) => (
  <Card onPress={onPress}>
    <View style={styles.rowHeader}>
      <Text style={styles.restaurantName}>{order.restaurantName}</Text>
      <Badge status={order.status} label={t(`orders.status.${order.status}`, order.status)} />
    </View>
    <Text style={styles.meta}>{t('orders.itemsCount', { count: order.items.length })}</Text>
    <Text style={styles.meta}>{t(`orders.type.${order.type}`)}</Text>
    <Text style={styles.total}>{t('common.currency')}{order.total.toFixed(2)}</Text>
  </Card>
);

const OrdersListScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { orders, loading, error, fetchOrders } = useOrders();

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  return (
    <View style={styles.wrapper}>
      <AppHeader />
      <Text style={styles.headerTitle}>{t('navigation.orders')}</Text>

      {loading && orders.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchOrders}
          refreshing={loading}
          ListEmptyComponent={
            <EmptyState icon="receipt-long" message={error ? t('orders.loadError') : t('orders.empty')} />
          }
          renderItem={({ item }) => (
            <OrderRow order={item} t={t} onPress={() => navigation.navigate(ORDERS_STACK_SCREENS.DETAIL, { orderId: item.id })} />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.background,
    flexGrow: 1
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
  total: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    textTransform: 'none',
    marginTop: SPACING.xs
  }
});

export default OrdersListScreen;
