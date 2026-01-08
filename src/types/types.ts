// Project Types
export interface Project {
  id: number;
  title: string;
  goal: string;
  start_date: string;
  deadline: string | null;
  status: 'planning' | 'active' | 'completed';
  total_estimated_days: number;
  actual_days_spent: number;
  remaining_days: number;
  completed_at: string | null;
  tasks: Task[];
}

// Task Types
export interface Task {
  id: number;
  title: string;
  description: string;
  estimated_days: number;
  actual_days: number | null;
  status: 'pending' | 'in_progress' | 'blocked' | 'completed';
  order: number;
  started_at: string | null;
  completed_at: string | null;
}

export type TaskStatus = Task['status'];
export type ProjectStatus = Project['status'];

// Chat Types
export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TaskConversation {
  id: number;
  task: number;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// Timeline Update Types
export interface TimelineAdjustment {
  task_id: number;
  task_title: string;
  old_estimate: number;
  new_estimate: number;
}

export interface TimelineUpdate {
  performance_ratio: number;
  adjustments: TimelineAdjustment[];
  old_deadline: string | null;
  new_deadline: string;
  remaining_days: number;
  reasoning: string;
}

export interface TaskUpdateResponse {
  task: Task;
  message: string;
  timeline_update?: TimelineUpdate;
}

// API Response Types
export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

// Form Types
export interface CreateProjectInput {
  title: string;
  goal: string;
  deadline?: string;
}

export interface UpdateTaskStatusInput {
  status: TaskStatus;
}