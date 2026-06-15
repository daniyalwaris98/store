import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  orderId?: string;
  type: 'new_order' | 'order_update';
  orderNumber?: string;
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return false;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2196F3',
      sound: 'default',
    });
  }

  return true;
}

// Get Expo push token
export async function getPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.log('Project ID not configured');
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return token;
  } catch (error) {
    console.log('Failed to get push token:', error);
    return null;
  }
}

// Add notification received listener (foreground)
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

// Add notification response listener (user taps notification)
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(response => {
    callback(response);
  });
}

// Get notification data from response
export function getNotificationData(
  response: Notifications.NotificationResponse
): NotificationData | null {
  const data = response.notification.request.content.data as unknown as NotificationData | null;
  return data;
}

// Remove all delivered notifications
export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

// Set badge count
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// Get current badge count
export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}