import React from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../../shared/constants/theme.js';
import { Card, EmptyState } from '../../../shared/components/common/Common.jsx';
import useNotificationsStore from '../../../shared/store/notificationsStore.js';

const TYPE_BADGES = {
  order: { bg: COLORS.surfaceContainerHigh, fg: COLORS.primary, icon: 'delivery-dining' },
  reservation: { bg: COLORS.tertiaryContainer, fg: COLORS.tertiary, icon: 'event' },
  system: { bg: COLORS.surface, fg: COLORS.textMuted, icon: 'notifications' }
};

const formatTime = (isoDate, locale) =>
  new Date(isoDate).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getDateBucketLabel = (isoDate, t, locale) => {
  const date = new Date(isoDate);
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
  if (diffDays === 0) return t('notifications.today');
  if (diffDays === 1) return t('notifications.yesterday');
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
};

const groupByDate = (items, t, locale) => {
  const sections = [];
  const indexByLabel = new Map();
  items.forEach((item) => {
    const label = getDateBucketLabel(item.date, t, locale);
    if (!indexByLabel.has(label)) {
      indexByLabel.set(label, sections.length);
      sections.push({ title: label, data: [] });
    }
    sections[indexByLabel.get(label)].data.push(item);
  });
  return sections;
};

const NotificationRow = ({ item, locale }) => {
  const badge = TYPE_BADGES[item.type] || TYPE_BADGES.system;
  return (
    <Card style={!item.read && styles.unreadCard}>
      <View style={styles.row}>
        <View style={[styles.iconBadge, { backgroundColor: badge.bg }]}>
          <MaterialIcons name={badge.icon} size={20} color={badge.fg} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
          <Text style={styles.date}>{formatTime(item.date, locale)}</Text>
        </View>
      </View>
    </Card>
  );
};

const NotificationsScreen = () => {
  const { t, i18n } = useTranslation();
  const items = useNotificationsStore((state) => state.items);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);

  useFocusEffect(
    React.useCallback(() => {
      markAllRead();
    }, [markAllRead])
  );

  const sections = groupByDate(items, t, i18n.language);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<EmptyState icon="notifications-none" message={t('notifications.empty')} />}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      renderItem={({ item }) => <NotificationRow item={item} locale={i18n.language} />}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    flexGrow: 1
  },
  sectionHeader: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.textMuted,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm
  },
  unreadCard: {
    backgroundColor: COLORS.surfaceContainerHigh
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm
  },
  textContainer: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    ...TYPOGRAPHY.bodyMd,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.text,
    flex: 1
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.xs
  },
  body: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: 2
  },
  date: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textTransform: 'none'
  }
});

export default NotificationsScreen;
