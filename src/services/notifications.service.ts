import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_PATHS } from '../config/api';
import { authorizedRequest } from './http';

const PUSH_TOKEN_KEY = 'expoPushToken';

export type NotificationData = {
  type?: 'message' | 'match';
  userId?: string;
};

// Push only fires when the user has no live socket, so a notification arriving
// in the foreground means the connection is down - worth showing.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const ensureAndroidChannel = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  // Android will not show a heads-up notification without a channel.
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Messages and matches',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF5E62',
  });
};

/**
 * Asks for permission, gets this device's Expo token and registers it with the
 * backend. Returns null when notifications are unavailable (permission denied,
 * simulator, or no EAS projectId configured) - never throws, because failing to
 * register must not block login.
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    await ensureAndroidChannel();

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;

    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }

    if (status !== 'granted') {
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn(
        '[push] No EAS projectId in app.json (extra.eas.projectId). Run `eas init` - push tokens cannot be issued without it.'
      );
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

    await authorizedRequest(API_PATHS.pushToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: Platform.OS }),
    });

    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

    return token;
  } catch (error) {
    // Simulators have no push service, and a denied prompt is a normal outcome.
    console.log('[push] Registration skipped:', error instanceof Error ? error.message : error);
    return null;
  }
};

/**
 * Call before clearing the session, while the access token is still valid, or
 * the device keeps receiving the previous account's notifications.
 */
export const unregisterPushNotifications = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);

    if (!token) {
      return;
    }

    await authorizedRequest(API_PATHS.pushToken, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.log('[push] Unregister failed:', error instanceof Error ? error.message : error);
  } finally {
    await AsyncStorage.removeItem(PUSH_TOKEN_KEY).catch(() => undefined);
  }
};

/** Fires when the user taps a notification, including from a cold start. */
export const addNotificationTapListener = (
  handler: (data: NotificationData) => void
): (() => void) => {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    handler((response.notification.request.content.data || {}) as NotificationData);
  });

  return () => subscription.remove();
};

export const clearBadge = async (): Promise<void> => {
  await Notifications.setBadgeCountAsync(0).catch(() => undefined);
};
