
import { subMinutes, subHours, subDays } from 'date-fns';

const now = new Date();

export type CallRecord = {
  id: string;
  contactId: string;
  name: string;
  avatar: string;
  timestamp: Date;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  status: 'online' | 'offline';
};

// This file is now deprecated and will be removed in a future step.
// All data is now being fetched from Firestore.
export const callHistory: CallRecord[] = [];
