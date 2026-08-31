export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | string;
  age?: number;
  studyLevel?: string;
  organization?: string;
  department?: string;
  gender?: 'Male' | 'Female' | 'Other' | string;
  phone?: string;
  avatar?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UpdateUserDto {
  name: string;
  age?: number;
  studyLevel?: string;
  organization?: string;
  department?: string;
  gender?: string;
  phone?: string;
  bio?: string;
}

export interface ProfileStats {
  joinedRooms: number;
  completedTasks: number;
  overallProgress: number;
  totalTasks?: number;
  activeStreakDays?: number;
}
