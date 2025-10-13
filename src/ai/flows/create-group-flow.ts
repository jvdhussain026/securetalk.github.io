
'use server';
/**
 * @fileOverview A flow for creating a new group chat.
 *
 * - createGroup - A function that handles creating a group and adding it to the user's contacts.
 * - CreateGroupInput - The input type for the createGroup function.
 * - CreateGroupOutput - The return type for the createGroup function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

// Ensure Firebase Admin is initialized.
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

const CreateGroupInputSchema = z.object({
  name: z.string().min(1, { message: "Group name cannot be empty." }),
  description: z.string().optional(),
  avatar: z.string().optional(),
  ownerId: z.string(),
});
export type CreateGroupInput = z.infer<typeof CreateGroupInputSchema>;

const CreateGroupOutputSchema = z.object({
  groupId: z.string().optional(),
  error: z.string().optional(),
});
export type CreateGroupOutput = z.infer<typeof CreateGroupOutputSchema>;


export async function createGroup(input: CreateGroupInput): Promise<CreateGroupOutput> {
  return createGroupFlow(input);
}


const createGroupFlow = ai.defineFlow(
  {
    name: 'createGroupFlow',
    inputSchema: CreateGroupInputSchema,
    outputSchema: CreateGroupOutputSchema,
  },
  async (input) => {
    try {
      const { name, description, avatar, ownerId } = input;
      
      const newGroupRef = db.collection('groups').doc();
      const groupId = newGroupRef.id;

      const groupData = {
        id: groupId,
        name,
        description: description || '',
        avatar: avatar || '',
        ownerId,
        participants: {
          [ownerId]: true,
        },
        createdAt: Timestamp.now(),
      };
      
      const userContactRef = db.collection('users').doc(ownerId).collection('contacts').doc(groupId);
      
      const userContactData = {
        id: groupId,
        name,
        avatar: avatar || '',
        isGroup: true,
        lastMessageTimestamp: Timestamp.now(),
      };

      // Use a batch to write both documents atomically
      const batch = db.batch();
      batch.set(newGroupRef, groupData);
      batch.set(userContactRef, userContactData, { merge: true });
      
      await batch.commit();

      return { groupId };

    } catch (error: any) {
      console.error("Error in createGroupFlow: ", error);
      return { error: error.message || "An unexpected error occurred." };
    }
  }
);
