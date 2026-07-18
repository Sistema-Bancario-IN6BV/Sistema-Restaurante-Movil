import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../../shared/constants/theme.js';
import { Card, Chip, EmptyState } from '../../../shared/components/common/Common.jsx';
import Input from '../../../shared/components/common/Input.jsx';
import Button from '../../../shared/components/common/Button.jsx';
import { useToast } from '../../../shared/components/common/Toast.jsx';
import useReservations from '../hooks/useReservations.js';
import useTables from '../hooks/useTables.js';
import { TABS, RESERVATIONS_STACK_SCREENS } from '../../../navigation/screenNames.js';

const formatDate = (date) =>
  date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const formatTime = (date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const GUEST_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

const CreateReservationScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const editingReservation = route.params?.reservation;
  const restaurantId = route.params?.restaurantId || editingReservation?.restaurantId;
  const restaurantName = route.params?.restaurantName || editingReservation?.restaurantName;
  const isEditing = !!editingReservation;

  const { control, handleSubmit } = useForm({
    defaultValues: { notes: editingReservation?.notes || '' }
  });

  const initialDate = editingReservation ? new Date(editingReservation.date) : new Date();
  const initialTime = (() => {
    const d = new Date(initialDate);
    if (editingReservation?.time) {
      const [h, m] = editingReservation.time.split(':');
      d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    } else {
      d.setHours(19, 0, 0, 0);
    }
    return d;
  })();

  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [guests, setGuests] = useState(editingReservation ? editingReservation.guests : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(editingReservation?.tableId || null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const { tables, loading: tablesLoading, error: tablesError, fetchTables } = useTables();
  const { createReservation, updateReservation, checkAvailability } = useReservations();

  useEffect(() => {
    fetchTables(restaurantId);
  }, [restaurantId, fetchTables]);

  const onDateChange = (event, selected) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) setDate(selected);
  };

  const onTimeChange = (event, selected) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selected) setTime(selected);
  };

  const handleCheckAvailability = async () => {
    if (!selectedTableId) {
      toast.show({ type: 'error', title: t('common.error'), message: t('reservations.tableRequired') });
      return;
    }
    setCheckingAvailability(true);
    try {
      const available = await checkAvailability({
        tableId: selectedTableId,
        date,
        time: formatTime(time),
        reservationId: editingReservation?.id
      });
      toast.show({
        type: available ? 'success' : 'info',
        title: available ? t('reservations.checkAvailability') : t('reservations.notAvailable')
      });
    } catch (err) {
      toast.show({ type: 'error', title: t('common.error'), message: err.response?.data?.message || t('reservations.notAvailable') });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const onSubmit = async ({ notes }) => {
    if (!selectedTableId) {
      toast.show({ type: 'error', title: t('common.error'), message: t('reservations.tableRequired') });
      return;
    }
    if (!guests) {
      toast.show({ type: 'error', title: t('common.error'), message: t('reservations.guestsRequired') });
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await updateReservation(editingReservation.id, {
          tableId: selectedTableId,
          date,
          time: formatTime(time),
          guests,
          notes
        });
        toast.show({ type: 'success', title: t('reservations.updateSuccess') });
        navigation.goBack();
      } else {
        const created = await createReservation({
          restaurantId,
          tableId: selectedTableId,
          date,
          time: formatTime(time),
          guests,
          notes
        });
        navigation.navigate(TABS.RESERVATIONS, {
          screen: RESERVATIONS_STACK_SCREENS.DETAIL,
          params: { reservationId: created.id, justCreated: true }
        });
      }
    } catch (err) {
      toast.show({
        type: 'error',
        title: t('common.error'),
        message: err.response?.data?.message || t(isEditing ? 'reservations.updateError' : 'reservations.createError')
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t(isEditing ? 'reservations.editTitle' : 'reservations.createTitle')}</Text>
      {!!restaurantName && <Text style={styles.subtitle}>{restaurantName}</Text>}

      <Card>
        <Text style={styles.label}>{t('reservations.date')}</Text>
        <TouchableOpacity style={styles.pickerField} onPress={() => setShowDatePicker(true)}>
          <MaterialIcons name="calendar-today" size={18} color={COLORS.textMuted} />
          <Text style={styles.pickerText}>{formatDate(date)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            minimumDate={new Date()}
            onChange={onDateChange}
          />
        )}

        <Text style={styles.label}>{t('reservations.time')}</Text>
        <TouchableOpacity style={styles.pickerField} onPress={() => setShowTimePicker(true)}>
          <MaterialIcons name="access-time" size={18} color={COLORS.textMuted} />
          <Text style={styles.pickerText}>{formatTime(time)}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            onChange={onTimeChange}
          />
        )}

        <Text style={styles.label}>{t('reservations.numberOfGuests')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.guestsScroll}>
          {GUEST_OPTIONS.map((n) => (
            <Chip key={n} label={String(n)} selected={guests === n} onPress={() => setGuests(n)} />
          ))}
        </ScrollView>
      </Card>

      <Card>
        <Text style={styles.label}>{t('reservations.selectTable')}</Text>
        {tablesLoading && <ActivityIndicator color={COLORS.primary} style={styles.tablesLoading} />}
        {!tablesLoading && tablesError && <EmptyState icon="error-outline" message={t('reservations.loadTablesError')} />}
        {!tablesLoading && !tablesError && tables.length === 0 && (
          <EmptyState icon="event-seat" message={t('reservations.noTables')} />
        )}
        {!tablesLoading && tables.length > 0 && (
          <View style={styles.tableGrid}>
            {tables.map((table) => (
              <Chip
                key={table.id}
                label={`${t('reservations.table', { number: table.number })} · ${table.capacity}`}
                selected={selectedTableId === table.id}
                onPress={() => setSelectedTableId(table.id)}
              />
            ))}
          </View>
        )}
        {selectedTableId && (
          <Button
            title={t('reservations.checkAvailability')}
            variant="secondary"
            onPress={handleCheckAvailability}
            loading={checkingAvailability}
            style={styles.checkButton}
          />
        )}
      </Card>

      <Card>
        <Input
          label={t('reservations.notes')}
          placeholder={t('reservations.notesPlaceholder')}
          control={control}
          name="notes"
          multiline
          numberOfLines={3}
        />
      </Card>

      <Button
        title={t(isEditing ? 'reservations.save' : 'reservations.confirm')}
        onPress={handleSubmit(onSubmit)}
        loading={submitting}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    flexGrow: 1
  },
  title: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.text
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg
  },
  label: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.sm
  },
  pickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm
  },
  pickerText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
    marginLeft: SPACING.sm
  },
  guestsScroll: {
    marginBottom: SPACING.sm
  },
  tablesLoading: {
    marginVertical: SPACING.md
  },
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm
  },
  checkButton: {
    marginTop: SPACING.md
  },
  submitButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl
  }
});

export default CreateReservationScreen;
