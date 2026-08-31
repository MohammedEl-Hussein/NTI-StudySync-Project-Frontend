export interface Category {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SupportMessage {
  _id?: string;
  id?: string;
  userId?: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
  } | string;
  userName?: string;
  userEmail?: string;
  subject: string;
  type: string;
  content: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AdminStats {
  totalUsers: number;
  totalRooms: number;
  totalCategories: number;
  pendingSupport: number;
}
