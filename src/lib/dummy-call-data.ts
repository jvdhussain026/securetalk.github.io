
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

// This file is for demo purposes.
export const callHistory: CallRecord[] = [
    {
        id: '1',
        contactId: 'javed-hussain',
        name: 'Javed Hussain',
        avatar: 'https://picsum.photos/seed/user/200/200',
        timestamp: subMinutes(now, 5),
        type: 'video',
        direction: 'missed',
        status: 'online',
    },
    {
        id: '2',
        contactId: 'sarah-miller',
        name: 'Sarah Miller',
        avatar: 'https://picsum.photos/seed/user2/200/200',
        timestamp: subHours(now, 2),
        type: 'voice',
        direction: 'outgoing',
        status: 'offline',
    },
     {
        id: '3',
        contactId: 'javed-hussain',
        name: 'Javed Hussain',
        avatar: 'https://picsum.photos/seed/user/200/200',
        timestamp: subDays(now, 1),
        type: 'voice',
        direction: 'incoming',
        status: 'online',
    },
];
