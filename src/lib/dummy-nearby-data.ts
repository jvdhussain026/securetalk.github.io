import type { NearbyUser } from './types';

export const nearbyUsers: NearbyUser[] = [
  {
    id: 'nearby-1',
    name: 'Alex',
    avatar: 'https://picsum.photos/seed/nearby1/200/200',
    bio: 'Looking for a coffee and a good chat.',
    connectionStatus: 'none',
  },
  {
    id: 'nearby-2',
    name: 'Mia',
    avatar: 'https://picsum.photos/seed/nearby2/200/200',
    bio: 'Web developer exploring the city.',
    connectionStatus: 'none',
  },
  {
    id: 'nearby-3',
    name: 'Chris',
    avatar: 'https://picsum.photos/seed/nearby3/200/200',
    bio: 'Musician and dog lover.',
    connectionStatus: 'requested',
  },
  {
    id: 'nearby-4',
    name: 'Jessica',
    avatar: 'https://picsum.photos/seed/nearby4/200/200',
    bio: 'Just moved here! Say hi.',
    connectionStatus: 'none',
  },
  {
    id: 'nearby-5',
    name: 'David',
    avatar: 'https://picsum.photos/seed/nearby5/200/200',
    bio: 'Photographer and traveler.',
    connectionStatus: 'none',
  },
];
