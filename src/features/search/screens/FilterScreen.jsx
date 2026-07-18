import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../shared/constants/theme.js';
import { CATEGORIES } from '../../../shared/constants/categories.js';
import { Chip, StarRating } from '../../../shared/components/common/Common.jsx';
import Button from '../../../shared/components/common/Button.jsx';
import { HOME_STACK_SCREENS } from '../../../navigation/screenNames.js';

const FilterScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const initial = route.params?.filters || {};

  const [minPrice, setMinPrice] = useState(initial.minPrice != null ? String(initial.minPrice) : '');
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice != null ? String(initial.maxPrice) : '');
  const [minRating, setMinRating] = useState(initial.minRating || 0);
  const [category, setCategory] = useState(initial.category || null);

  const apply = () => {
    navigation.navigate(HOME_STACK_SCREENS.HOME, {
      filters: {
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
        minRating,
        category
      }
    });
  };

  const clear = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    setCategory(null);
    navigation.navigate(HOME_STACK_SCREENS.HOME, {
      filters: { minPrice: null, maxPrice: null, minRating: 0, category: null }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('filter.priceRange')}</Text>
        <View style={styles.priceRow}>
          <View style={styles.priceField}>
            <Text style={styles.priceLabel}>{t('filter.min')}</Text>
            <TextInput
              style={styles.priceInput}
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
          <View style={styles.priceField}>
            <Text style={styles.priceLabel}>{t('filter.max')}</Text>
            <TextInput
              style={styles.priceInput}
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="numeric"
              placeholder="200"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('filter.minRating')}</Text>
        <StarRating rating={minRating} onChange={setMinRating} size={28} />

        <Text style={styles.sectionTitle}>{t('filter.category')}</Text>
        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.value}
          numColumns={3}
          columnWrapperStyle={styles.categoryRow}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Chip
              label={t(`categories.${item.value}`)}
              icon={item.icon}
              selected={category === item.value}
              onPress={() => setCategory((prev) => (prev === item.value ? null : item.value))}
            />
          )}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button title={t('filter.clear')} variant="secondary" onPress={clear} style={styles.footerButton} />
        <Button title={t('filter.apply')} onPress={apply} style={styles.footerButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    padding: SPACING.lg
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md
  },
  priceRow: {
    flexDirection: 'row',
    gap: SPACING.md
  },
  priceField: {
    flex: 1
  },
  priceLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs
  },
  priceInput: {
    borderBottomWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text
  },
  categoryRow: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceContainerLowest
  },
  footerButton: {
    flex: 1
  }
});

export default FilterScreen;
