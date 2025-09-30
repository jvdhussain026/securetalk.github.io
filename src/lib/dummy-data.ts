

import type { Contact } from './types';
import { subMinutes, subHours, subDays } from 'date-fns';

const now = new Date();

export const contacts: Contact[] = [
  {
    id: '1',
    name: 'Zehra',
    avatar: 'https://picsum.photos/seed/avatar1/200/200',
    messages: [
      { id: 'm1', text: 'آپ جلد ہی ملیں گے', timestamp: subHours(now, 1), isSender: false },
    ],
  },
  {
    id: '2',
    name: 'Rehan',
    avatar: 'https://picsum.photos/seed/avatar2/200/200',
    messages: [
      { id: 'm2', text: 'मैं रास्ते में हूँ', timestamp: subHours(now, 1) , isSender: false },
    ],
  },
  {
    id: '3',
    name: 'Kaish',
    avatar: 'https://picsum.photos/seed/avatar3/200/200',
    messages: [
      { id: 'm3', text: 'Nos vemos en el lugar de siempre', timestamp: subHours(now, 2), isSender: false },
    ],
  },
    {
    id: '4',
    name: 'Aurangjeb',
    avatar: 'https://picsum.photos/seed/avatar4/200/200',
    messages: [
      { id: 'm4', text: 'J\'arrive dans 10 minutes', timestamp: subHours(now, 3), isSender: false },
    ],
  },
  {
    id: '5',
    name: 'Ava',
    avatar: 'https://picsum.photos/seed/avatar5/200/200',
    messages: [
        { id: 'm5', text: 'Hast du den neuen Film gesehen?', timestamp: subDays(now, 1), isSender: true },
    ],
  },
  {
    id: '6',
    name: 'Liam',
    avatar: 'https://picsum.photos/seed/avatar6/200/200',
    messages: [
      { id: 'm6', text: '昨日は助けてくれてありがとう', timestamp: subDays(now, 1), isSender: false },
    ],
  },
    {
    id: '7',
    name: 'Emma',
    avatar: 'https://picsum.photos/seed/avatar7/200/200',
    messages: [
      { id: 'm7', text: 'Мы можем перенести?', timestamp: subDays(now, 2), isSender: true },
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

    