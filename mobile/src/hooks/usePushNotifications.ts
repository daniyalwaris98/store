import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import * as Notifications from 'expo-notifications';
import { getNotificationData } from '../services/notifications';
import Constants from 'expo-constants';

export function usePushNotifications() {
  const { token, settings, updateSettings } = useAuth();
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const handleNotification = useCallback((notification: Notifications.Notification) => {
    console.log('Foreground notification:', notification);
  }, []);

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = getNotificationData(response);

      if (data?.type === 'new_order' && data.orderId) {
        router.push(`/orders/${data.orderId}`);
      }
    },
    [router]
  );

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(handleNotification);
    responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [handleNotification, handleNotificationResponse]);

  const registerPushToken = useCallback(async () => {
    if (!token || !settings.adminEmail) return;

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || 'efdd2e96-d399-4618-8cd3-c2608e7f6278';

      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      await apiService.registerPushToken(
        pushToken.data,
        settings.adminEmail,
        token
      );

      await updateSettings({ pushNotificationsEnabled: true });
    } catch (error) {
      console.log('Failed to register push token:', error);
    }
  }, [token, settings.adminEmail, updateSettings]);

  return {
    registerPushToken,
  };
}