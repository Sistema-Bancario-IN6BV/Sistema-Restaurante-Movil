import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants/theme.js';
import Button from '../../../shared/components/common/Button.jsx';
import Input from '../../../shared/components/common/Input.jsx';
import BrandLogo from '../../../shared/components/common/BrandLogo.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { AUTH_SCREENS } from '../../../navigation/screenNames.js';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { control, handleSubmit, formState: { errors } } = useForm();
  const { handleLogin, loading, error } = useAuth();

  const onSubmit = async (data) => {
    await handleLogin(data);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <BrandLogo size={104} style={styles.logoImage} />
          <Text style={styles.logo}>KinalEat</Text>
          <Text style={styles.title}>{t('auth.welcomeBack')}</Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            label={t('auth.emailOrUsername')}
            control={control}
            name="emailOrUsername"
            rules={{ required: t('auth.validation.required') }}
            placeholder={t('auth.emailOrUsernamePlaceholder')}
            error={errors.emailOrUsername?.message}
            autoCapitalize="none"
          />
          <Input
            label={t('auth.password')}
            control={control}
            name="password"
            rules={{ required: t('auth.validation.required') }}
            placeholder={t('auth.passwordPlaceholder')}
            secureTextEntry
            error={errors.password?.message}
          />

          <TouchableOpacity onPress={() => navigation.navigate(AUTH_SCREENS.FORGOT_PASSWORD)} style={styles.forgotLink}>
            <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title={t('auth.signIn')}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.button}
          />

          <TouchableOpacity onPress={() => navigation.navigate(AUTH_SCREENS.REGISTER)}>
            <Text style={styles.registerText}>
              {t('auth.noAccount')} <Text style={styles.registerLink}>{t('auth.signUp')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl
  },
  logoImage: {
    marginBottom: SPACING.md
  },
  logo: {
    ...TYPOGRAPHY.displayLg,
    color: COLORS.primary,
    marginBottom: SPACING.md
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted
  },
  formContainer: {
    width: '100%'
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.md
  },
  forgotText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    textTransform: 'none'
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
  registerText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg
  },
  registerLink: {
    color: COLORS.primary,
    fontFamily: 'DMSans_600SemiBold'
  }
});

export default LoginScreen;
