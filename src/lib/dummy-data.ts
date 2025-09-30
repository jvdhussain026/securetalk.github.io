

import type { Contact } from './types';
import { subMinutes, subHours, subDays } from 'date-fns';

const now = new Date();

export const contacts: Contact[] = [
  {
    id: '1',
    name: 'Zehra',
    avatar: 'https://picsum.photos/seed/avatar1/200/200',
    messages: [
      { id: 'm1a', text: 'آپ کہاں ہیں؟', timestamp: subHours(now, 1), isSender: false },
      { id: 'm1b', text: 'میں بس پہنچ رہا ہوں۔', timestamp: subMinutes(now, 59), isSender: true },
    ],
  },
  {
    id: '2',
    name: 'Rehan',
    avatar: 'https://picsum.photos/seed/avatar2/200/200',
    messages: [
      { id: 'm2a', text: 'मैं रास्ते में हूँ', timestamp: subHours(now, 1) , isSender: false },
      { id: 'm2b', text: 'ठीक है, मैं इंतजार कर रहा हूं।', timestamp: subMinutes(now, 58), isSender: true },
    ],
  },
  {
    id: '3',
    name: 'Kaish',
    avatar: 'https://picsum.photos/seed/avatar3/200/200',
    messages: [
      { id: 'm3a', text: 'Nos vemos en el lugar de siempre', timestamp: subHours(now, 2), isSender: false },
       { id: 'm3b', text: 'Perfecto, estaré allí en 15 minutos.', timestamp: subMinutes(now, 115), isSender: true },
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
        { id: 'm5a', text: 'Hast du den neuen Film gesehen?', timestamp: subDays(now, 1), isSender: true },
        { id: 'm5b', text: 'Ja, habe ich! Er war unglaublich.', timestamp: subDays(now, 1), isSender: false },
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

    
