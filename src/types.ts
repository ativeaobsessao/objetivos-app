export type GoalStatus = 'active' | 'completed';

export interface Goal {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: GoalStatus;
  createdAt: string; // ISO 8601
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface GoalTaskLink {
  id: string;
  goalId: string;
  taskId: string;
  createdAt: string; // ISO 8601
}

export interface GoalMark {
  id: string;
  goalId: string;
  markDate: string; // YYYY-MM-DD
  note?: string;
  createdAt: string; // ISO 8601
}

