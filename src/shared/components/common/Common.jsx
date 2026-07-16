// src/shared/components/common/Common.jsx
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, RADIUS, TYPOGRAPHY } from '../../constants/theme.js';

export const LoadingSpinner = ({ size = 'large', color }) => (
  <View style={styles.centerContainer}>
    <ActivityIndicator size={size} color={color || COLORS.primary} />
  </View>
);

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'large']),
  color: PropTypes.string
};

export const EmptyState = ({ message, icon }) => (
  <View style={styles.centerContainer}>
    {icon && <MaterialIcons name={icon} size={48} color={COLORS.textMuted} style={styles.emptyIcon} />}
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

EmptyState.propTypes = {
  message: PropTypes.string,
  icon: PropTypes.string
};

export const Card = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View style={[styles.card, style]}>
          {children}
        </View>
      </TouchableOpacity>
    );
  }
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onPress: PropTypes.func
};

const STATUS_COLORS = {
  PENDING: { bg: COLORS.surfaceContainerHigh, fg: COLORS.secondary, icon: 'schedule' },
  PREPARING: { bg: COLORS.surfaceContainerHigh, fg: COLORS.primary, icon: 'soup-kitchen' },
  READY: { bg: COLORS.tertiaryFixed, fg: COLORS.tertiary, icon: 'notifications-active' },
  DELIVERED: { bg: COLORS.successContainer, fg: COLORS.success, icon: 'check-circle' },
  CONFIRMED: { bg: COLORS.successContainer, fg: COLORS.success, icon: 'event-available' },
  COMPLETED: { bg: COLORS.successContainer, fg: COLORS.success, icon: 'check-circle' },
  CANCELLED: { bg: COLORS.errorContainer, fg: COLORS.error, icon: 'cancel' },
  EN_CAMINO: { bg: COLORS.tertiaryFixed, fg: COLORS.tertiary, icon: 'local-shipping' },
  DEFAULT: { bg: COLORS.surface, fg: COLORS.textMuted, icon: 'info' }
};

export const Badge = ({ status, label }) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.DEFAULT;
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <MaterialIcons name={colors.icon} size={12} color={colors.fg} style={styles.badgeIcon} />
      <Text style={[styles.badgeText, { color: colors.fg }]}>{label || status}</Text>
    </View>
  );
};

Badge.propTypes = {
  status: PropTypes.string,
  label: PropTypes.string
};

export const Chip = ({ label, selected = false, onPress, icon }) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {icon && (
        <MaterialIcons
          name={icon}
          size={14}
          color={selected ? COLORS.onPrimary : COLORS.text}
          style={styles.chipIcon}
        />
      )}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Wrapper>
  );
};

Chip.propTypes = {
  label: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onPress: PropTypes.func,
  icon: PropTypes.string
};

export const StarRating = ({ rating = 0, onChange, size = 18, readOnly = !onChange }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.starRow}>
      {stars.map((star) => {
        const filled = star <= Math.round(rating);
        const StarWrapper = readOnly ? View : TouchableOpacity;
        return (
          <StarWrapper key={star} onPress={() => onChange && onChange(star)} disabled={readOnly}>
            <MaterialIcons
              name={filled ? 'star' : 'star-border'}
              size={size}
              color={COLORS.primaryContainer}
              style={styles.starIcon}
            />
          </StarWrapper>
        );
      })}
    </View>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number,
  onChange: PropTypes.func,
  size: PropTypes.number,
  readOnly: PropTypes.bool
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl
  },
  emptyIcon: {
    marginBottom: SPACING.md
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    textAlign: 'center'
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start'
  },
  badgeIcon: {
    marginRight: 4
  },
  badgeText: {
    ...TYPOGRAPHY.labelSm,
    textTransform: 'uppercase'
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  chipIcon: {
    marginRight: 4
  },
  chipText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.text,
    textTransform: 'none'
  },
  chipTextSelected: {
    color: COLORS.onPrimary
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  starIcon: {
    marginRight: 2
  }
});
