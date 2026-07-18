import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../shared/constants/theme.js';
import { Card, Chip, EmptyState } from '../../../shared/components/common/Common.jsx';
import { useToast } from '../../../shared/components/common/Toast.jsx';
import Input from '../../../shared/components/common/Input.jsx';
import Button from '../../../shared/components/common/Button.jsx';
import useCart from '../hooks/useCart.js';
import { TABS, ORDERS_STACK_SCREENS } from '../../../navigation/screenNames.js';

const ORDER_TYPES = ['DELIVERY', 'TAKEOUT'];

const CartItemRow = ({ item, onIncrease, onDecrease, onRemove, t }) => (
  <Card style={styles.itemCard}>
    <View style={styles.itemRow}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      ) : (
        <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
          <MaterialIcons name="restaurant" size={24} color={COLORS.textMuted} />
        </View>
      )}
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <TouchableOpacity onPress={onRemove}>
            <MaterialIcons name="close" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
        {!!item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>{t('common.currency')}{(item.price * item.quantity).toFixed(2)}</Text>
          <View style={styles.quantityPill}>
            <TouchableOpacity style={styles.quantityButton} onPress={onDecrease}>
              <MaterialIcons name="remove" size={16} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{item.quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={onIncrease}>
              <MaterialIcons name="add" size={16} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  </Card>
);

const CartHeader = ({ navigation }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.headerWrap}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <MaterialIcons name="chevron-left" size={26} color={COLORS.textMuted} />
        <Text style={styles.backText}>{t('common.back')}</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t('cart.headerTitle')}</Text>
    </View>
  );
};

CartHeader.propTypes = {
  navigation: PropTypes.shape({ goBack: PropTypes.func.isRequired }).isRequired
};

const CartScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { items, orderType, setOrderType, placing, subtotal, tax, total, updateQuantity, removeItem, placeOrder } =
    useCart();
  const { control, handleSubmit } = useForm({
    defaultValues: { street: '', city: '', notes: '' }
  });

  if (items.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <CartHeader navigation={navigation} />
        <EmptyState icon="shopping-cart" message={t('cart.empty')} />
      </View>
    );
  }

  const onSubmit = async (form) => {
    try {
      const order = await placeOrder(form);
      toast.show({ type: 'success', message: t('cart.placeOrderSuccess') });
      navigation.navigate(TABS.ORDERS, { screen: ORDERS_STACK_SCREENS.TRACKING, params: { orderId: order.id } });
    } catch (err) {
      const message = err.code === 'STREET_REQUIRED' ? t('cart.streetRequired') : t('cart.placeOrderError');
      toast.show({ type: 'error', title: t('common.error'), message });
    }
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.menuItemId}
      contentContainerStyle={styles.content}
      ListHeaderComponent={<CartHeader navigation={navigation} />}
      renderItem={({ item }) => (
        <CartItemRow
          item={item}
          t={t}
          onIncrease={() => updateQuantity(item.menuItemId, item.quantity + 1)}
          onDecrease={() => updateQuantity(item.menuItemId, item.quantity - 1)}
          onRemove={() => removeItem(item.menuItemId)}
        />
      )}
      ListFooterComponent={
        <View>
          <Card>
            <Text style={styles.sectionTitle}>{t('cart.orderType')}</Text>
            <View style={styles.typeRow}>
              {ORDER_TYPES.map((type) => (
                <Chip
                  key={type}
                  label={t(`orders.type.${type}`)}
                  selected={orderType === type}
                  onPress={() => setOrderType(type)}
                />
              ))}
            </View>
          </Card>

          {orderType === 'DELIVERY' && (
            <Card>
              <Text style={styles.sectionTitle}>{t('cart.title')}</Text>
              <Input control={control} name="street" label={t('cart.street')} placeholder={t('cart.street')} />
              <Input control={control} name="city" label={t('cart.city')} placeholder={t('cart.city')} />
              <Input control={control} name="notes" label={t('cart.notes')} placeholder={t('cart.notes')} multiline numberOfLines={3} />
            </Card>
          )}

          <Card>
            <View style={styles.totalsRow}>
              <Text style={styles.mutedText}>{t('cart.subtotal')}</Text>
              <Text style={styles.bodyText}>{t('common.currency')}{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.mutedText}>{t('cart.tax')}</Text>
              <Text style={styles.bodyText}>{t('common.currency')}{tax.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalLabel}>{t('cart.total')}</Text>
              <Text style={styles.totalValue}>{t('common.currency')}{total.toFixed(2)}</Text>
            </View>
          </Card>

          <Button title={t('cart.placeOrder')} onPress={handleSubmit(onSubmit)} loading={placing} style={styles.placeOrderButton} />
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    backgroundColor: COLORS.background,
    flexGrow: 1
  },
  emptyWrap: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background
  },
  headerWrap: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: SPACING.md
  },
  backText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text
  },
  itemCard: {
    paddingVertical: SPACING.md
  },
  itemRow: {
    flexDirection: 'row'
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    marginRight: SPACING.md
  },
  itemImagePlaceholder: {
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemContent: {
    flex: 1
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemName: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm
  },
  itemNotes: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    marginTop: SPACING.xs
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm
  },
  quantityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xs
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityValue: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    minWidth: 20,
    textAlign: 'center'
  },
  itemPrice: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    textTransform: 'none'
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.sm
  },
  typeRow: {
    flexDirection: 'row'
  },
  bodyText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text
  },
  mutedText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted
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
  placeOrderButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl
  }
});

CartScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired
  }).isRequired
};

export default CartScreen;
