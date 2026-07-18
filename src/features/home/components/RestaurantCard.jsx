import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZE } from '../../../shared/constants/theme.js';
import { formatCategory } from '../../../shared/constants/categories.js';
import { Card } from '../../../shared/components/common/Common.jsx';
import useFavoritesStore from '../store/favoritesStore.js';

const RestaurantCard = ({ restaurant, onPress }) => {
  const { t } = useTranslation();
  const isFavorite = useFavoritesStore((state) => state.ids.includes(restaurant.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.imageWrapper}>
        {restaurant.image ? (
          <Image source={{ uri: restaurant.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <MaterialIcons name="restaurant" size={28} color={COLORS.textMuted} />
          </View>
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(restaurant.id)}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name={isFavorite ? 'favorite' : 'favorite-border'}
            size={18}
            color={isFavorite ? COLORS.error : COLORS.onPrimary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={styles.category} numberOfLines={1}>
          {t(`categories.${restaurant.category}`, formatCategory(restaurant.category))}
        </Text>
        <View style={styles.metaRow}>
          {!!restaurant.avgPrice && (
            <Text style={styles.price}>{t('common.currency')}{restaurant.avgPrice}</Text>
          )}
          <View style={styles.ratingPill}>
            <MaterialIcons name="star" size={13} color={COLORS.primaryContainer} />
            <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 0,
    overflow: 'hidden'
  },
  imageWrapper: {
    width: '100%'
  },
  image: {
    width: '100%',
    aspectRatio: 1
  },
  imagePlaceholder: {
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center'
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.overlayDark,
    justifyContent: 'center',
    alignItems: 'center'
  },
  info: {
    padding: SPACING.sm
  },
  name: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: 2
  },
  category: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  price: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    textTransform: 'none'
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    textTransform: 'none',
    marginLeft: 2
  }
});

RestaurantCard.propTypes = {
  restaurant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    image: PropTypes.string,
    category: PropTypes.string,
    avgPrice: PropTypes.number,
    rating: PropTypes.number
  }).isRequired,
  onPress: PropTypes.func.isRequired
};

export default React.memo(RestaurantCard);
