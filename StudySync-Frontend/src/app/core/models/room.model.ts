export interface Room {
  _id?: string;
  id?: string;
  title: string;
  category: string;
  level: string;
  members: number;
  maxMembers: number;
  progress: number;
  description?: string;
  creatorId?: string;
  memberCount?: number;
  totalTasks?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string | Date;
}
