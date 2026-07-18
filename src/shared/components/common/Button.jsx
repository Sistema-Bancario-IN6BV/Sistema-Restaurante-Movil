// src/shared/components/common/Button.jsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme.js';

const Button = ({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        (disabled || loading) && styles.disabledButton,
        style
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? COLORS.onPrimary : COLORS.espresso} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.primaryText : styles.secondaryText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56
  },
  primaryButton: {
    backgroundColor: COLORS.primary
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.espresso
  },
  disabledButton: {
    opacity: 0.5
  },
  text: {
    ...TYPOGRAPHY.labelMd
  },
  primaryText: {
    color: COLORS.onPrimary
  },
  secondaryText: {
    color: COLORS.espresso
  }
});

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
};

export default Button;
