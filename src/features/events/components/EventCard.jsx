import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme.js';
import EventStatusPill from './EventStatusPill.jsx';

const getDay = (date) => new Date(date).getDate();
const getMonth = (date) => new Date(date).toLocaleDateString(undefined, { month: 'short' }).replace('.', '');

const EventCard = ({ event, onPress }) => {
  const { t } = useTranslation();
  const day = getDay(event.date);
  const month = getMonth(event.date);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <View style={styles.hero}>
        {event.coverImage ? (
          <>
            <Image source={{ uri: event.coverImage }} style={styles.heroImage} />
            <View style={styles.datePill}>
              <Text style={styles.datePillDay}>{day}</Text>
              <Text style={styles.datePillMonth}>{month}</Text>
            </View>
          </>
        ) : (
          <View style={styles.heroPlaceholder}>
            <MaterialIcons name="celebration" size={26} color={COLORS.primary} style={styles.placeholderIcon} />
            <Text style={styles.placeholderDay}>{day}</Text>
            <Text style={styles.placeholderMonth}>{month}</Text>
          </View>
        )}

        <View style={styles.statusOverlay}>
          <EventStatusPill status={event.status} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>

        {!!event.restaurantName && (
          <View style={styles.metaRow}>
            <MaterialIcons name="storefront" size={14} color={COLORS.textMuted} />
            <Text style={styles.meta} numberOfLines={1}>{event.restaurantName}</Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <MaterialIcons name="schedule" size={14} color={COLORS.textMuted} />
          <Text style={styles.meta}>{event.startTime} - {event.endTime}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>
            {event.price > 0 ? `${t('common.currency')}${event.price}` : t('events.free')}
          </Text>
          <View style={styles.spotsWrap}>
            <MaterialIcons
              name={event.isFull ? 'block' : 'check-circle'}
              size={14}
              color={event.isFull ? COLORS.error : COLORS.success}
            />
            <Text style={[styles.spots, event.isFull && styles.spotsFull]}>
              {event.isFull ? t('events.full') : t('events.spotsLeft', { count: event.availableSpots ?? 0 })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.sm
  },
  hero: {
    height: 150,
    width: '100%'
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  heroPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderIcon: {
    position: 'absolute',
    top: SPACING.md,
    opacity: 0.55
  },
  placeholderDay: {
    ...TYPOGRAPHY.headlineLg,
    fontSize: 40,
    lineHeight: 44,
    color: COLORS.text
  },
  placeholderMonth: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    textTransform: 'uppercase'
  },
  datePill: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    alignItems: 'center',
    ...SHADOWS.sm
  },
  datePillDay: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: FONT_SIZE.lg,
    lineHeight: 22,
    color: COLORS.text
  },
  datePillMonth: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    textTransform: 'uppercase'
  },
  statusOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm
  },
  body: {
    padding: SPACING.md
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: FONT_SIZE.lg,
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  meta: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
    flex: 1
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md
  },
  price: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: FONT_SIZE.lg,
    color: COLORS.primary
  },
  spotsWrap: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  spots: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.success,
    textTransform: 'none',
    marginLeft: 4
  },
  spotsFull: {
    color: COLORS.error
  }
});

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    date: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    coverImage: PropTypes.string,
    restaurantName: PropTypes.string,
    status: PropTypes.string,
    price: PropTypes.number,
    isFull: PropTypes.bool,
    availableSpots: PropTypes.number
  }).isRequired,
  onPress: PropTypes.func.isRequired
};

export default React.memo(EventCard);
