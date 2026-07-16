// src/shared/components/common/Input.jsx
import React from 'react';
import { Controller } from 'react-hook-form';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme.js';

const Input = ({ label, control, name, rules, placeholder, secureTextEntry = false, error, keyboardType = 'default', autoCapitalize = 'none', multiline = false, numberOfLines, disabled = false }) => {
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
              style={[styles.input, error && styles.inputError, multiline && styles.inputMultiline, disabled && styles.inputDisabled]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              multiline={multiline}
              numberOfLines={numberOfLines}
              editable={!disabled}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        )}
      />
    );
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, multiline && styles.inputMultiline, disabled && styles.inputDisabled]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={!disabled}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md
  },
  label: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text
  },
  inputError: {
    borderColor: COLORS.error
  },
  inputDisabled: {
    opacity: 0.6
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  errorText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.error,
    marginTop: SPACING.xs,
    textTransform: 'none'
  }
});

Input.propTypes = {
  label: PropTypes.string,
  control: PropTypes.object,
  name: PropTypes.string,
  rules: PropTypes.object,
  placeholder: PropTypes.string,
  secureTextEntry: PropTypes.bool,
  error: PropTypes.string,
  keyboardType: PropTypes.string,
  autoCapitalize: PropTypes.oneOf(['none', 'sentences', 'words', 'characters']),
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
  disabled: PropTypes.bool
};

export default Input;
