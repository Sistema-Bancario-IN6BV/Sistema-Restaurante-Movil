import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZE } from '../../../shared/constants/theme.js';
import { LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import Button from '../../../shared/components/common/Button.jsx';
import { useToast } from '../../../shared/components/common/Toast.jsx';
import EventStatusPill from '../components/EventStatusPill.jsx';
import { useEventDetail } from '../hooks/useEvents.js';

const fmtDay = (d) => new Date(d).getDate();
const fmtMonth = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short' }).replace('.', '');
const fmtFullDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const InfoRow = ({ icon, label, value, highlight }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <MaterialIcons name={icon} size={18} color={COLORS.primary} />
    </View>
    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>{value}</Text>
    </View>
  </View>
);

const EventDetailScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { show } = useToast();
  const { eventId } = route.params;
  const { event, loading, error, fetchEvent, setEvent, registerToEvent, unregisterFromEvent } = useEventDetail();
  const [registered, setRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvent(eventId);
  }, [eventId, fetchEvent]);

  const handleRegister = async () => {
    setSubmitting(true);
    try {
      await registerToEvent(eventId);
      setRegistered(true);
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              registeredCount: (prev.registeredCount || 0) + 1,
              availableSpots: prev.availableSpots != null ? prev.availableSpots - 1 : prev.availableSpots
            }
          : prev
      );
      show({ type: 'success', message: t('events.registerSuccess') });
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setRegistered(true);
        show({ type: 'info', message: t('events.alreadyRegistered') });
      } else if (status === 400) {
        show({ type: 'error', message: t('events.full') });
      } else {
        show({ type: 'error', message: err.response?.data?.message || t('events.registerError') });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnregister = async () => {
    setSubmitting(true);
    try {
      await unregisterFromEvent(eventId);
      setRegistered(false);
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              registeredCount: Math.max(0, (prev.registeredCount || 0) - 1),
              availableSpots: prev.availableSpots != null ? prev.availableSpots + 1 : prev.availableSpots
            }
          : prev
      );
      show({ type: 'success', message: t('events.unregisterSuccess') });
    } catch (err) {
      show({ type: 'error', message: err.response?.data?.message || t('events.unregisterError') });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !event) {
    return <LoadingSpinner />;
  }

  if (error && !event) {
    return <EmptyState icon="error-outline" message={t('events.loadError')} />;
  }

  if (!event) {
    return null;
  }

  const canRegister = event.status === 'UPCOMING' || event.status === 'ONGOING';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {event.title || route.params?.eventTitle || t('events.detailTitle')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {event.coverImage ? (
            <Image source={{ uri: event.coverImage }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <MaterialIcons name="celebration" size={40} color={COLORS.primary} style={styles.heroIcon} />
              <Text style={styles.heroDay}>{fmtDay(event.date)}</Text>
              <Text style={styles.heroMonth}>{fmtMonth(event.date)}</Text>
            </View>
          )}
          <View style={styles.statusOverlay}>
            <EventStatusPill status={event.status} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.infoCard}>
            {!!event.restaurantName && (
              <InfoRow icon="storefront" label={t('events.venueLabel')} value={event.restaurantName} />
            )}
            <InfoRow icon="event" label={t('events.dateLabel')} value={fmtFullDate(event.date)} />
            <InfoRow icon="schedule" label={t('events.timeLabel')} value={`${event.startTime} - ${event.endTime}`} />
            <InfoRow
              icon="groups"
              label={t('events.capacityLabel')}
              value={t('events.spotsInfo', { available: event.availableSpots ?? 0, capacity: event.capacity ?? 0 })}
            />
            <InfoRow
              icon="payments"
              label={t('events.priceLabel')}
              value={event.price > 0 ? `${t('common.currency')}${event.price}` : t('events.free')}
              highlight
            />
          </View>

          {!!event.description && (
            <View style={styles.block}>
              <Text style={styles.sectionLabel}>{t('events.about')}</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {event.services?.length > 0 && (
            <View style={styles.block}>
              <Text style={styles.sectionLabel}>{t('events.services')}</Text>
              <Text style={styles.description}>{event.services.join(' · ')}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {canRegister && (
        <View style={styles.footer}>
          {registered ? (
            <Button title={t('events.unregister')} variant="secondary" loading={submitting} onPress={handleUnregister} />
          ) : (
            <Button title={t('events.register')} loading={submitting} disabled={event.isFull} onPress={handleRegister} />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    paddingBottom: SPACING.xxl + SPACING.xl
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background
  },
  headerBack: {
    padding: SPACING.xs
  },
  headerSpacer: {
    width: 24
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm
  },
  hero: {
    height: 220,
    width: '100%',
    backgroundColor: COLORS.primaryFixed,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    overflow: 'hidden'
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  heroPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroIcon: {
    marginBottom: SPACING.xs,
    opacity: 0.7
  },
  heroDay: {
    ...TYPOGRAPHY.headlineLg,
    fontSize: 48,
    lineHeight: 52,
    color: COLORS.text
  },
  heroMonth: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    textTransform: 'uppercase'
  },
  statusOverlay: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md
  },
  section: {
    padding: SPACING.lg
  },
  title: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md
  },
  infoTextWrap: {
    flex: 1
  },
  infoLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  infoValue: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text
  },
  infoValueHighlight: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: FONT_SIZE.lg,
    color: COLORS.primary
  },
  block: {
    marginTop: SPACING.lg
  },
  sectionLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm
  },
  description: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurfaceVariant
  },
  footer: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: SPACING.lg
  }
});

EventDetailScreen.propTypes = {
  navigation: PropTypes.shape({ goBack: PropTypes.func.isRequired }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({ eventId: PropTypes.string.isRequired, eventTitle: PropTypes.string })
  }).isRequired
};

export default EventDetailScreen;
