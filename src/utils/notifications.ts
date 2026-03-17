// ─────────────────────────────────────────
//  Notifications — Expo + Firebase FCM
// ─────────────────────────────────────────

import * as Notifications from 'expo-notifications';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

// ── Register device for push notifications ──

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Save token to Firestore so partner can send notifications
  await updateDoc(doc(db, 'users', userId), {
    expoPushToken: token,
  });

  return token;
}

// ── Send a push notification to partner ──
// In production, this should go through a Cloud Function
// to keep the Expo push token server-side only.
// For MVP, we read the token and use Expo's push API.

export async function schedulePartnerNotification({
  partnerId,
  title,
  body,
}: {
  partnerId: string;
  title:     string;
  body:      string;
}) {
  try {
    const partnerDoc = await getDoc(doc(db, 'users', partnerId));
    const token = partnerDoc.data()?.expoPushToken;
    if (!token) return;

    // Send via Expo Push API
    await fetch('https://exp.host/--/api/v2/push/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to:    token,
        title,
        body,
        sound: 'default',
        data:  { partnerId },
      }),
    });
  } catch (err) {
    console.error('Failed to send push notification:', err);
  }
}

// ── Schedule a local reminder notification ──

export async function scheduleLocalReminder({
  id,
  title,
  body,
  triggerDate,
}: {
  id:          string;
  title:       string;
  body?:       string;
  triggerDate: Date;
}): Promise<string> {
  // Cancel any existing notification for this reminder
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});

  const notifId = await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title,
      body:  body ?? '',
      sound: 'default',
      data:  { reminderId: id },
    },
    trigger: {
      date: triggerDate,
    },
  });

  return notifId;
}

export async function cancelReminder(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}
