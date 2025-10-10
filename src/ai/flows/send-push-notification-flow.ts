
'use server';
/**
 * @fileOverview A flow for sending a push notification to a user via FCM.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getMessaging, MulticastMessage, BatchResponse } from 'firebase-admin/messaging';

// Ensure Firebase Admin is initialized.
// In a Google Cloud environment, this will use Application Default Credentials.
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
    let tokens: string[] = [];
    let response: BatchResponse | null = null;

    try {
      const subscriptionsRef = db.collection('users').doc(userId).collection('subscriptions');
      const snapshot = await subscriptionsRef.get();

      if (snapshot.empty) {
        console.log('No FCM tokens found for user:', userId);
        return { successCount: 0, failureCount: 0 };
      }

      tokens = snapshot.docs.map(doc => doc.id);
      
      if (tokens.length === 0) {
        return { successCount: 0, failureCount: 0 };
      }
      
      const message: MulticastMessage = {
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

      response = await messaging.sendEachForMulticast(message);
      
      console.log(`${response.successCount} messages were sent successfully`);

      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
            // Optional: Handle device token cleanup for certain errors
            if (resp.error.code === 'messaging/registration-token-not-registered') {
              subscriptionsRef.doc(tokens[idx]).delete();
            }
          }
        });
        console.log("List of failed tokens:", failedTokens);
      }

      return { successCount: response.successCount, failureCount: response.failureCount };

    } catch (error) {
      console.error('Failed to send push notifications:', error);
      const failureCount = response ? response.failureCount : tokens.length;
      return { successCount: 0, failureCount: failureCount > 0 ? failureCount : tokens.length };
    }
  }
);
