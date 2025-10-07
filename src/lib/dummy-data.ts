
import type { Contact } from './types';
import { subMinutes, subHours, subDays } from 'date-fns';

const now = new Date();

// This file is now deprecated and will be removed in a future step.
// All data is now being fetched from Firestore.
export const contacts: Contact[] = [];
