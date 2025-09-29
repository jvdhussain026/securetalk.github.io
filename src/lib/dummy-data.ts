

import type { Contact } from './types';
import { subMinutes, subHours, subDays } from 'date-fns';

const now = new Date();

export const contacts: Contact[] = [
  {
    id: '1',
    name: 'Zehra',
    avatar: 'https://picsum.photos/seed/avatar1/200/200',
    messages: [
      { id: 'm1', text: 'See you soon!', timestamp: subHours(now, 1), isSender: false },
    ],
  },
  {
    id: '2',
    name: 'Rehan',
    avatar: 'https://picsum.photos/seed/avatar2/200/200',
    messages: [
      { id: 'm2', text: 'I\'m on my way', timestamp: subHours(now, 1) , isSender: false },
    ],
  },
  {
    id: '3',
    name: 'Kaish',
    avatar: 'https://picsum.photos/seed/avatar3/200/200',
    messages: [
      { id: 'm3', text: 'Let\'s meet at the usual place', timestamp: subHours(now, 2), isSender: false },
    ],
  },
    {
    id: '4',
    name: 'Aurangjeb',
    avatar: 'https://picsum.photos/seed/avatar4/200/200',
    messages: [
      { id: 'm4', text: 'I\'ll be there in 10 minutes', timestamp: subHours(now, 3), isSender: false },
    ],
  },
  {
    id: '5',
    name: 'Ava',
    avatar: 'https://picsum.photos/seed/avatar5/200/200',
    messages: [
        { id: 'm5', text: 'Did you see the new movie?', timestamp: subDays(now, 1), isSender: true },
    ],
  },
  {
    id: '6',
    name: 'Liam',
    avatar: 'https://picsum.photos/seed/avatar6/200/200',
    messages: [
      { id: 'm6', text: 'Thanks for your help yesterday', timestamp: subDays(now, 1), isSender: false },
    ],
  },
    {
    id: '7',
    name: 'Emma',
    avatar: 'https://picsum.photos/seed/avatar7/200/200',
    messages: [
      { id: 'm7', text: 'Can we reschedule?', timestamp: subDays(now, 2), isSender: true },
    ],
  },
  {
    id: 'support-javed',
    name: 'Javed Hussain (Support)',
    avatar: 'https://picsum.photos/seed/user/200/200',
    messages: [
      { id: 'sm1', text: 'Hello! How can I help you today?', timestamp: subMinutes(now, 5), isSender: false },
    ],
    verified: true,
  },
];

    