import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS, FONTS } from '../../constants/theme.js';
import useAuthStore from '../../store/authStore.js';
import useCartStore from '../../store/cartStore.js';
import useNotificationsStore from '../../store/notificationsStore.js';
import { ROOT_SCREENS, TABS, HOME_STACK_SCREENS } from '../../../navigation/screenNames.js';

const AppHeader = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { getItemCount } = useCartStore();
  const unreadCount = useNotificationsStore((state) => state.items.filter((item) => !item.read).length);

  const avatarUri = user?.profilePicture?.startsWith('http') ? user.profilePicture : null;

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <Image source={require('../../../../assets/Logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brandText}>KinalEat</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(ROOT_SCREENS.MAIN_TABS, { screen: TABS.HOME, params: { screen: HOME_STACK_SCREENS.NOTIFICATIONS } })}
        >
          <MaterialIcons name="notifications" size={22} color={COLORS.text} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(ROOT_SCREENS.MAIN_TABS, { screen: TABS.HOME, params: { screen: HOME_STACK_SCREENS.CART } })}
        >
          <MaterialIcons name="shopping-cart" size={22} color={COLORS.text} />
          {getItemCount() > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getItemCount()}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate(ROOT_SCREENS.PROFILE)}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {(user?.name || user?.username || 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md
  },
  brandText: {
    fontFamily: FONTS.headline,
    fontSize: 20,
    color: COLORS.primary
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3
  },
  badgeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onPrimary,
    fontSize: 10,
    lineHeight: 12,
    textTransform: 'none'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarInitial: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onPrimary,
    textTransform: 'none'
  }
});

export default AppHeader;
