export interface Progress {
  _id?: string;
  id?: string;
  userId: string;
  roomId?: string;
  roomTitle?: string;
  section?: string;
  percentage: number;
  completedTasks: number;
  totalTasks: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProgressDto {
  userId: string;
  roomId?: string;
  roomTitle?: string;
  section?: string;
  percentage: number;
  completedTasks: number;
  totalTasks: number;
  notes?: string;
}

export interface UpdateProgressDto {
  section?: string;
  percentage?: number;
  completedTasks?: number;
  totalTasks?: number;
  notes?: string;
}

export interface OverallProgressData {
  completedTasks: number;
  remainingTasks: number;
  totalTasks: number;
  percentage: number;
}

export interface SectionProgressItem {
  section: string;
  percentage: number;
  completedTasks?: number;
  totalTasks?: number;
  status?: 'completed' | 'in-progress' | 'pending';
}

export interface PeerProgressItem {
  userId?: string;
  name: string;
  email?: string;
  percentage: number;
  avatar?: string;
  completedTasks?: number;
  rank?: number;
}

export interface RoomProgressData {
  roomId: string;
  roomTitle: string;
  category?: string;
  overallProgress: number;
  totalMembers?: number;
  completedTasks: number;
  totalTasks: number;
  sections: SectionProgressItem[];
  peers: PeerProgressItem[];
}
