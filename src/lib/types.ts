export type Message = {
  id: string;
  text: string;
  timestamp: Date;
  isSender: boolean;
};

export type Contact = {
  id: string;
  name: string;
  avatar: string;
  messages: Message[];
  status?: string;
  bio?: string;
};

export type User = {
    id: string;
    name: string;
    avatar: string;
}
