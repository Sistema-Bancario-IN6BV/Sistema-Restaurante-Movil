import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import useNotificationsStore from '../store/notificationsStore.js';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT
    });
  }
};

export const notifyNow = async (title, body, type = 'system') => {
  useNotificationsStore.getState().addNotification(title, body, type);
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null
  });
};

export const scheduleReminder = async (title, body, date, type = 'system') => {
  if (date.getTime() <= Date.now()) return null;

  useNotificationsStore.getState().addNotification(title, body, type);

  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date }
  });
};
