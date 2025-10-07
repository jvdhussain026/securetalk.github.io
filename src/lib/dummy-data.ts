
import type { Contact } from './types';
import { subMinutes, subHours, subDays } from 'date-fns';

const now = new Date();

// This file is now deprecated and will be removed in a future step.
// All data is now being fetched from Firestore.
export const contacts: Contact[] = [];

// Sample last messages for demo contacts
export const lastMessages = {
    'support-javed': {
        text: "Welcome to Secure Talk! Let me know if you have any questions.",
        timestamp: subMinutes(now, 2),
        isSender: false,
    },
    'demo-sarah': {
        text: "Hey! Just trying out this new app. It looks cool!",
        timestamp: subHours(now, 1),
        isSender: false,
    }
}
