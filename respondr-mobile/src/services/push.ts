import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { apiAuthRequest } from './api';
import { env } from '../config/env';

const DEVICE_TOKEN_KEY = 'respondr.device_token';

export type PushRegistrationResult =
  | { registered: true; token: string }
  | {
      registered: false;
      reason: 'permission_denied' | 'missing_project_id' | 'token_unavailable' | 'register_failed';
      message?: string;
    };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getProjectId() {
  const easFromConfig =
    Constants?.expoConfig?.extra &&
    typeof Constants.expoConfig.extra === 'object' &&
    'eas' in Constants.expoConfig.extra &&
    (Constants.expoConfig.extra.eas as { projectId?: string })?.projectId;

  return env.easProjectId || easFromConfig || '';
}

export async function ensurePushRegistration(): Promise<PushRegistrationResult> {
  const settings = await Notifications.getPermissionsAsync();
  let finalStatus = settings.status;

  if (finalStatus !== 'granted') {
    const request = await Notifications.requestPermissionsAsync();
    finalStatus = request.status;
  }

  if (finalStatus !== 'granted') {
    return { registered: false, reason: 'permission_denied' as const };
  }

  const projectId = getProjectId();
  if (!projectId) {
    return { registered: false, reason: 'missing_project_id' as const };
  }

  const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  if (!pushToken) {
    return { registered: false, reason: 'token_unavailable' as const };
  }

  try {
    await apiAuthRequest('/devices/register', {
      method: 'POST',
      body: JSON.stringify({ fcm_token: pushToken }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to register device token';
    return { registered: false, reason: 'register_failed', message };
  }

  await AsyncStorage.setItem(DEVICE_TOKEN_KEY, pushToken);
  return { registered: true, token: pushToken as string };
}

export async function unregisterStoredPushToken() {
  const token = await AsyncStorage.getItem(DEVICE_TOKEN_KEY);
  if (!token) return;

  try {
    await apiAuthRequest(`/devices/${encodeURIComponent(token)}`, { method: 'DELETE' });
  } finally {
    await AsyncStorage.removeItem(DEVICE_TOKEN_KEY);
  }
}
