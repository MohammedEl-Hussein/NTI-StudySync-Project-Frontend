import { Category } from './category.model';
import { User } from './user.model';

export interface Room {
  _id: string;
  title: string;
  categoryIds: Category[] | string[];
  level: string;
  description?: string;
  maxMembers: number;
  startDate: string;
  endDate: string;
  meetingURL?: string;
  ownerId: User | string; 
  adminIds: User[] | string[];
  createdAt?: string;
  updatedAt?: string;
  // UI & Live Chat helpers
  members?: any[];
  memberCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageRawDate?: number;
  unreadCount?: number;
  chatId?: string;
}

export interface CreateRoomDto {
  title: string;
  categoryIds: string[];
  level: string;
  description?: string;
  maxMembers: number;
  startDate: string;
  endDate: string;
  meetingURL?: string;
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {
  adminIds?: string[];
}
