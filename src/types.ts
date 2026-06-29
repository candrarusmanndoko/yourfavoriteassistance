export interface Profile {
  id: string;
  email: string;
  fullName: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  coverImage?: string;
  isPinned: boolean;
  tags: string[];
  updatedAt: string;
}

export interface TodoList {
  id: string;
  userId: string;
  name: string;
  isPinned: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  listId: string;
  userId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags: string[];
}
