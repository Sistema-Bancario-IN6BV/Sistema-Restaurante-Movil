import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuthStore from '../shared/store/authStore.js';
import AuthStack from './AuthStack.jsx';
import MainTabs from './MainTabs.jsx';
import ProfileScreen from '../features/profile/screens/ProfileScreen.jsx';
import { COLORS } from '../shared/constants/theme.js';
import { ROOT_SCREENS } from './screenNames.js';

const RootStack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <RootStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
          <RootStack.Screen name={ROOT_SCREENS.MAIN_TABS} component={MainTabs} />
          <RootStack.Screen name={ROOT_SCREENS.PROFILE} component={ProfileScreen} />
        </RootStack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  }
});

export default AppNavigator;
