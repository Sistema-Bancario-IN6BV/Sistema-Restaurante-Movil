import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../../shared/constants/theme.js';
import { LoadingSpinner, EmptyState, Chip } from '../../../shared/components/common/Common.jsx';
import Button from '../../../shared/components/common/Button.jsx';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog.jsx';
import { useToast } from '../../../shared/components/common/Toast.jsx';
import { useMenuItemDetail } from '../hooks/useMenu.js';
import useCartStore from '../../../shared/store/cartStore.js';

const INGREDIENT_ICONS = [
  { keywords: ['carne', 'res', 'pollo', 'cerdo', 'jamón', 'jamon', 'tocino', 'bacon', 'wagyu'], icon: 'restaurant' },
  { keywords: ['pan', 'brioche', 'masa', 'tortilla'], icon: 'bakery-dining' },
  { keywords: ['queso', 'lácteo', 'lacteo', 'crema', 'leche', 'mantequilla'], icon: 'icecream' },
  { keywords: ['lechuga', 'tomate', 'vegetal', 'verdura', 'cebolla', 'pepino', 'aguacate', 'palta', 'higo'], icon: 'eco' },
  { keywords: ['salsa', 'aderezo', 'mayonesa', 'mostaza', 'aceite'], icon: 'water-drop' }
];

const getIngredientIcon = (name) => {
  const lower = name.toLowerCase();
  const match = INGREDIENT_ICONS.find(({ keywords }) => keywords.some((k) => lower.includes(k)));
  return match?.icon || 'restaurant-menu';
};

const MenuItemDetailScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { itemId } = route.params;
  const { item, loading, error, fetchItem } = useMenuItemDetail();
  const { addItem, replaceCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [pendingCartItem, setPendingCartItem] = useState(null);

  useEffect(() => {
    fetchItem(itemId);
  }, [itemId, fetchItem]);

  if (loading || !item) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <EmptyState icon="error-outline" message={t('menuItem.loadError')} />;
  }

  const handleAdd = () => {
    const cartItem = {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity,
      notes
    };

    const result = addItem(item.restaurantId, cartItem);

    if (result.conflict) {
      setPendingCartItem(cartItem);
      return;
    }

    toast.show({ type: 'success', message: t('menuItem.addedToCart') });
    navigation.goBack();
  };

  const confirmReplaceCart = () => {
    replaceCart(item.restaurantId, pendingCartItem);
    setPendingCartItem(null);
    toast.show({ type: 'success', message: t('menuItem.addedToCart') });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <MaterialIcons name="restaurant-menu" size={48} color={COLORS.textMuted} />
          </View>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={COLORS.surfaceContainerLowest} />
        </TouchableOpacity>

        <View style={styles.body}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{t('common.currency')}{item.price.toFixed(2)}</Text>
          {!!item.description && <Text style={styles.description}>{item.description}</Text>}

          {!item.available && (
            <Text style={styles.unavailableText}>{t('menuItem.unavailable')}</Text>
          )}

          {item.ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('menuItem.ingredients')}</Text>
              <View style={styles.ingredientsGrid}>
                {item.ingredients.map((ingredient) => (
                  <View key={ingredient} style={styles.ingredientCard}>
                    <View style={styles.ingredientIconCircle}>
                      <MaterialIcons name={getIngredientIcon(ingredient)} size={22} color={COLORS.primary} />
                    </View>
                    <Text style={styles.ingredientLabel} numberOfLines={2}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {item.allergens.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('menuItem.allergens')}</Text>
              <View style={styles.chipsRow}>
                {item.allergens.map((allergen) => (
                  <Chip key={allergen} label={allergen} icon="warning" />
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('menuItem.quantity')}</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <MaterialIcons name="remove" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity((q) => q + 1)}
              >
                <MaterialIcons name="add" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('menuItem.notes')}</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('menuItem.notesPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`${t('menuItem.addToCart')} · ${t('common.currency')}${(item.price * quantity).toFixed(2)}`}
          onPress={handleAdd}
          disabled={!item.available}
        />
      </View>

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
    paddingBottom: SPACING.xxl + SPACING.xl
  },
  image: {
    width: '100%',
    height: 300
  },
  imagePlaceholder: {
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center'
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
  body: {
    padding: SPACING.lg,
    marginTop: -RADIUS.lg,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    ...SHADOWS.sm
  },
  name: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.text
  },
  price: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.primary,
    textTransform: 'none',
    marginTop: SPACING.xs
  },
  description: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    marginTop: SPACING.sm
  },
  unavailableText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.error,
    marginTop: SPACING.sm
  },
  section: {
    marginTop: SPACING.lg
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.sm
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  ingredientCard: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm
  },
  ingredientIconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  ingredientLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.text,
    textAlign: 'center',
    textTransform: 'none'
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityText: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    marginHorizontal: SPACING.lg
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  footer: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: SPACING.lg
  }
});

export default MenuItemDetailScreen;
