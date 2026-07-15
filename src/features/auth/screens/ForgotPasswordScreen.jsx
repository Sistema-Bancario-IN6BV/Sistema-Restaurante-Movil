import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants/theme.js';
import Button from '../../../shared/components/common/Button.jsx';
import Input from '../../../shared/components/common/Input.jsx';
import BrandLogo from '../../../shared/components/common/BrandLogo.jsx';
import { useToast } from '../../../shared/components/common/Toast.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { AUTH_SCREENS } from '../../../navigation/screenNames.js';

const ForgotPasswordScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { control, handleSubmit, formState: { errors } } = useForm();
  const { handleForgotPassword, loading, error } = useAuth();

  const onSubmit = async (data) => {
    const result = await handleForgotPassword(data);
    if (result.success) {
      toast.show({ type: 'success', title: t('auth.forgotPasswordTitle'), message: t('auth.forgotPasswordSuccess') });
      navigation.navigate(AUTH_SCREENS.LOGIN);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BrandLogo size={80} style={styles.logoImage} />
        <Text style={styles.title}>{t('auth.forgotPasswordTitle')}</Text>
        <Text style={styles.subtitle}>{t('auth.forgotPasswordSubtitle')}</Text>
      </View>

      <Input
        label={t('auth.email')}
        control={control}
        name="email"
        rules={{
          required: t('auth.validation.required'),
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('auth.validation.emailInvalid') }
        }}
        placeholder={t('auth.emailPlaceholder')}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email?.message}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button
        title={t('auth.sendInstructions')}
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        style={styles.button}
      />

      <TouchableOpacity onPress={() => navigation.navigate(AUTH_SCREENS.LOGIN)}>
        <Text style={styles.backText}>{t('auth.backToLogin')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl
  },
  logoImage: {
    marginBottom: SPACING.md
  },
  title: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center'
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    textAlign: 'center'
  },
  button: {
    marginTop: SPACING.sm
  },
  errorText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md
  },
  backText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SPACING.lg,
    textTransform: 'none'
  }
});

export default ForgotPasswordScreen;
