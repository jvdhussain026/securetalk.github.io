

import type { Contact } from './types';
import { subMinutes, subHours, subDays } from 'date-fns';

const now = new Date();

export const contacts: Contact[] = [
  {
    id: '1',
    name: 'Zehra',
    language: 'ur',
    avatar: 'https://picsum.photos/seed/avatar1/200/200',
    liveTranslationEnabled: true,
    messages: [
      { id: 'm1a', text: 'آپ کہاں ہیں؟', timestamp: subHours(now, 1), isSender: false },
      { id: 'm1b', text: 'میں بس پہنچ رہا ہوں۔', timestamp: subMinutes(now, 59), isSender: true },
      { id: 'm1c', text: 'ٹھیک ہے، میں انتظار کر رہی ہوں۔', timestamp: subMinutes(now, 58), isSender: false },
      { id: 'm1d', text: '5 منٹ میں وہاں ہوں گا۔', timestamp: subMinutes(now, 57), isSender: true },
    ],
  },
  {
    id: '2',
    name: 'Rehan',
    language: 'hi',
    avatar: 'https://picsum.photos/seed/avatar2/200/200',
    messages: [
      { id: 'm2a', text: 'मैं रास्ते में हूँ', timestamp: subHours(now, 1) , isSender: false },
      { id: 'm2b', text: 'ठीक है, मैं इंतजार कर रहा हूं।', timestamp: subMinutes(now, 58), isSender: true },
      { id: 'm2c', text: 'क्या तुमने खाना खाया?', timestamp: subMinutes(now, 57), isSender: false },
      { id: 'm2d', text: 'हाँ, खा लिया।', timestamp: subMinutes(now, 56), isSender: true },
    ],
  },
  {
    id: '3',
    name: 'Kaish',
    language: 'es',
    avatar: 'https://picsum.photos/seed/avatar3/200/200',
    messages: [
       { id: 'm3a', text: 'Nos vemos en el lugar de siempre', timestamp: subHours(now, 2), isSender: false },
       { id: 'm3b', text: 'Perfecto, estaré allí en 15 minutos.', timestamp: subMinutes(now, 115), isSender: true },
       { id: 'm3c', text: '¡Genial! No tardes.', timestamp: subMinutes(now, 114), isSender: false },
    ],
  },
    {
    id: '4',
    name: 'Aurangjeb',
    language: 'fr',
    avatar: 'https://picsum.photos/seed/avatar4/200/200',
    messages: [
      { id: 'm4a', text: 'J\'arrive dans 10 minutes', timestamp: subHours(now, 3), isSender: false },
      { id: 'm4b', text: 'D\'accord, je t\'attends.', timestamp: subHours(now, 3), isSender: true },
    ],
  },
  {
    id: '5',
    name: 'Ava',
    language: 'de',
    avatar: 'https://picsum.photos/seed/avatar5/200/200',
    messages: [
        { id: 'm5a', text: 'Hast du den neuen Film gesehen?', timestamp: subDays(now, 1), isSender: true },
        { id: 'm5b', text: 'Ja, habe ich! Er war unglaublich.', timestamp: subDays(now, 1), isSender: false },
        { id: 'm5c', text: 'Wirklich? Wir sollten ihn zusammen noch einmal ansehen.', timestamp: subDays(now, 1), isSender: true },
    ],
  },
  {
    id: '6',
    name: 'Liam',
    language: 'ja',
    avatar: 'https://picsum.photos/seed/avatar6/200/200',
    messages: [
      { id: 'm6a', text: '昨日は助けてくれてありがとう', timestamp: subDays(now, 1), isSender: false },
      { id: 'm6b', text: 'どういたしまして！', timestamp: subDays(now, 1), isSender: true },
    ],
  },
    {
    id: '7',
    name: 'Emma',
    language: 'ru',
    avatar: 'https://picsum.photos/seed/avatar7/200/200',
    messages: [
      { id: 'm7a', text: 'Мы можем перенести?', timestamp: subDays(now, 2), isSender: true },
      { id: 'm7b', text: 'Да, конечно. Когда тебе удобно?', timestamp: subDays(now, 2), isSender: false },
    ],
  },
  {
    id: 'support-javed',
    name: 'Javed Hussain (Support)',
    language: 'en',
    avatar: 'https://picsum.photos/seed/user/200/200',
    messages: [
      { id: 'sm1', text: 'Hello! How can I help you today?', timestamp: subMinutes(now, 5), isSender: false },
      { id: 'sm2', text: 'Hi, I was having an issue with the translation feature.', timestamp: subMinutes(now, 4), isSender: true },
    ],
    verified: true,
  },
];
