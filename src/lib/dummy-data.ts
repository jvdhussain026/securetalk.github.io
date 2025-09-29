import type { Contact } from './types';
import { subMinutes, subHours, subDays } from 'date-fns';

const now = new Date();

export const contacts: Contact[] = [
  {
    id: '1',
    name: 'Alice',
    avatar: 'https://picsum.photos/seed/avatar1/200/200',
    messages: [
      { id: 'm1', text: 'Hey, how are you?', timestamp: subDays(now, 2), isSender: false },
      { id: 'm2', text: 'I am good, thanks! How about you?', timestamp: subDays(now, 2), isSender: true },
      { id: 'm3', text: 'Doing great. Working on the new project.', timestamp: subHours(now, 24), isSender: false },
      { id: 'm4', text: 'Sounds exciting!', timestamp: subHours(now, 23), isSender: true },
    ],
  },
  {
    id: '2',
    name: 'Bob',
    avatar: 'https://picsum.photos/seed/avatar2/200/200',
    messages: [
      { id: 'm5', text: 'Can we meet tomorrow?', timestamp: subHours(now, 5), isSender: false },
      { id: 'm6', text: 'Sure, what time works for you?', timestamp: subHours(now, 4), isSender: true },
    ],
  },
  {
    id: '3',
    name: 'Charlie',
    avatar: 'https://picsum.photos/seed/avatar3/200/200',
    messages: [
      { id: 'm7', text: 'Just saw your message. I will get back to you.', timestamp: subMinutes(now, 30), isSender: false },
    ],
  },
  {
    id: '4',
    name: 'Diana',
    avatar: 'https://picsum.photos/seed/avatar4/200/200',
    messages: [
        { id: 'm8', text: 'Happy Birthday!', timestamp: subDays(now, 1), isSender: true },
        { id: 'm9', text: 'Thank you so much! 😊', timestamp: subDays(now, 1), isSender: false },
    ],
  },
  {
    id: '5',
    name: 'Ethan',
    avatar: 'https://picsum.photos/seed/avatar5/200/200',
    messages: [
      { id: 'm10', text: 'The documents are ready for review.', timestamp: subHours(now, 2), isSender: false },
    ],
  },
  {
    id: '6',
    name: 'Fiona',
    avatar: 'https://picsum.photos/seed/avatar6/200/200',
    messages: [
      { id: 'm11', text: 'Let\'s catch up this weekend!', timestamp: subDays(now, 3), isSender: true },
    ],
  },
];
