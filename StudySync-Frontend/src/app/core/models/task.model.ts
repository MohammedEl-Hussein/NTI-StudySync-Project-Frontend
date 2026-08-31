export interface Task {
  _id?: string;
  id?: string;
  roomId: string;
  roomTitle?: string;
  title: string;
  description?: string;
  section?: string;
  due?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  createdAt?: string;
}

export interface TaskCompletion {
  _id?: string;
  id?: string;
  taskId: string;
  userId: string;
  roomId?: string;
  completed: boolean;
  completedAt?: string;
}
