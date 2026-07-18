import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../../shared/constants/theme.js';
import { MENU_TYPES, formatCategory } from '../../../shared/constants/categories.js';
import { Card, Badge, LoadingSpinner, EmptyState, StarRating } from '../../../shared/components/common/Common.jsx';
import Button from '../../../shared/components/common/Button.jsx';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog.jsx';
import { useToast } from '../../../shared/components/common/Toast.jsx';
import { useRestaurantDetail } from '../hooks/useRestaurants.js';
import { useRestaurantMenu } from '../hooks/useMenu.js';
import useReviews from '../hooks/useReviews.js';
import { addRecentlyVisited } from '../hooks/useRecentlyVisited.js';
import useCartStore from '../../../shared/store/cartStore.js';
import useFavoritesStore from '../store/favoritesStore.js';
import { isRestaurantOpenNow } from '../../../shared/utils/schedule.js';
import { HOME_STACK_SCREENS } from '../../../navigation/screenNames.js';

const MenuItemRow = ({ item, onPress, onAdd, t }) => (
  <Card onPress={onPress} style={styles.menuItemCard}>
    {item.image ? (
      <Image source={{ uri: item.image }} style={styles.menuItemImage} />
    ) : (
      <View style={[styles.menuItemImage, styles.menuItemImagePlaceholder]}>
        <MaterialIcons name="restaurant" size={20} color={COLORS.textMuted} />
      </View>
    )}
    <View style={styles.menuItemInfo}>
      <Text style={styles.menuItemName} numberOfLines={1}>{item.name}</Text>
      {!!item.description && (
        <Text style={styles.menuItemDescription} numberOfLines={2}>{item.description}</Text>
      )}
      <Text style={styles.menuItemPrice}>{t('common.currency')}{item.price.toFixed(2)}</Text>
      {!item.available && (
        <Text style={styles.unavailableText}>{t('menuItem.unavailable')}</Text>
      )}
    </View>
    <TouchableOpacity
      style={[styles.addButton, !item.available && styles.addButtonDisabled]}
      onPress={() => onAdd(item)}
      disabled={!item.available}
      activeOpacity={0.8}
    >
      <MaterialIcons name="add" size={22} color={COLORS.onPrimary} />
    </TouchableOpacity>
  </Card>
);

const ReviewRow = ({ review, t }) => (
  <Card style={styles.reviewCard}>
    <StarRating rating={review.rating} size={14} />
    {!!review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
    {!!review.adminReply && (
      <View style={styles.replyBox}>
        <Text style={styles.replyLabel}>{t('restaurant.reviews')}</Text>
        <Text style={styles.replyText}>{review.adminReply}</Text>
      </View>
    )}
  </Card>
);

const RestaurantDetailScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { restaurantId, restaurantName } = route.params;
  const { restaurant, loading, error, fetchRestaurant } = useRestaurantDetail();
  const { menu, loading: menuLoading, fetchMenu } = useRestaurantMenu();
  const { reviews, loading: reviewsLoading, fetchReviews } = useReviews();
  const { addItem, replaceCart, items, restaurantId: cartRestaurantId, getItemCount } = useCartStore();
  const isFavorite = useFavoritesStore((state) => state.ids.includes(restaurantId));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const [pendingCartItem, setPendingCartItem] = useState(null);

  useEffect(() => {
    fetchRestaurant(restaurantId);
    fetchMenu(restaurantId);
    fetchReviews(restaurantId);
  }, [restaurantId, fetchRestaurant, fetchMenu, fetchReviews]);

  useEffect(() => {
    if (restaurant) {
      addRecentlyVisited({
        id: restaurant.id,
        name: restaurant.name,
        image: restaurant.image
      });
    }
  }, [restaurant]);

  const handleAdd = (item) => {
    const cartItem = {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    };

    const result = addItem(restaurantId, cartItem);

    if (result.conflict) {
      setPendingCartItem(cartItem);
      return;
    }

    toast.show({ type: 'success', message: t('menuItem.addedToCart') });
  };

  const confirmReplaceCart = () => {
    replaceCart(restaurantId, pendingCartItem);
    setPendingCartItem(null);
  };

  if (loading || !restaurant) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <EmptyState icon="error-outline" message={t('restaurant.loadError')} />;
  }

  const isOpen = isRestaurantOpenNow(restaurant.schedule);
  const cartHasItemsHere = items.length > 0 && cartRestaurantId === restaurantId;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroWrapper}>
          {restaurant.image ? (
            <Image source={{ uri: restaurant.image }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <MaterialIcons name="restaurant" size={48} color={COLORS.textMuted} />
            </View>
          )}

          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.heroGradient} />

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.surfaceContainerLowest} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(restaurantId)}
            activeOpacity={0.85}
          >
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={22}
              color={isFavorite ? COLORS.error : COLORS.surfaceContainerLowest}
            />
          </TouchableOpacity>

          <View style={styles.heroOverlayContent}>
            <View style={styles.heroBadgesRow}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>
                  {t(`categories.${restaurant.category}`, formatCategory(restaurant.category))}
                </Text>
              </View>
              {isOpen !== null && (
                <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
                  <Text style={[styles.statusText, isOpen ? styles.statusOpenText : styles.statusClosedText]}>
                    {isOpen ? t('restaurant.open') : t('restaurant.closed')}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.heroRatingRow}>
              <StarRating rating={restaurant.rating} size={16} />
              <Text style={styles.heroRatingText}>
                {restaurant.rating.toFixed(1)} ({t('restaurant.reviewsCount', { count: restaurant.reviewCount })})
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{restaurant.name || restaurantName}</Text>

          {!!restaurant.address && (
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={18} color={COLORS.textMuted} />
              <Text style={styles.infoText}>
                {[restaurant.address.street, restaurant.address.city, restaurant.address.state]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </View>
          )}

          {!!restaurant.schedule && (
            <View style={styles.infoRow}>
              <MaterialIcons name="schedule" size={18} color={COLORS.textMuted} />
              <Text style={styles.infoText}>{restaurant.schedule}</Text>
            </View>
          )}

          <Button
            title={t('restaurant.reserveTable')}
            variant="secondary"
            onPress={() => navigation.navigate(HOME_STACK_SCREENS.CREATE_RESERVATION, { restaurantId, restaurantName: restaurant.name })}
            style={styles.reserveButton}
          />

          <Text style={styles.sectionTitle}>{t('restaurant.menu')}</Text>
          {menuLoading ? (
            <LoadingSpinner />
          ) : Object.keys(menu).length === 0 ? (
            <EmptyState icon="restaurant-menu" message={t('restaurant.noMenu')} />
          ) : (
            MENU_TYPES.filter((type) => menu[type]?.length > 0).map((type) => (
              <View key={type}>
                <Text style={styles.menuTypeTitle}>{type}</Text>
                {menu[type].map((item) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    t={t}
                    onPress={() => navigation.navigate(HOME_STACK_SCREENS.MENU_ITEM_DETAIL, { itemId: item.id })}
                    onAdd={handleAdd}
                  />
                ))}
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>{t('restaurant.reviews')}</Text>
          {reviewsLoading ? (
            <LoadingSpinner />
          ) : reviews.length === 0 ? (
            <EmptyState icon="star-border" message={t('restaurant.noReviews')} />
          ) : (
            reviews.map((review) => <ReviewRow key={review.id} review={review} t={t} />)
          )}
        </View>
      </ScrollView>

      {cartHasItemsHere && (
        <TouchableOpacity style={styles.cartBar} onPress={() => navigation.navigate(HOME_STACK_SCREENS.CART)} activeOpacity={0.9}>
          <MaterialIcons name="shopping-cart" size={20} color={COLORS.onPrimary} />
          <Text style={styles.cartBarText}>{t('restaurant.viewCart')} ({getItemCount()})</Text>
        </TouchableOpacity>
      )}

      <ConfirmDialog
        visible={!!pendingCartItem}
        title={t('restaurant.cartConflictTitle')}
        message={t('restaurant.cartConflictMessage')}
        onConfirm={confirmReplaceCart}
        onCancel={() => setPendingCartItem(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    paddingBottom: SPACING.xxl
  },
  heroWrapper: {
    width: '100%',
    height: 220
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
  favoriteButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
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
  heroBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  categoryPill: {
    backgroundColor: COLORS.overlayDark,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    marginRight: SPACING.sm
  },
  categoryPillText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.surfaceContainerLowest,
    textTransform: 'none'
  },
  heroRatingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  heroRatingText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.surfaceContainerLowest,
    textTransform: 'none',
    marginLeft: SPACING.xs
  },
  body: {
    padding: SPACING.lg
  },
  title: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.text
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full
  },
  statusOpen: {
    backgroundColor: COLORS.successContainer
  },
  statusClosed: {
    backgroundColor: COLORS.errorContainer
  },
  statusText: {
    ...TYPOGRAPHY.labelSm,
    textTransform: 'uppercase'
  },
  statusOpenText: {
    color: COLORS.success
  },
  statusClosedText: {
    color: COLORS.error
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm
  },
  infoText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    marginLeft: SPACING.xs,
    flex: 1
  },
  reserveButton: {
    marginTop: SPACING.lg
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md
  },
  menuTypeTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    marginBottom: SPACING.sm
  },
  menuItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  menuItemImage: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    marginRight: SPACING.sm
  },
  menuItemImagePlaceholder: {
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuItemInfo: {
    flex: 1,
    marginRight: SPACING.md
  },
  menuItemName: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.text
  },
  menuItemDescription: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    marginTop: 2
  },
  menuItemPrice: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    textTransform: 'none',
    marginTop: SPACING.xs
  },
  unavailableText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.error,
    marginTop: SPACING.xs
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonDisabled: {
    backgroundColor: COLORS.textMuted
  },
  reviewCard: {},
  reviewComment: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    marginTop: SPACING.xs
  },
  replyBox: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderColor: COLORS.border
  },
  replyLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary
  },
  replyText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    marginTop: 2
  },
  cartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.md,
    ...SHADOWS.lg
  },
  cartBarText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onPrimary,
    marginLeft: SPACING.sm
  }
});

export default RestaurantDetailScreen;
