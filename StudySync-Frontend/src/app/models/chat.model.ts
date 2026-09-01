import { Room } from './room.model';
import { User } from './user.model';

export interface Chat {
  _id: string;
  roomId: Room | string | any;
  lastMessage?: string;
  lastMessageAt?: string | Date;
  participants?: User[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateChatDto {
  roomId: string;
}

export interface ChatResponse {
  message?: string;
  data: Chat;
}

export interface ChatListResponse {
  message?: string;
  data: Chat[];
}
