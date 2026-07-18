import React, { useCallback, useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold
} from '@expo-google-fonts/playfair-display';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold
} from '@expo-google-fonts/dm-sans';
import i18n from './src/shared/i18n/index.js';
import AppNavigator from './src/navigation/AppNavigator.jsx';
import { ToastProvider } from './src/shared/components/common/Toast.jsx';

SplashScreen.preventAutoHideAsync();

// La app solo usa notificaciones locales (sin push remoto); este aviso de
// Expo Go (SDK 53+) sobre push remoto no aplica y es solo ruido en consola.
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications (remote notifications)'
]);

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <StatusBar style="dark" />
        <ToastProvider>
          <AppNavigator />
        </ToastProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}
