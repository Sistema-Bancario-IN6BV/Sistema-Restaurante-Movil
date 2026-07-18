import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../shared/constants/theme.js';

// Estados de evento a tono con la paleta "Noir & Grill" (DESIGN.md)
const STATUS_STYLE = {
  UPCOMING: { bg: COLORS.primaryFixed, fg: COLORS.primary, icon: 'schedule' },
  ONGOING: { bg: COLORS.successContainer, fg: COLORS.success, icon: 'play-circle-filled' },
  COMPLETED: { bg: COLORS.surfaceContainerHigh, fg: COLORS.onSurfaceVariant, icon: 'check-circle' },
  CANCELLED: { bg: COLORS.errorContainer, fg: COLORS.error, icon: 'cancel' }
};

const EventStatusPill = ({ status }) => {
  const { t } = useTranslation();
  const s = STATUS_STYLE[status] || STATUS_STYLE.UPCOMING;

  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <MaterialIcons name={s.icon} size={12} color={s.fg} style={styles.icon} />
      <Text style={[styles.text, { color: s.fg }]}>{t(`events.status.${status}`, status)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start'
  },
  icon: {
    marginRight: 4
  },
  text: {
    ...TYPOGRAPHY.labelSm,
    textTransform: 'uppercase'
  }
});

EventStatusPill.propTypes = {
  status: PropTypes.oneOf(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'])
};

export default EventStatusPill;
