import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../shared/constants/theme.js';
import { Card } from '../../../shared/components/common/Common.jsx';
import AppHeader from '../../../shared/components/common/AppHeader.jsx';
import Input from '../../../shared/components/common/Input.jsx';
import Button from '../../../shared/components/common/Button.jsx';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog.jsx';
import { useToast } from '../../../shared/components/common/Toast.jsx';
import authClient from '../../../shared/api/authClient.js';
import useAuthStore from '../../../shared/store/authStore.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import useRecentlyVisited from '../../home/hooks/useRecentlyVisited.js';
import i18n from '../../../shared/i18n/index.js';
import { ROOT_SCREENS, TABS, HOME_STACK_SCREENS } from '../../../navigation/screenNames.js';

const ADDRESS_KEY = 'kinaleat:default-delivery-address';

const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { user, updateUser } = useAuthStore();
  const { handleLogout: revokeAndLogout } = useAuth();
  const recentlyVisited = useRecentlyVisited();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteFinalConfirmVisible, setDeleteFinalConfirmVisible] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { name: '', surname: '', phone: '' }
  });

  const {
    control: addressControl,
    handleSubmit: handleAddressSubmit,
    reset: resetAddress
  } = useForm({ defaultValues: { street: '', city: '' } });

  const fetchProfile = async () => {
    try {
      const response = await authClient.get('/profile');
      const data = response.data?.data || response.data;
      updateUser(data);
    } catch {
      toast.show({ type: 'error', title: t('common.error'), message: t('profile.loadError') });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        surname: user.surname || '',
        phone: user.phone || ''
      });
    }
  }, [user, reset]);

  useEffect(() => {
    const loadAddress = async () => {
      try {
        const raw = await AsyncStorage.getItem(ADDRESS_KEY);
        if (raw) resetAddress(JSON.parse(raw));
      } catch {
        // ignore storage errors
      }
    };
    loadAddress();
  }, [resetAddress]);

  const onSubmit = async ({ name, surname, phone }) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('Name', name);
      formData.append('Surname', surname);
      formData.append('Phone', phone);

      const response = await authClient.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = response.data?.data || response.data;
      updateUser(data);
      setIsEditing(false);
      toast.show({ type: 'success', message: t('profile.updateSuccess') });
    } catch {
      toast.show({ type: 'error', title: t('common.error'), message: t('profile.updateError') });
    } finally {
      setSaving(false);
    }
  };

  const onSaveAddress = async ({ street, city }) => {
    setSavingAddress(true);
    try {
      await AsyncStorage.setItem(ADDRESS_KEY, JSON.stringify({ street, city }));
      toast.show({ type: 'success', message: t('profile.addressSaved') });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    setLogoutConfirmVisible(true);
  };

  const confirmLogout = () => {
    setLogoutConfirmVisible(false);
    revokeAndLogout();
  };

  const handleDeleteAccount = () => {
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = () => {
    setDeleteConfirmVisible(false);
    setDeleteFinalConfirmVisible(true);
  };

  const confirmDeleteFinal = async () => {
    setDeleteFinalConfirmVisible(false);
    setDeleting(true);
    try {
      await authClient.delete('/profile');
      await revokeAndLogout();
    } catch {
      toast.show({ type: 'error', title: t('common.error'), message: t('profile.deleteError') });
    } finally {
      setDeleting(false);
    }
  };

  const avatarUri = user?.profilePicture && user.profilePicture.startsWith('http')
    ? user.profilePicture
    : null;

  const goToRestaurant = (restaurant) => {
    navigation.navigate(ROOT_SCREENS.MAIN_TABS, {
      screen: TABS.HOME,
      params: {
        screen: HOME_STACK_SCREENS.RESTAURANT_DETAIL,
        params: { restaurantId: restaurant.id, restaurantName: restaurant.name }
      }
    });
  };

  return (
    <View style={styles.screen}>
      <AppHeader />
      <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
        <Text style={styles.backLabel}>{t('common.back')}</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.avatarContainer}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.defaultAvatar}>
            <Text style={styles.avatarInitial}>
              {(user?.name || user?.username || 'U')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.userName}>{user?.name ? `${user.name} ${user.surname || ''}`.trim() : user?.username || ''}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>

        <Input label={t('profile.name')} control={control} name="name" disabled={!isEditing} />
        <Input label={t('profile.surname')} control={control} name="surname" disabled={!isEditing} />
        <Input label={t('profile.phone')} control={control} name="phone" keyboardType="phone-pad" disabled={!isEditing} />

        {isEditing ? (
          <View style={styles.buttonRow}>
            <Button
              title={t('common.cancel')}
              variant="secondary"
              onPress={() => {
                setIsEditing(false);
                reset({ name: user?.name || '', surname: user?.surname || '', phone: user?.phone || '' });
              }}
              style={styles.cancelButton}
            />
            <Button
              title={t('profile.save')}
              onPress={handleSubmit(onSubmit)}
              loading={saving}
              style={styles.saveButton}
            />
          </View>
        ) : (
          <Button title={t('profile.edit')} onPress={() => setIsEditing(true)} style={styles.editButton} />
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>{t('profile.deliveryAddress')}</Text>
        <Input label={t('profile.street')} control={addressControl} name="street" />
        <Input label={t('profile.city')} control={addressControl} name="city" />
        <Button
          title={t('profile.saveAddress')}
          variant="secondary"
          onPress={handleAddressSubmit(onSaveAddress)}
          loading={savingAddress}
          style={styles.editButton}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
        <View style={styles.languageRow}>
          <TouchableOpacity
            style={[styles.languageOption, i18n.language === 'es' && styles.languageOptionActive]}
            onPress={() => handleLanguageChange('es')}
          >
            <Text style={[styles.languageText, i18n.language === 'es' && styles.languageTextActive]}>
              {t('profile.spanish')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.languageOption, i18n.language === 'en' && styles.languageOptionActive]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text style={[styles.languageText, i18n.language === 'en' && styles.languageTextActive]}>
              {t('profile.english')}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {recentlyVisited.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>{t('profile.recentlyVisited')}</Text>
          <FlatList
            data={recentlyVisited}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentRow}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => goToRestaurant(item)} style={styles.recentCard} activeOpacity={0.85}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.recentImage} />
                ) : (
                  <View style={[styles.recentImage, styles.imagePlaceholder]}>
                    <MaterialIcons name="restaurant" size={22} color={COLORS.textMuted} />
                  </View>
                )}
                <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </Card>
      )}

      <Button title={t('common.logout')} variant="secondary" onPress={handleLogout} style={styles.actionButton} />
      <Button
        title={t('profile.deleteAccount')}
        variant="secondary"
        onPress={handleDeleteAccount}
        loading={deleting}
        style={[styles.actionButton, styles.deleteButton]}
      />

      <ConfirmDialog
        visible={logoutConfirmVisible}
        title={t('profile.logoutConfirmTitle')}
        message={t('profile.logoutConfirmMessage')}
        destructive
        onConfirm={confirmLogout}
        onCancel={() => setLogoutConfirmVisible(false)}
      />

      <ConfirmDialog
        visible={deleteConfirmVisible}
        title={t('profile.deleteConfirmTitle')}
        message={t('profile.deleteConfirmMessage')}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmVisible(false)}
      />

      <ConfirmDialog
        visible={deleteFinalConfirmVisible}
        title={t('profile.deleteFinalConfirmTitle')}
        message={t('profile.deleteFinalConfirmMessage')}
        destructive
        onConfirm={confirmDeleteFinal}
        onCancel={() => setDeleteFinalConfirmVisible(false)}
      />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm
  },
  backLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text
  },
  content: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    flexGrow: 1
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md
  },
  defaultAvatar: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  avatarInitial: {
    ...TYPOGRAPHY.displayLg,
    color: COLORS.onPrimary
  },
  userName: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.text
  },
  userEmail: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textMuted
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.md
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm
  },
  saveButton: {
    flex: 1,
    marginLeft: SPACING.sm
  },
  editButton: {
    marginTop: SPACING.sm
  },
  languageRow: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  languageOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center'
  },
  languageOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  languageText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.text
  },
  languageTextActive: {
    color: COLORS.onPrimary
  },
  recentRow: {
    paddingBottom: SPACING.xs
  },
  recentCard: {
    width: 96,
    marginRight: SPACING.md
  },
  recentImage: {
    width: 96,
    height: 72,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs
  },
  recentName: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.text,
    textTransform: 'none'
  },
  imagePlaceholder: {
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionButton: {
    marginTop: SPACING.md
  },
  deleteButton: {
    marginBottom: SPACING.xl
  }
});

export default ProfileScreen;
