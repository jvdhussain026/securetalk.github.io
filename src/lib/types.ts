
import type { Timestamp } from 'firebase/firestore';

export type Attachment = {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  name?: string;
  size?: string;
};

export type Message = {
  id: string;
  text?: string;
  attachments?: Attachment[];
  timestamp: Timestamp; // Using Firestore Timestamp
  senderId: string;
  isStarred?: boolean;
  isEdited?: boolean;
  replyTo?: string; // ID of the message being replied to
  deletedFor?: string[]; // Array of user UIDs who have deleted this message
};

export type Contact = {
  id:string; // This will be the user's UID
  name: string;
  avatar: string;
  language: string;
  status?: 'online' | 'offline';
  bio?: string;
  verified?: boolean;
  liveTranslationEnabled?: boolean;
  lastConnection?: string; // UID of the last user who connected with this user
  lastMessageTimestamp?: Timestamp;
  profilePictureUrl?: string;
};

export type UserProfile = {
    uid: string;
    name: string;
    avatar: string;
    bio: string;
}

export type NearbyUser = {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  connectionStatus: 'none' | 'requested' | 'connected';
};
