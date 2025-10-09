
'use server';
/**
 * @fileOverview A flow for sending a push notification to a user.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import webpush from 'web-push';

// Ensure Firebase Admin is initialized
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

// Safely configure web-push
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey && vapidPrivateKey !== 'your_private_key_here') {
  try {
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      vapidPublicKey,
      vapidPrivateKey
    );
  } catch (error) {
    console.error("Error setting VAPID details, likely due to invalid keys:", error);
  }
}

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
  success: z.boolean(),
  results: z.array(z.object({
    subscription: z.string(),
    success: z.boolean(),
    error: z.string().optional(),
  })),
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
    if (!vapidPublicKey || !vapidPrivateKey || vapidPrivateKey === 'your_private_key_here') {
        console.error("VAPID keys not configured. Skipping push notification. Please run 'npm run generate-vapid-keys' and update your .env file.");
        return { success: false, results: [] };
    }

    try {
      const subscriptionsRef = db.collection('users').doc(userId).collection('subscriptions');
      const snapshot = await subscriptionsRef.get();

      if (snapshot.empty) {
        console.log('No push subscriptions found for user:', userId);
        return { success: true, results: [] };
      }

      const notificationPayload = JSON.stringify(payload);
      
      const sendPromises = snapshot.docs.map(doc => {
        const subscription = doc.data();
        return webpush.sendNotification(subscription as webpush.PushSubscription, notificationPayload)
            .then(response => ({ subscription: subscription.endpoint, success: true }))
            .catch(error => {
                console.error('Error sending push notification:', error.body);
                // Optionally handle expired subscriptions by deleting them
                if (error.statusCode === 410) {
                    doc.ref.delete();
                }
                return { subscription: subscription.endpoint, success: false, error: error.body };
            });
      });

      const results = await Promise.all(sendPromises);
      const isOverallSuccess = results.every(r => r.success);

      return { success: isOverallSuccess, results };

    } catch (error) {
      console.error('Failed to send push notifications:', error);
      return { success: false, results: [] };
    }
  }
);
