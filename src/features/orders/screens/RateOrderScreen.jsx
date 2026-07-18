import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/constants/theme.js';
import { Card, StarRating } from '../../../shared/components/common/Common.jsx';
import Input from '../../../shared/components/common/Input.jsx';
import Button from '../../../shared/components/common/Button.jsx';
import { useToast } from '../../../shared/components/common/Toast.jsx';
import restaurantClient from '../../../shared/api/restaurantClient.js';

const SUB_RATING_KEYS = ['food', 'service', 'ambiance', 'value'];

const RateOrderScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { orderId, restaurantId } = route.params;
  const { control, handleSubmit } = useForm({ defaultValues: { comment: '' } });
  const [rating, setRating] = useState(0);
  const [subRatings, setSubRatings] = useState({ food: 0, service: 0, ambiance: 0, value: 0 });
  const [submitting, setSubmitting] = useState(false);

  const handleSubRatingChange = (key, value) => {
    setSubRatings((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async ({ comment }) => {
    if (rating === 0) {
      toast.show({ type: 'error', title: t('common.error'), message: t('rating.overall') });
      return;
    }

    setSubmitting(true);
    try {
      await restaurantClient.post('/reviews', {
        orderId,
        restaurantId,
        rating,
        comment,
        subRatings
      });
      toast.show({ type: 'success', title: t('rating.success') });
      navigation.goBack();
    } catch {
      toast.show({ type: 'error', title: t('common.error'), message: t('rating.error') });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('rating.title')}</Text>

      <Card style={styles.overallCard}>
        <Text style={styles.label}>{t('rating.overall')}</Text>
        <StarRating rating={rating} onChange={setRating} size={32} />
      </Card>

      <Card>
        {SUB_RATING_KEYS.map((key) => (
          <View key={key} style={styles.subRow}>
            <Text style={styles.subLabel}>{t(`rating.${key}`)}</Text>
            <StarRating rating={subRatings[key]} onChange={(value) => handleSubRatingChange(key, value)} size={22} />
          </View>
        ))}
      </Card>

      <Card>
        <Input
          label={t('rating.comment')}
          placeholder={t('rating.commentPlaceholder')}
          control={control}
          name="comment"
          multiline
          numberOfLines={4}
        />
      </Card>

      <Button title={t('rating.submit')} onPress={handleSubmit(onSubmit)} loading={submitting} style={styles.submitButton} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    backgroundColor: COLORS.background,
    flexGrow: 1
  },
  title: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.text,
    marginBottom: SPACING.lg
  },
  overallCard: {
    alignItems: 'center'
  },
  label: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.md
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  subLabel: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.text
  },
  submitButton: {
    marginTop: SPACING.md
  }
});

export default RateOrderScreen;
