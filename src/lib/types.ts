

export type Message = {
  id: string;
  text?: string;
  imageUrl?: string;
  timestamp: Date;
  isSender: boolean;
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

    