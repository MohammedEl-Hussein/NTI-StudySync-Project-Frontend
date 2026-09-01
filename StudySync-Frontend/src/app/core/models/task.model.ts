export interface Task {
  _id?: string;
  id?: string;
  roomId: string;
  roomTitle?: string;
  section: string;
  title: string;
  description?: string;
  order: number;
  dueDate?: string | Date;
  isCompleted?: boolean;
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskCompletion {
  _id?: string;
  id?: string;
  taskId: string;
  userId: string;
  roomId?: string;
  completedAt?: string | Date;
}
