

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
  timestamp: Date;
  isSender: boolean;
  isStarred?: boolean;
  isEdited?: boolean;
  replyTo?: string; // ID of the message being replied to
};

export type Contact = {
  id: string;
  name: string;
  avatar: string;
  messages: Message[];
  status?: 'online' | 'offline';
  bio?: string;
  verified?: boolean;
};

export type User = {
    id: string;
    name: string;
    avatar: string;
}

export type NearbyUser = {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  connectionStatus: 'none' | 'requested' | 'connected';
};

    