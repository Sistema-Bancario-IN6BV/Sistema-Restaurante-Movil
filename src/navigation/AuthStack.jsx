import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../features/auth/screens/LoginScreen.jsx';
import RegisterScreen from '../features/auth/screens/RegisterScreen.jsx';
import ForgotPasswordScreen from '../features/auth/screens/ForgotPasswordScreen.jsx';
import VerifyEmailScreen from '../features/auth/screens/VerifyEmailScreen.jsx';
import { AUTH_SCREENS } from './screenNames.js';
import { COLORS } from '../shared/constants/theme.js';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background }
      }}
    >
      <Stack.Screen name={AUTH_SCREENS.LOGIN} component={LoginScreen} />
      <Stack.Screen name={AUTH_SCREENS.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={AUTH_SCREENS.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
      <Stack.Screen name={AUTH_SCREENS.VERIFY_EMAIL} component={VerifyEmailScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
