// src/shared/components/common/Toast.jsx
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme.js';

const TOAST_TYPES = {
  success: { icon: 'check-circle', color: COLORS.success },
  error: { icon: 'error-outline', color: COLORS.error },
  warning: { icon: 'warning-amber', color: COLORS.warning },
  info: { icon: 'info-outline', color: COLORS.tertiary }
};

const DEFAULT_DURATION = 3000;

const ToastContext = createContext(null);

const ToastItem = ({ toast, onDismiss }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true })
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -16, duration: 180, useNativeDriver: true })
      ]).start(() => onDismiss(toast.id));
    }, toast.duration);

    return () => clearTimeout(timer);
  }, []);

  const { icon, color } = TOAST_TYPES[toast.type] || TOAST_TYPES.info;

  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onDismiss(toast.id)} style={styles.toastContent}>
        <View style={[styles.accent, { backgroundColor: color }]} />
        <MaterialIcons name={icon} size={22} color={color} style={styles.icon} />
        <View style={styles.textContainer}>
          {toast.title ? <Text style={styles.title}>{toast.title}</Text> : null}
          {toast.message ? <Text style={styles.message}>{toast.message}</Text> : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

ToastItem.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    title: PropTypes.string,
    message: PropTypes.string,
    duration: PropTypes.number
  }).isRequired,
  onDismiss: PropTypes.func.isRequired
};

export const ToastProvider = ({ children }) => {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(({ type = 'info', title, message, duration = DEFAULT_DURATION }) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, type, title, message, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View style={[styles.container, { top: insets.top + SPACING.sm }]} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 999
  },
  toast: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.md
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4
  },
  icon: {
    marginRight: SPACING.sm,
    marginLeft: SPACING.xs
  },
  textContainer: {
    flex: 1
  },
  title: {
    ...TYPOGRAPHY.bodyMd,
    fontFamily: FONTS.label,
    color: COLORS.text
  },
  message: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: 2
  }
});
