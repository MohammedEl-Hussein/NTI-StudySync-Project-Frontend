import { User } from './user.model';
import { Chat } from './chat.model';

export interface MessageSender {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface Message {
  _id: string;
  chatId: string | Chat | any;
  userId: string | User | any;
  user?: MessageSender;
  content: string;
  isEdited?: boolean;
  attachments?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // UI helpers
  isPending?: boolean;
  hasError?: boolean;
}

export interface SendMessageDto {
  chatId?: string;
  roomId?: string;
  content: string;
  userId?: string;
}

export interface UpdateMessageDto {
  content: string;
}

export interface MessageResponse {
  message?: string;
  data: Message;
}

export interface MessageListResponse {
  message?: string;
  data: Message[];
}
