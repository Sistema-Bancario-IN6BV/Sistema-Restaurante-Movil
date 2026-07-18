import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../../shared/constants/theme.js';
import { LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import AppHeader from '../../../shared/components/common/AppHeader.jsx';
import useEvents from '../hooks/useEvents.js';
import EventCard from '../components/EventCard.jsx';
import useDebouncedValue from '../../../shared/hooks/useDebouncedValue.js';
import { EVENTS_STACK_SCREENS } from '../../../navigation/screenNames.js';

const EventsListScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { events, loading, error, fetchEvents } = useEvents();
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebouncedValue(searchText, 400);

  const loadEvents = () => fetchEvents(debouncedSearch ? { q: debouncedSearch } : {});

  useEffect(() => {
    fetchEvents(debouncedSearch ? { q: debouncedSearch } : {});
  }, [debouncedSearch, fetchEvents]);

  return (
    <View style={styles.container}>
      <AppHeader />
      <Text style={styles.headerTitle}>{t('navigation.events')}</Text>

      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t('events.searchPlaceholder')}
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      {loading && events.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadEvents} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <EmptyState icon="event-busy" message={error ? t('events.loadError') : t('events.empty')} />
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => navigation.navigate(EVENTS_STACK_SCREENS.DETAIL, { eventId: item.id, eventTitle: item.title })}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.sm,
    ...SHADOWS.sm
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
    flexGrow: 1
  }
});

export default EventsListScreen;
