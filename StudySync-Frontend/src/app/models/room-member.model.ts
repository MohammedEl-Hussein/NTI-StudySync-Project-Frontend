import { User } from './user.model';

export interface RoomMemberUser {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  organization?: string;
  department?: string;
  avatar?: string;
}

export interface RoomMember {
  _id?: string;
  userId: RoomMemberUser;
  role?: 'owner' | 'admin' | 'member' | string;
  progress?: number;
  joinedAt?: string | Date;
}

export interface InviteMemberDto {
  userId: string;
  email?: string;
  role?: string;
}
