import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../../shared/constants/theme.js';
import { CATEGORIES } from '../../../shared/constants/categories.js';
import { LoadingSpinner, EmptyState, Chip } from '../../../shared/components/common/Common.jsx';
import AppHeader from '../../../shared/components/common/AppHeader.jsx';
import useAuthStore from '../../../shared/store/authStore.js';
import useFavoritesStore from '../store/favoritesStore.js';
import useRestaurants from '../hooks/useRestaurants.js';
import useRecentlyVisited from '../hooks/useRecentlyVisited.js';
import useDebouncedValue from '../../../shared/hooks/useDebouncedValue.js';
import RestaurantCard from '../components/RestaurantCard.jsx';
import { HOME_STACK_SCREENS } from '../../../navigation/screenNames.js';

const RecentCard = ({ restaurant, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.recentCard} activeOpacity={0.85}>
    {restaurant.image ? (
      <Image source={{ uri: restaurant.image }} style={styles.recentImage} />
    ) : (
      <View style={[styles.recentImage, styles.imagePlaceholder]}>
        <MaterialIcons name="restaurant" size={22} color={COLORS.textMuted} />
      </View>
    )}
    <Text style={styles.recentName} numberOfLines={1}>{restaurant.name}</Text>
  </TouchableOpacity>
);

RecentCard.propTypes = {
  restaurant: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    image: PropTypes.string
  }).isRequired,
  onPress: PropTypes.func.isRequired
};

/**
 * Home tab: restaurant search/filter/listing, recently-visited shortcuts.
 * @param {object} props
 * @param {object} props.navigation - React Navigation navigation prop.
 * @param {object} props.route - React Navigation route prop; accepts `params.filters`
 *   ({ minPrice, maxPrice, minRating, category }) forwarded back from `FilterScreen`.
 */
const HomeScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { restaurants, loading, error, fetchRestaurants } = useRestaurants();
  const recentlyVisited = useRecentlyVisited();

  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState(null);
  const [filters, setFilters] = useState({ minPrice: null, maxPrice: null, minRating: 0 });

  const debouncedSearch = useDebouncedValue(searchText, 400);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    useFavoritesStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (route.params?.filters) {
      const { category: cat, ...rest } = route.params.filters;
      setFilters((prev) => ({ ...prev, ...rest }));
      if (cat !== undefined) {
        setCategory(cat);
      }
    }
  }, [route.params?.filters]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      if (debouncedSearch && !r.name.toLowerCase().includes(debouncedSearch.toLowerCase())) {
        return false;
      }
      if (category && r.category !== category) {
        return false;
      }
      if (filters.minPrice != null && (r.avgPrice == null || r.avgPrice < filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice != null && (r.avgPrice == null || r.avgPrice > filters.maxPrice)) {
        return false;
      }
      if (filters.minRating && r.rating < filters.minRating) {
        return false;
      }
      return true;
    });
  }, [restaurants, debouncedSearch, category, filters]);

  const isFiltering = Boolean(
    debouncedSearch || category || filters.minPrice != null || filters.maxPrice != null || filters.minRating
  );

  const goToRestaurant = (restaurant) => {
    navigation.navigate(HOME_STACK_SCREENS.RESTAURANT_DETAIL, { restaurantId: restaurant.id, restaurantName: restaurant.name });
  };

  const selectCategory = (value) => {
    setCategory(value);
  };

  const openFilters = () => {
    navigation.navigate(HOME_STACK_SCREENS.FILTER, { filters: { ...filters, category } });
  };

  const categoryChips = [{ value: null, icon: null }, ...CATEGORIES];

  const renderHeader = () => (
    <View>
      <View style={styles.greetingBlock}>
        <Text style={styles.greeting}>{t('home.greeting', { name: user?.name || user?.username || '' })}</Text>
        <Text style={styles.tagline}>{t('home.tagline')}</Text>
      </View>

      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t('search.placeholder')}
          placeholderTextColor={COLORS.textMuted}
        />
        <TouchableOpacity onPress={openFilters} style={styles.filterButton}>
          <MaterialIcons name="tune" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t('home.categories')}</Text>
      <FlatList
        data={categoryChips}
        keyExtractor={(item) => item.value ?? 'ALL'}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
        renderItem={({ item }) => (
          <Chip
            label={item.value ? t(`categories.${item.value}`) : t('home.allCategories')}
            icon={item.icon}
            selected={category === item.value}
            onPress={() => selectCategory(item.value)}
          />
        )}
      />

      {recentlyVisited.length > 0 && !isFiltering && (
        <>
          <Text style={styles.sectionTitle}>{t('home.recentlyVisited')}</Text>
          <FlatList
            data={recentlyVisited}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentRow}
            renderItem={({ item }) => (
              <RecentCard restaurant={item} onPress={() => goToRestaurant(item)} />
            )}
          />
        </>
      )}

      <Text style={styles.sectionTitle}>{t('home.nearbyRestaurants')}</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <AppHeader />

      {loading && restaurants.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader()}
          ListEmptyComponent={
            <EmptyState
              icon="restaurant-menu"
              message={error ? t('home.loadError') : isFiltering ? t('search.noResults') : t('home.noRestaurants')}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <RestaurantCard restaurant={item} onPress={() => goToRestaurant(item)} />
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchRestaurants} tintColor={COLORS.primary} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    backgroundColor: COLORS.background,
    flexGrow: 1
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  greetingBlock: {
    marginBottom: SPACING.lg
  },
  greeting: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.text
  },
  tagline: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    marginTop: SPACING.xs
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.full,
    ...SHADOWS.sm
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm
  },
  filterButton: {
    padding: SPACING.xs
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md
  },
  categoriesRow: {
    paddingBottom: SPACING.xs
  },
  columnWrapper: {
    justifyContent: 'space-between'
  },
  cardWrapper: {
    width: '48%',
    marginBottom: SPACING.md
  },
  recentRow: {
    paddingBottom: SPACING.xs
  },
  recentCard: {
    width: 96,
    marginRight: SPACING.md
  },
  recentImage: {
    width: 96,
    height: 72,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs
  },
  recentName: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.text,
    textTransform: 'none'
  },
  imagePlaceholder: {
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

HomeScreen.propTypes = {
  navigation: PropTypes.shape({ navigate: PropTypes.func.isRequired }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      filters: PropTypes.shape({
        minPrice: PropTypes.number,
        maxPrice: PropTypes.number,
        minRating: PropTypes.number,
        category: PropTypes.string
      })
    })
  })
};

export default HomeScreen;
