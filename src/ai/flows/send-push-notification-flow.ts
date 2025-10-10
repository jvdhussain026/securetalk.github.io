
'use server';
/**
 * @fileOverview A flow for sending a push notification to a user via FCM.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Ensure Firebase Admin is initialized
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();
const messaging = getMessaging();

const PushPayloadSchema = z.object({
    title: z.string(),
    body: z.string(),
    icon: z.string().optional(),
    badge: z.string().optional(),
    tag: z.string().optional(),
});

const SendPushNotificationInputSchema = z.object({
  userId: z.string().describe('The UID of the user to send the notification to.'),
  payload: PushPayloadSchema.describe('The content of the push notification.'),
});

export type SendPushNotificationInput = z.infer<typeof SendPushNotificationInputSchema>;

const SendPushNotificationOutputSchema = z.object({
  successCount: z.number(),
  failureCount: z.number(),
});
export type SendPushNotificationOutput = z.infer<typeof SendPushNotificationOutputSchema>;


export async function sendPushNotification(input: SendPushNotificationInput): Promise<SendPushNotificationOutput> {
  return sendPushNotificationFlow(input);
}


const sendPushNotificationFlow = ai.defineFlow(
  {
    name: 'sendPushNotificationFlow',
    inputSchema: SendPushNotificationInputSchema,
    outputSchema: SendPushNotificationOutputSchema,
  },
  async ({ userId, payload }) => {

    try {
      const subscriptionsRef = db.collection('users').doc(userId).collection('subscriptions');
      const snapshot = await subscriptionsRef.get();

      if (snapshot.empty) {
        console.log('No FCM tokens found for user:', userId);
        return { successCount: 0, failureCount: 0 };
      }

      const tokens = snapshot.docs.map(doc => doc.id);
      
      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        webpush: {
          notification: {
            icon: payload.icon || '/icon-192x192.png',
            badge: payload.badge,
            tag: payload.tag,
          }
        },
        tokens: tokens,
      };

      const response = await messaging.sendEachForMulticast(message);
      
      console.log(`${response.successCount} messages were sent successfully`);

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
            // Optional: Handle device token cleanup for certain errors
            if (resp.error.code === 'messaging/registration-token-not-registered') {
              subscriptionsRef.doc(tokens[idx]).delete();
            }
          }
        });
      }

      return { successCount: response.successCount, failureCount: response.failureCount };

    } catch (error) {
      console.error('Failed to send push notifications:', error);
      return { successCount: 0, failureCount: 0 };
    }
  }
);
