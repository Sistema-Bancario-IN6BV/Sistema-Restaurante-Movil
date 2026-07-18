import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { COLORS, RADIUS, SPACING } from '../../../shared/constants/theme.js';

const CIRCLE = 36;

const STEP_ICONS = ['soup-kitchen', 'check-circle', 'delivery-dining', 'home'];
const STEP_LABEL_KEYS = ['tracking.stepper.preparing', 'tracking.stepper.ready', 'tracking.stepper.onTheWay', 'tracking.stepper.delivered'];

export const STATUS_TO_STEP = {
  PENDING: -1,
  PREPARING: 0,
  READY: 2,
  DELIVERED: 3,
  CANCELLED: -1
};

export const OrderStepper = ({ status }) => {
  const { t } = useTranslation();
  const currentStep = STATUS_TO_STEP[status] ?? -1;

  return (
    <View style={styles.stepperWrap}>
      <View style={styles.circlesRow}>
        {STEP_ICONS.map((icon, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          const filled = done || active;
          const isLast = i === STEP_ICONS.length - 1;
          return (
            <React.Fragment key={i}>
              <View style={[styles.circle, filled && styles.circleFilled]}>
                <MaterialIcons
                  name={done ? 'check' : icon}
                  size={16}
                  color={filled ? COLORS.onPrimary : COLORS.textMuted}
                />
              </View>
              {!isLast && <View style={[styles.line, done && styles.lineActive]} />}
            </React.Fragment>
          );
        })}
      </View>

      <View style={styles.labelsRow}>
        {STEP_LABEL_KEYS.map((labelKey, i) => {
          const isLast = i === STEP_LABEL_KEYS.length - 1;
          const isActive = i === currentStep || i < currentStep;
          return (
            <React.Fragment key={i}>
              <View style={styles.labelWrap}>
                <Text
                  style={[
                    styles.stepLabel,
                    isActive && styles.stepLabelActive,
                    i === currentStep && styles.stepLabelCurrent
                  ]}
                  numberOfLines={2}
                >
                  {t(labelKey)}
                </Text>
              </View>
              {!isLast && <View style={styles.labelSpacer} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

OrderStepper.propTypes = {
  status: PropTypes.string
};

const styles = StyleSheet.create({
  stepperWrap: {},
  circlesRow: { flexDirection: 'row', alignItems: 'center' },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleFilled: { backgroundColor: COLORS.primary },
  line: { flex: 1, height: 2, backgroundColor: COLORS.border },
  lineActive: { backgroundColor: COLORS.primary },
  labelsRow: { flexDirection: 'row', marginTop: SPACING.sm },
  labelWrap: { width: CIRCLE, alignItems: 'center' },
  labelSpacer: { flex: 1 },
  stepLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 13
  },
  stepLabelActive: { color: COLORS.text },
  stepLabelCurrent: { fontWeight: '700', color: COLORS.primary }
});

export default OrderStepper;
