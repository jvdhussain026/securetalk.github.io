import { subMinutes, subHours, subDays } from 'date-fns';
import { contacts } from './dummy-data';

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

export const callHistory: CallRecord[] = [
  {
    id: 'call1',
    contactId: '1',
    name: 'Javed',
    avatar: 'https://picsum.photos/seed/avatar1/200/200',
    timestamp: subMinutes(now, 30),
    type: 'voice',
    direction: 'outgoing',
    status: 'online',
  },
  {
    id: 'call2',
    contactId: '2',
    name: 'Rehan',
    avatar: 'https://picsum.photos/seed/avatar2/200/200',
    timestamp: subHours(now, 1),
    type: 'video',
    direction: 'outgoing',
    status: 'offline',
  },
  {
    id: 'call3',
    contactId: '3',
    name: 'Kaish',
    avatar: 'https://picsum.photos/seed/avatar3/200/200',
    timestamp: subHours(now, 2),
    type: 'voice',
    direction: 'missed',
    status: 'online',
  },
  {
    id: 'call4',
    contactId: '4',
    name: 'Aurangjeb',
    avatar: 'https://picsum.photos/seed/avatar4/200/200',
    timestamp: subDays(now, 1),
    type: 'voice',
    direction: 'incoming',
    status: 'offline',
  },
  {
    id: 'call5',
    contactId: '5',
    name: 'Ava',
    avatar: 'https://picsum.photos/seed/avatar5/200/200',
    timestamp: subDays(now, 1),
    type: 'video',
    direction: 'outgoing',
    status: 'online',
  },
  {
    id: 'call6',
    contactId: '6',
    name: 'Liam',
    avatar: 'https://picsum.photos/seed/avatar6/200/200',
    timestamp: subDays(now, 2),
    type: 'voice',
    direction: 'missed',
    status: 'online',
  },
];