// src/shared/components/common/ConfirmDialog.jsx
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme.js';
import Button from './Button.jsx';

const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel
}) => {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <Button
              title={cancelLabel || t('common.cancel')}
              variant="secondary"
              onPress={onCancel}
              style={styles.actionButton}
            />
            <Button
              title={confirmLabel || t('common.confirm')}
              variant="primary"
              onPress={onConfirm}
              style={[styles.actionButton, destructive && styles.destructiveButton]}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 16, 8, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg
  },
  sheet: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.lg
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  message: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.lg
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  actionButton: {
    flex: 1
  },
  destructiveButton: {
    backgroundColor: COLORS.error
  }
});

ConfirmDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  destructive: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default ConfirmDialog;
