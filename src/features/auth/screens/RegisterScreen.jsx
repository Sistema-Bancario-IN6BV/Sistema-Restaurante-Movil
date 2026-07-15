import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants/theme.js';
import Button from '../../../shared/components/common/Button.jsx';
import Input from '../../../shared/components/common/Input.jsx';
import BrandLogo from '../../../shared/components/common/BrandLogo.jsx';
import { useToast } from '../../../shared/components/common/Toast.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { AUTH_SCREENS } from '../../../navigation/screenNames.js';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const RegisterScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { control, handleSubmit, watch, formState: { errors } } = useForm();
  const { handleRegister, loading, error } = useAuth();
  const required = { value: true, message: t('auth.validation.required') };

  const onSubmit = async (data) => {
    const result = await handleRegister(data);
    if (result.success) {
      toast.show({
        type: 'success',
        title: t('auth.registerSuccessTitle'),
        message: t('auth.registerSuccessMessage'),
        duration: 5000
      });
      navigation.navigate(AUTH_SCREENS.LOGIN);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <BrandLogo size={72} style={styles.logoImage} />
        <Text style={styles.title}>{t('auth.createAccount')}</Text>
        <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>
      </View>

      <View style={styles.formContainer}>
        <Input
          label={t('auth.name')}
          control={control}
          name="name"
          rules={{ required }}
          placeholder={t('auth.namePlaceholder')}
          error={errors.name?.message}
        />
        <Input
          label={t('auth.surname')}
          control={control}
          name="surname"
          rules={{ required }}
          placeholder={t('auth.surnamePlaceholder')}
          error={errors.surname?.message}
        />
        <Input
          label={t('auth.username')}
          control={control}
          name="username"
          rules={{ required }}
          placeholder={t('auth.usernamePlaceholder')}
          error={errors.username?.message}
          autoCapitalize="none"
        />
        <Input
          label={t('auth.email')}
          control={control}
          name="email"
          rules={{
            required,
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('auth.validation.emailInvalid') }
          }}
          placeholder={t('auth.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email?.message}
        />
        <Input
          label={t('auth.phone')}
          control={control}
          name="phone"
          rules={{
            required,
            pattern: { value: /^\d{8}$/, message: t('auth.validation.phoneLength') }
          }}
          placeholder={t('auth.phonePlaceholder')}
          keyboardType="phone-pad"
          error={errors.phone?.message}
        />
        <Input
          label={t('auth.password')}
          control={control}
          name="password"
          rules={{
            required,
            pattern: { value: PASSWORD_REGEX, message: t('auth.validation.passwordComplexity') },
            minLength: { value: 8, message: t('auth.validation.passwordMin') }
          }}
          placeholder={t('auth.passwordPlaceholder')}
          secureTextEntry
          error={errors.password?.message}
        />
        <Input
          label={t('auth.confirmPassword')}
          control={control}
          name="confirmPassword"
          rules={{
            required,
            validate: (value) => value === watch('password') || t('auth.validation.passwordsNoMatch')
          }}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          secureTextEntry
          error={errors.confirmPassword?.message}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          title={t('auth.signUp')}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.button}
        />

        <Text style={styles.loginText} onPress={() => navigation.navigate(AUTH_SCREENS.LOGIN)}>
          {t('auth.haveAccount')} <Text style={styles.loginLink}>{t('auth.signIn')}</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    padding: SPACING.lg
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg
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
  formContainer: {
    width: '100%'
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
  loginText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl
  },
  loginLink: {
    color: COLORS.primary,
    fontFamily: 'DMSans_600SemiBold'
  }
});

export default RegisterScreen;
