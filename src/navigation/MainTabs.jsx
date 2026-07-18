import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../shared/constants/theme.js';

import HomeScreen from '../features/home/screens/HomeScreen.jsx';
import RestaurantDetailScreen from '../features/home/screens/RestaurantDetailScreen.jsx';
import MenuItemDetailScreen from '../features/home/screens/MenuItemDetailScreen.jsx';

import FilterScreen from '../features/search/screens/FilterScreen.jsx';

import EventsListScreen from '../features/events/screens/EventsListScreen.jsx';
import EventDetailScreen from '../features/events/screens/EventDetailScreen.jsx';

import OrdersListScreen from '../features/orders/screens/OrdersListScreen.jsx';
import OrderDetailScreen from '../features/orders/screens/OrderDetailScreen.jsx';
import OrderTrackingScreen from '../features/orders/screens/OrderTrackingScreen.jsx';
import RateOrderScreen from '../features/orders/screens/RateOrderScreen.jsx';

import ReservationsListScreen from '../features/reservations/screens/ReservationsListScreen.jsx';
import CreateReservationScreen from '../features/reservations/screens/CreateReservationScreen.jsx';
import ReservationDetailScreen from '../features/reservations/screens/ReservationDetailScreen.jsx';

import CartScreen from '../features/cart/screens/CartScreen.jsx';

import NotificationsScreen from '../features/profile/screens/NotificationsScreen.jsx';
import useOrdersBadge from '../features/orders/hooks/useOrdersBadge.js';
import {
  TABS,
  HOME_STACK_SCREENS,
  EVENTS_STACK_SCREENS,
  ORDERS_STACK_SCREENS,
  RESERVATIONS_STACK_SCREENS
} from './screenNames.js';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
      <Stack.Screen name={HOME_STACK_SCREENS.HOME} component={HomeScreen} />
      <Stack.Screen name={HOME_STACK_SCREENS.FILTER} component={FilterScreen} />
      <Stack.Screen name={HOME_STACK_SCREENS.RESTAURANT_DETAIL} component={RestaurantDetailScreen} />
      <Stack.Screen name={HOME_STACK_SCREENS.MENU_ITEM_DETAIL} component={MenuItemDetailScreen} />
      <Stack.Screen name={HOME_STACK_SCREENS.CART} component={CartScreen} />
      <Stack.Screen name={HOME_STACK_SCREENS.CREATE_RESERVATION} component={CreateReservationScreen} />
      <Stack.Screen
        name={HOME_STACK_SCREENS.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{
          headerShown: true,
          title: t('notifications.title'),
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerTitleStyle: TYPOGRAPHY.headlineMd
        }}
      />
    </Stack.Navigator>
  );
};

const EventsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
    <Stack.Screen name={EVENTS_STACK_SCREENS.LIST} component={EventsListScreen} />
    <Stack.Screen name={EVENTS_STACK_SCREENS.DETAIL} component={EventDetailScreen} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
    <Stack.Screen name={ORDERS_STACK_SCREENS.LIST} component={OrdersListScreen} />
    <Stack.Screen name={ORDERS_STACK_SCREENS.DETAIL} component={OrderDetailScreen} />
    <Stack.Screen name={ORDERS_STACK_SCREENS.TRACKING} component={OrderTrackingScreen} />
    <Stack.Screen name={ORDERS_STACK_SCREENS.RATE} component={RateOrderScreen} />
  </Stack.Navigator>
);

const ReservationsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
    <Stack.Screen name={RESERVATIONS_STACK_SCREENS.LIST} component={ReservationsListScreen} />
    <Stack.Screen name={RESERVATIONS_STACK_SCREENS.CREATE} component={CreateReservationScreen} />
    <Stack.Screen name={RESERVATIONS_STACK_SCREENS.DETAIL} component={ReservationDetailScreen} />
  </Stack.Navigator>
);

const TAB_ICONS = {
  [TABS.HOME]: 'home',
  [TABS.EVENTS]: 'celebration',
  [TABS.ORDERS]: 'receipt-long',
  [TABS.RESERVATIONS]: 'event-available'
};

const BAR_CONTENT_HEIGHT = 64;

const MainTabs = () => {
  const { t } = useTranslation();
  const activeOrdersCount = useOrdersBadge();
  // insets.bottom reflects the OS's reserved system-nav space: small (gesture
  // pill) on gesture nav, larger (full bar) on 3-button nav — using it instead
  // of a fixed height lets the tab bar adapt to whichever the device/user has.
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: COLORS.background }}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
        tabBarActiveTintColor: COLORS.secondaryContainer,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.espresso,
          height: BAR_CONTENT_HEIGHT + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom,
          borderTopWidth: 0,
          ...SHADOWS.sm
        },
        tabBarLabelStyle: TYPOGRAPHY.labelSm,
        tabBarHideOnKeyboard: true,
        headerShown: false
      })}
    >
      <Tab.Screen name={TABS.HOME} component={HomeStack} options={{ title: t('navigation.home') }} />
      <Tab.Screen name={TABS.EVENTS} component={EventsStack} options={{ title: t('navigation.events') }} />
      <Tab.Screen
        name={TABS.ORDERS}
        component={OrdersStack}
        options={{
          title: t('navigation.orders'),
          tabBarBadge: activeOrdersCount > 0 ? activeOrdersCount : undefined
        }}
      />
      <Tab.Screen name={TABS.RESERVATIONS} component={ReservationsStack} options={{ title: t('navigation.reservations') }} />
    </Tab.Navigator>
  );
};

export default MainTabs;
