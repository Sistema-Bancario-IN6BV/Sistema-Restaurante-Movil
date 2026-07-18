import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants/theme.js';
import Button from '../../../shared/components/common/Button.jsx';
import Input from '../../../shared/components/common/Input.jsx';
import { useToast } from '../../../shared/components/common/Toast.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { AUTH_SCREENS } from '../../../navigation/screenNames.js';

const VerifyEmailScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { control, handleSubmit, formState: { errors } } = useForm();
  const { handleResendVerification, loading, error } = useAuth();

  const onSubmit = async (data) => {
    const result = await handleResendVerification(data);
    if (result.success) {
      toast.show({ type: 'success', title: t('auth.verifyEmailTitle'), message: t('auth.resendVerificationSent') });
    }
  };

  return (
    <View style={styles.container}>
      <MaterialIcons name="mark-email-unread" size={64} color={COLORS.primary} style={styles.icon} />
      <Text style={styles.title}>{t('auth.verifyEmailTitle')}</Text>
      <Text style={styles.message}>{t('auth.verifyEmailMessage')}</Text>

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
        title={t('auth.resendVerification')}
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
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    marginBottom: SPACING.lg
  },
  title: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center'
  },
  message: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl
  },
  button: {
    marginTop: SPACING.sm,
    width: '100%'
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

export default VerifyEmailScreen;
